"use client"

import { Sparkles, Trash2 } from "lucide-react"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"

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
  const t = useTranslations()

  return (
    <div className="lg:w-2/5 flex flex-col">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{t("InputPanel.title")}</h3>

      <textarea
        value={logInput}
        onChange={(e) => setLogInput(e.target.value)}
        className="w-full h-64 lg:h-full resize-none bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-md p-4 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
        placeholder="sshd[1234]: Failed password for invalid user admin from 123.45.67.89 port 22 ssh2"
        aria-label={t("InputPanel.title")}
      />

      <div className="flex items-center gap-4 mt-4">
        <motion.button
          onClick={handleAnalyze}
          disabled={isLoading || !logInput.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={isLoading ? t("InputPanel.analyzingButton") : t("InputPanel.analyzeButton")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              {t("InputPanel.analyzingButton")}
            </>
          ) : (
            <>
              <Sparkles size={18} />
              {t("InputPanel.analyzeButton")}
            </>
          )}
        </motion.button>

        <motion.button
          onClick={handleClear}
          className="bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold py-2 px-4 rounded-md border border-gray-300 dark:border-gray-600 transition-colors"
          aria-label={t("InputPanel.clearButton")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Trash2 size={18} className="mr-2" />
          {t("InputPanel.clearButton")}
        </motion.button>
      </div>
    </div>
  )
}