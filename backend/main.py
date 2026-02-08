import os
import json
import asyncio
import traceback
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ValidationError
from typing import List, Literal
from dotenv import load_dotenv

# --- Google & LangChain ---
import google.generativeai as genai
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document 

# --- Carregar variáveis ---
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    raise RuntimeError("Variável de ambiente GOOGLE_API_KEY não encontrada.")

# --- DIAGNÓSTICO INICIAL (Para ver no Log do Render) ---
try:
    print("--- INICIANDO DIAGNÓSTICO DO GOOGLE GENAI ---")
    genai.configure(api_key=GOOGLE_API_KEY)
    # Lista modelos para garantir que a chave funciona e vê o que está disponível
    available_models = []
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            available_models.append(m.name)
            print(f"Modelo Disponível: {m.name}")
    print("--- FIM DO DIAGNÓSTICO ---")
except Exception as e:
    print(f"ERRO CRÍTICO AO LISTAR MODELOS: {e}")

# --- CONFIGURAÇÃO DA IA ---
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=GOOGLE_API_KEY,
    transport="rest", 
    temperature=0.2
)

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
    recommendation: List[str] = Field(description="Lista de ações recomendadas. Cada item da lista deve ser um passo claro e separado.")

# --- Configuração da Aplicação FastAPI ---
app = FastAPI(title="Log Sentinel AI API", version="1.0.0")

origins = [
    "http://localhost", "http://localhost:3000",
    "https://log-sentinel-ai.vercel.app",
]
vercel_preview_regex = r"https:\/\/log-sentinel-ai-.*-kauelustosas-projects\.vercel\.app"

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_origin_regex=vercel_preview_regex,
    allow_credentials=True, 
    allow_methods=["*"], 
    allow_headers=["*"],
)

# --- Constantes e Text Splitter ---
CHUNK_SIZE = 4000
CHUNK_OVERLAP = 500
text_splitter = RecursiveCharacterTextSplitter(chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP)

# --- Configuração dos Parsers e Chains ---
partial_parser = PydanticOutputParser(pydantic_object=PartialAnalysis)
final_parser = PydanticOutputParser(pydantic_object=FinalAnalysis)

analysis_prompt = PromptTemplate(
    template="""Analise o trecho de log a seguir. Foque APENAS no trecho fornecido.\n{format_instructions}\n### TRECHO DE LOG ###\n{log_chunk}""",
    input_variables=["log_chunk"],
    partial_variables={"format_instructions": partial_parser.get_format_instructions()},
)

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

analysis_chain = analysis_prompt | llm | partial_parser
synthesis_chain = synthesis_prompt | llm | final_parser

# --- Endpoints ---
@app.api_route("/", methods=["GET", "HEAD"], tags=["Health Check"])
def read_root():
    return {"status": "ok"}

@app.post("/api/analyze", response_model=FinalAnalysis, tags=["Analysis"])
async def analyze_log(request: LogRequest):
    print(f"Recebido log de {len(request.log)} caracteres para análise.")
    
    try:
        # 1. Divisão
        chunks = text_splitter.split_text(request.log)
        print(f"Log dividido em {len(chunks)} chunk(s) pelo LangChain.")
        
        # 2. Análise Parcial (Executa em paralelo)
        print("Iniciando análises parciais...")
        partial_analysis_tasks = [analysis_chain.ainvoke({"log_chunk": chunk}) for chunk in chunks]
        partial_analyses_results = await asyncio.gather(*partial_analysis_tasks, return_exceptions=True)
        
        # Filtra sucessos
        successful_analyses = [res for res in partial_analyses_results if not isinstance(res, Exception)]
        
        # Loga erros individuais se houver
        for res in partial_analyses_results:
            if isinstance(res, Exception):
                print(f"ERRO EM UM CHUNK: {res}")

        if not successful_analyses:
            raise HTTPException(status_code=500, detail="Todas as análises de chunks falharam. Verifique os logs do servidor.")

        # Prepara para síntese
        if len(successful_analyses) == 1:
            analysis_for_synthesis = [{"analysis": successful_analyses[0].dict()}]
        else:
            analysis_for_synthesis = [res.dict() for res in successful_analyses]

        partial_analyses_json_str = json.dumps(analysis_for_synthesis, indent=2, default=str)
        
        # 3. Síntese Final
        print("Iniciando a fase de síntese...")
        final_result = await synthesis_chain.ainvoke({"partial_analyses": partial_analyses_json_str})
        
        print("Análise concluída com sucesso!")
        return final_result

    except Exception as e:
        print("========================================")
        print("ERRO FATAL NO PROCESSAMENTO:")
        print(traceback.format_exc())
        print("========================================")
        raise HTTPException(status_code=500, detail=f"Erro interno no processamento: {str(e)}")