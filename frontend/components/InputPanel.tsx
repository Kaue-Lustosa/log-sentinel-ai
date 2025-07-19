"use client"

import { Sparkles, Trash2 } from "lucide-react"

interface InputPanelProps {
  logInput: string
  setLogInput: (value: string) => void
  handleAnalyze: () => void
  handleClear: () => void
  isLoading: boolean
}

/**
 * Componente InputPanel - Área de entrada de dados
 * Contém a textarea para inserção de logs e botões de ação
 */
export default function InputPanel({ logInput, setLogInput, handleAnalyze, handleClear, isLoading }: InputPanelProps) {
  return (
    <div className="lg:w-2/5 flex flex-col">
      <h3 className="text-xl font-semibold mb-4">Cole o Log para Análise</h3>

      <textarea
        value={logInput}
        onChange={(e) => setLogInput(e.target.value)}
        className="w-full h-64 lg:h-full resize-none bg-gray-950 border border-gray-700 rounded-md p-4 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
        placeholder="sshd[1234]: Failed password for invalid user admin from 123.45.67.89 port 22 ssh2"
        aria-label="Área de texto para inserir logs para análise"
      />

      <div className="flex items-center gap-4 mt-4">
        <button
          onClick={handleAnalyze}
          disabled={isLoading || !logInput.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={isLoading ? "Analisando log..." : "Analisar log inserido"}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Analisando...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Analisar
            </>
          )}
        </button>

        <button
          onClick={handleClear}
          className="bg-transparent hover:bg-gray-700 text-gray-300 font-bold py-2 px-4 rounded-md border border-gray-600 transition-colors"
          aria-label="Limpar dados inseridos"
        >
          <Trash2 size={18} className="mr-2" />
          Limpar
        </button>
      </div>
    </div>
  )
}
