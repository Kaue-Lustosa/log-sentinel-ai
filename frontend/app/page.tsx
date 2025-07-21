'use client';

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import InputPanel from "@/components/InputPanel";
import OutputPanel from "@/components/OutputPanel";

export interface Ioc {
  type: string;
  value: string;
}
export interface AnalysisResponse {
  translation: string;
  risk_assessment: "Informativo" | "Baixo" | "Médio" | "Alto" | "Crítico";
  justification: string;
  iocs: Ioc[];
  recommendation: string;
}

export default function LogSentinelAI() {
  const [logInput, setLogInput] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>("Analisando com IA...");

  const handleAnalyze = async () => {
    setIsLoading(true);
    setAnalysisResult(null);
    setError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/analyze`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ log: logInput, language: 'pt-BR' }), // Envia pt-BR por padrão
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.statusText}`);
      }

      const data: AnalysisResponse = await response.json();
      setAnalysisResult(data);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error("Falha ao buscar análise:", err);
      if (err.name === "AbortError") {
        setError("O servidor de análise está demorando muito para responder. Tente novamente.");
      } else {
        setError("Não foi possível conectar ao serviço de análise. Verifique se o backend está rodando.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setLogInput("");
    setAnalysisResult(null);
    setError(null);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      setLoadingMessage("Analisando com IA...");
      timer = setTimeout(() => {
        setLoadingMessage("O servidor pode estar inicializando... Isso pode levar até um minuto.");
      }, 10000);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1 flex flex-col lg:flex-row gap-8 p-4 lg:p-8">
        <InputPanel
          logInput={logInput}
          setLogInput={setLogInput}
          handleAnalyze={handleAnalyze}
          handleClear={handleClear}
          isLoading={isLoading}
        />
        <OutputPanel
          isLoading={isLoading}
          analysisResult={analysisResult}
          error={error}
          loadingMessage={loadingMessage}
        />
      </main>
    </div>
  );
}