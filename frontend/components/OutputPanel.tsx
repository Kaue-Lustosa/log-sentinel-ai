import { Search, ShieldAlert } from "lucide-react"
import ResultDisplay from "./ResultDisplay"
import SkeletonLoader from "./SkeletonLoader"
import type { AnalysisResponse } from "@/app/page"

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
      <div className="lg:w-3/5 flex flex-col items-center justify-center h-full text-center text-red-400 p-8 border-2 border-dashed border-red-700 rounded-lg">
        <ShieldAlert size={48} className="text-red-500 mb-4" />
        <h4 className="text-lg font-semibold mt-4">Erro na Análise</h4>
        <p className="mt-2">{error}</p>
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
    <div className="lg:w-3/5 flex flex-col items-center justify-center h-full text-center text-gray-500 p-8 border-2 border-dashed border-gray-700 rounded-lg">
      <Search size={48} className="text-gray-600" aria-hidden="true" />
      <h4 className="text-lg font-semibold mt-4">Aguardando Análise</h4>
      <p className="mt-2">Aguardando um log para análise.</p>
    </div>
  )
}