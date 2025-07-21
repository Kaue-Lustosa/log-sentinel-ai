"use client"

import { useState, useEffect } from "react"
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
  const [loadingMessage, setLoadingMessage] = useState<string>("Analisando com IA...")

  const handleAnalyze = async () => {
    setIsLoading(true)
    setAnalysisResult(null)
    setError(null)

    // Cria um AbortController para o timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 90000) // 90 segundos de timeout

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/analyze`
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ log: logInput }),
        signal: controller.signal, // Associa o sinal do controller à requisição
      })

      // Limpa o timeout se a resposta chegar a tempo
      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.statusText}`)
      }

      const data: AnalysisResponse = await response.json()
      setAnalysisResult(data)
    } catch (err: any) {
      clearTimeout(timeoutId)
      console.error("Falha ao buscar análise:", err)
      if (err.name === "AbortError") {
        setError("O servidor de análise está demorando muito para responder. Tente novamente em alguns instantes.")
      } else {
        setError("Não foi possível conectar ao serviço de análise. Verifique se o backend está rodando.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setLogInput("")
    setAnalysisResult(null)
    setError(null)
  }

  // useEffect para alterar a mensagem após 10 segundos
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isLoading) {
      setLoadingMessage("Analisando com IA...") // Mensagem inicial
      timer = setTimeout(() => {
        setLoadingMessage("O servidor pode estar inicializando... Isso pode levar até um minuto.")
      }, 10000) // Muda a mensagem após 10 segundos
    }
    return () => clearTimeout(timer) // Limpa o timer
  }, [isLoading])

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
  )
}

export type { AnalysisResponse }