import os
import json
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ValidationError
from typing import List, Literal
from dotenv import load_dotenv

# --- Importações do LangChain ---
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from langchain_text_splitters import RecursiveCharacterTextSplitter

# --- Carregar variáveis e configurar a IA ---
load_dotenv()
try:
    api_key = os.environ["GOOGLE_API_KEY"]
    if not api_key:
        raise KeyError
    model = ChatGoogleGenerativeAI(model="gemini-1.5-flash-latest", google_api_key=api_key, temperature=0.1)
except KeyError:
    raise RuntimeError("Variável de ambiente GOOGLE_API_KEY não encontrada ou está vazia.")

# --- Modelos de Dados (Pydantic) ---
class LogRequest(BaseModel):
    log: str = Field(..., min_length=10, description="O texto do log a ser analisado.")

class Ioc(BaseModel):
    type: str = Field(description="O tipo do IoC (ex: ip, domain, hash).")
    value: str = Field(description="O valor do IoC.")

class PartialAnalysis(BaseModel):
    translation: str = Field(description="Descrição do que o trecho de log significa.")
    risk_assessment: Literal["Informativo", "Baixo", "Médio", "Alto", "Crítico"] = Field(description="Avaliação de risco do trecho.")
    iocs: List[Ioc] = Field(description="Lista de IoCs encontrados no trecho.")

class FinalAnalysis(BaseModel):
    translation: str = Field(description="Narrativa coesa que resume a história completa.")
    risk_assessment: Literal["Informativo", "Baixo", "Médio", "Alto", "Crítico"] = Field(description="Nível de risco geral para o evento completo.")
    justification: str = Field(description="Justificativa para a avaliação de risco geral.")
    iocs: List[Ioc] = Field(description="Lista única de todos os IoCs encontrados, sem duplicatas.")
    recommendation: str = Field(description="Plano de ação passo a passo claro e acionável.")

# --- Configuração da Aplicação FastAPI ---
app = FastAPI(title="Log Sentinel AI API", version="1.0.0")

origins = [
    "http://localhost", "http://localhost:3000",
    "https://log-sentinel-ai.vercel.app",
]
vercel_preview_regex = r"https:\/\/log-sentinel-ai-.*-kauelustosas-projects\.vercel\.app"
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, allow_origin_regex=vercel_preview_regex,
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

# --- Constantes e Text Splitter ---
CHUNK_SIZE = 4000
CHUNK_OVERLAP = 500
text_splitter = RecursiveCharacterTextSplitter(chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP)

# --- Configuração dos Parsers e Chains do LangChain ---
partial_parser = PydanticOutputParser(pydantic_object=PartialAnalysis)
final_parser = PydanticOutputParser(pydantic_object=FinalAnalysis)

analysis_prompt = PromptTemplate(
    template="""Analise o trecho de log a seguir. Foque APENAS no trecho fornecido.\n{format_instructions}\n### TRECHO DE LOG ###\n{log_chunk}""",
    input_variables=["log_chunk"],
    partial_variables={"format_instructions": partial_parser.get_format_instructions()},
)

# --- PROMPT DE SÍNTESE APRIMORADO ---
synthesis_prompt = PromptTemplate(
    template="""Você é um Analista Sênior de Operações de Segurança (SecOps) e Forense Digital. Sua tarefa é analisar logs para identificar a causa raiz de um problema, que pode ser um incidente de segurança, um erro de configuração, ou um problema de software. Sua análise final deve ser coesa e não mencionar que o log foi dividido em partes.

### ANÁLISES PARCIAIS ###
{partial_analyses}

### TAREFAS FINAIS ###
1.  **Tradução Final (`translation`):** Crie uma narrativa coesa que resuma a história completa do evento.
2.  **Avaliação de Risco Geral (`risk_assessment`):** Determine um único nível de risco geral. Se for um ataque claro, o risco é 'Crítico' ou 'Alto'. Se for um erro de build ou configuração, o risco é 'Médio' ou 'Baixo'. Se for um log informativo, o risco é 'Informativo'.
3.  **Justificativa Final (`justification`):** Explique o porquê do risco, identificando o tipo de problema (ex: "Erro de configuração no build", "Tentativa de acesso não autorizado").
4.  **Lista de IoCs Consolidada (`iocs`):** Compile uma lista única de todos os IoCs, removendo duplicatas. Se for um erro de software, os IoCs podem ser nomes de arquivos ou módulos problemáticos.
5.  **Plano de Ação (`recommendation`):** Forneça uma recomendação em formato de plano de ação com passos numerados. A recomendação deve ser específica para o problema encontrado. Se for um erro de build, foque em depuração. Se for um ataque, foque em contenção, investigação e erradicação.

{format_instructions}
""",
    input_variables=["partial_analyses"],
    partial_variables={"format_instructions": final_parser.get_format_instructions()},
)

analysis_chain = analysis_prompt | model | partial_parser
synthesis_chain = synthesis_prompt | model | final_parser

# --- Endpoints da API ---
# ... (O resto do seu código, a partir de @app.api_route, continua o mesmo)
@app.api_route("/", methods=["GET", "HEAD"], tags=["Health Check"])
def read_root():
    return {"status": "ok"}

@app.post("/api/analyze", response_model=FinalAnalysis, tags=["Analysis"])
async def analyze_log(request: LogRequest):
    log_text = request.log
    print(f"Recebido log de {len(log_text)} caracteres para análise.")
    chunks = text_splitter.split_text(log_text)
    print(f"Log dividido em {len(chunks)} chunk(s) pelo LangChain.")
    
    partial_analysis_tasks = [analysis_chain.ainvoke({"log_chunk": chunk}) for chunk in chunks]
    partial_analyses_results = await asyncio.gather(*partial_analysis_tasks, return_exceptions=True)
    
    successful_analyses = [res for res in partial_analyses_results if not isinstance(res, Exception)]
    if not successful_analyses:
        raise HTTPException(status_code=500, detail="Todas as análises de chunks falharam.")

    if len(successful_analyses) == 1:
        analysis_for_synthesis = [{"analysis": successful_analyses[0].dict()}]
    else:
        analysis_for_synthesis = [res.dict() for res in successful_analyses]

    partial_analyses_json_str = json.dumps(analysis_for_synthesis, indent=2)
    
    print("Iniciando a fase de síntese com LangChain...")
    try:
        final_result = await synthesis_chain.ainvoke({"partial_analyses": partial_analyses_json_str})
        return final_result
    except Exception as e:
        print(f"Erro na fase de síntese com LangChain: {e}")
        raise HTTPException(status_code=500, detail="Falha ao consolidar os resultados da análise.")