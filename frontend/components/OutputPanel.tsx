"use client"

import { Search, ShieldAlert } from "lucide-react"
import { useTranslations } from "next-intl"
import ResultDisplay from "./ResultDisplay"
import SkeletonLoader from "./SkeletonLoader"
import type { AnalysisResponse } from "@/app/[locale]/page"

interface OutputPanelProps {
  isLoading: boolean
  analysisResult: AnalysisResponse | null
  error: string | null
  loadingMessage: string
}

/**
 * Componente OutputPanel - Área de exibição de resultados
 * Renderiza condicionalmente: estado inicial, loading ou resultados
 */
export default function OutputPanel({ isLoading, analysisResult, error, loadingMessage }: OutputPanelProps) {
  const t = useTranslations()

  // Estado de carregamento
  if (isLoading) {
    return (
      <div className="lg:w-3/5">
        <SkeletonLoader loadingMessage={loadingMessage} />
      </div>
    )
  }

  // Estado com erro
  if (error) {
    return (
      <div className="lg:w-3/5 flex flex-col items-center justify-center h-full text-center text-red-500 dark:text-red-400 p-8 border-2 border-dashed border-red-300 dark:border-red-700 rounded-lg">
        <ShieldAlert size={48} className="text-red-500 dark:text-red-500 mb-4" />
        <h4 className="text-lg font-semibold mt-4 text-gray-900 dark:text-white">{t("OutputPanel.errorTitle")}</h4>
        <p className="mt-2 text-gray-700 dark:text-gray-300">{error}</p>
      </div>
    )
  }

  // Estado com resultados
  if (analysisResult) {
    return (
      <div className="lg:w-3/5">
        <ResultDisplay analysisResult={analysisResult} />
      </div>
    )
  }

  // Estado inicial (padrão)
  return (
    <div className="lg:w-3/5 flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-500 p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
      <Search size={48} className="text-gray-400 dark:text-gray-600" aria-hidden="true" />
      <h4 className="text-lg font-semibold mt-4 text-gray-900 dark:text-white">{t("OutputPanel.initialTitle")}</h4>
      <p className="mt-2 text-gray-600 dark:text-gray-400">{t("OutputPanel.initialDescription")}</p>
    </div>
  )
}