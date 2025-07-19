"use client"

import { useState } from "react"
import Header from "@/components/Header"
import InputPanel from "@/components/InputPanel"
import OutputPanel from "@/components/OutputPanel"

interface Ioc {
  type: string
  value: string
}

interface AnalysisResponse {
  translation: string
  risk_assessment: "Informativo" | "Baixo" | "Médio" | "Alto" | "Crítico"
  justification: string
  iocs: Ioc[]
  recommendation: string
}

/**
 * Componente principal da aplicação Log Sentinel AI
 * Gerencia todo o estado da aplicação e orquestra a comunicação entre componentes
 */
export default function LogSentinelAI() {
  const [logInput, setLogInput] = useState<string>("")
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Função para analisar o log enviado pelo usuário
   * Simula uma chamada para API do backend FastAPI
   */
  const handleAnalyze = async () => {
    setIsLoading(true)
    setAnalysisResult(null)
    setError(null)

    try {
      const response = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ log: logInput }),
      })

      if (!response.ok) {
        throw new Error("A resposta da rede não foi bem-sucedida.")
      }

      const data: AnalysisResponse = await response.json()
      setAnalysisResult(data)
    } catch (err) {
      setError("Não foi possível conectar ao serviço de análise. Verifique se o backend está rodando.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setLogInput("")
    setAnalysisResult(null)
    setError(null)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col lg:flex-row gap-8 p-4 lg:p-8">
        <InputPanel
          logInput={logInput}
          setLogInput={setLogInput}
          handleAnalyze={handleAnalyze}
          handleClear={handleClear}
          isLoading={isLoading}
        />
        <OutputPanel isLoading={isLoading} analysisResult={analysisResult} error={error} />
      </main>
    </div>
  )
}

export type { AnalysisResponse }