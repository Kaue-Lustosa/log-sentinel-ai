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
from langchain.prompts import PromptTemplate
from langchain.output_parsers import PydanticOutputParser
from langchain.text_splitter import RecursiveCharacterTextSplitter

# --- Carregar variáveis e configurar a IA ---
load_dotenv()
try:
    api_key = os.environ["GOOGLE_API_KEY"]
    if not api_key:
        raise KeyError
    model = ChatGoogleGenerativeAI(model="gemini-1.5-flash-latest", google_api_key=api_key, temperature=0)
except KeyError:
    raise RuntimeError("Variável de ambiente GOOGLE_API_KEY não encontrada ou está vazia.")

# --- Modelos de Dados (Pydantic) ---
class LogRequest(BaseModel):
    log: str = Field(..., min_length=10, description="O texto do log a ser analisado.")
    # NOVO CAMPO: Adicionamos o idioma com um valor padrão
    language: str = Field(default='pt-BR', description="O idioma para a resposta da IA (ex: 'pt-BR', 'en').")

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
    recommendation: str = Field(description="Recomendação clara e acionável com base no cenário completo.")

# --- Configuração da Aplicação FastAPI ---
app = FastAPI(title="Log Sentinel AI API", version="1.0.0")

# Configuração de CORS para Produção e Previews
origins = [
    "http://localhost",
    "http://localhost:3000",
    "https://log-sentinel-ai.vercel.app",
]
vercel_preview_regex = r"https:\/\/log-sentinel-ai-.*-kauelustosas-projects\.vercel\.app"
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=vercel_preview_regex,
    allow_credentials=True,
    allow_methods=["GET", "POST", "HEAD", "OPTIONS"],
    allow_headers=["*"],
)

# --- Constantes e Text Splitter ---
CHUNK_SIZE = 4000
CHUNK_OVERLAP = 500
text_splitter = RecursiveCharacterTextSplitter(chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP)

# --- Configuração dos Parsers e Chains do LangChain ---
partial_parser = PydanticOutputParser(pydantic_object=PartialAnalysis)
final_parser = PydanticOutputParser(pydantic_object=FinalAnalysis)

# NOVO TEMPLATE: Adicionamos a variável {language}
analysis_prompt = PromptTemplate(
    template="""Analise o trecho de log a seguir. Responda no seguinte idioma: {language}.\n{format_instructions}\n### TRECHO DE LOG ###\n{log_chunk}""",
    input_variables=["log_chunk", "language"], # Adicionamos a nova variável
    partial_variables={"format_instructions": partial_parser.get_format_instructions()},
)

# NOVO TEMPLATE: Adicionamos a variável {language}
synthesis_prompt = PromptTemplate(
    template="""Você recebeu análises parciais de um log. Consolide-as em um relatório final coeso. Responda no seguinte idioma: {language}.\n{format_instructions}\n### ANÁLISES PARCIAIS ###\n{partial_analyses}""",
    input_variables=["partial_analyses", "language"], # Adicionamos a nova variável
    partial_variables={"format_instructions": final_parser.get_format_instructions()},
)

analysis_chain = analysis_prompt | model | partial_parser
synthesis_chain = synthesis_prompt | model | final_parser

# --- Endpoints da API ---
@app.api_route("/", methods=["GET", "HEAD"], tags=["Health Check"])
def read_root():
    return {"status": "ok"}

@app.post("/api/analyze", response_model=FinalAnalysis, tags=["Analysis"])
async def analyze_log(request: LogRequest):
    log_text = request.log
    language = request.language # Captura o idioma da requisição
    print(f"Recebido log de {len(log_text)} caracteres para análise no idioma: {language}.")
    
    chunks = text_splitter.split_text(log_text)
    print(f"Log dividido em {len(chunks)} chunk(s) pelo LangChain.")
    
    if len(chunks) == 1:
        try:
            # Passa o idioma para a chain
            partial_result = await analysis_chain.ainvoke({"log_chunk": chunks[0], "language": language})
            final_data = FinalAnalysis(
                translation=partial_result.translation,
                risk_assessment=partial_result.risk_assessment,
                justification="Análise de um único trecho de log.",
                iocs=partial_result.iocs,
                recommendation="Verificar o log completo para mais contexto ou fornecer mais dados."
            )
            return final_data
        except Exception as e:
            print(f"Erro ao analisar chunk único com LangChain: {e}")
            raise HTTPException(status_code=500, detail="Falha ao analisar o log.")

    # Passa o idioma para cada task de análise
    partial_analysis_tasks = [analysis_chain.ainvoke({"log_chunk": chunk, "language": language}) for chunk in chunks]
    partial_analyses_results = await asyncio.gather(*partial_analysis_tasks, return_exceptions=True)
    
    successful_analyses = [res for res in partial_analyses_results if not isinstance(res, Exception)]
    if not successful_analyses:
        raise HTTPException(status_code=500, detail="Todas as análises de chunks falharam.")

    partial_analyses_json_str = json.dumps([res.dict() for res in successful_analyses], indent=2)
    
    print(f"Iniciando a fase de síntese no idioma: {language}...")
    try:
        # Passa o idioma para a chain de síntese
        final_result = await synthesis_chain.ainvoke({"partial_analyses": partial_analyses_json_str, "language": language})
        return final_result
    except Exception as e:
        print(f"Erro na fase de síntese com LangChain: {e}")
        raise HTTPException(status_code=500, detail="Falha ao consolidar os resultados da análise.")