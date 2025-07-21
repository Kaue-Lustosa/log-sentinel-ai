"use client"

import { useState } from "react"
import { MessageSquareText, ShieldAlert, Crosshair, ClipboardCheck, ClipboardCopy, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import type { AnalysisResponse } from "@/app/[locale]/page"
import { motion } from "framer-motion"

interface ResultDisplayProps {
  analysisResult: AnalysisResponse
}

/**
 * Componente ResultDisplay - Exibe os resultados da análise usando componentes Shadcn/UI
 * Renderiza 4 cards: Tradução, Risco, IoCs e Recomendação
 */
export default function ResultDisplay({ analysisResult }: ResultDisplayProps) {
  const t = useTranslations()
  const [copiedValue, setCopiedValue] = useState<string | null>(null)

  const getRiskBadgeClasses = (riskLevel: string) => {
    switch (riskLevel) {
      case "Crítico":
        return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400 border-red-200 dark:border-red-500/30 border"
      case "Alto":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-400 border-orange-200 dark:border-orange-500/30 border"
      case "Médio":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30 border"
      case "Baixo":
        return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400 border-green-200 dark:border-green-500/30 border"
      case "Informativo":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 border"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 border"
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedValue(text)
      setTimeout(() => setCopiedValue(null), 2000)
    } catch (err) {
      console.error("Erro ao copiar para clipboard:", err)
    }
  }

  // Variantes de animação para a lista de IoCs
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Card 1: Tradução */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
            <MessageSquareText className="text-blue-500 dark:text-blue-400" size={20} />
            {t("OutputPanel.translationTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{analysisResult.translation}</p>
        </CardContent>
      </Card>

      {/* Card 2: Nível de Risco */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
            <ShieldAlert className="text-orange-500 dark:text-orange-400" size={20} />
            {t("OutputPanel.riskTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
            >
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getRiskBadgeClasses(analysisResult.risk_assessment)}`}
              >
                {analysisResult.risk_assessment}
              </span>
            </motion.div>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              <strong>Justificativa:</strong> {analysisResult.justification}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Indicadores de Comprometimento (IoCs) */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
            <Crosshair className="text-red-500 dark:text-red-400" size={20} />
            {t("OutputPanel.iocsTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analysisResult.iocs.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">{t("OutputPanel.noIocs")}</p>
          ) : (
            <motion.div className="space-y-2" variants={containerVariants} initial="hidden" animate="visible">
              {analysisResult.iocs.map((ioc, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-600"
                >
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{ioc.type}:</span>
                    <span className="ml-2 font-mono text-gray-900 dark:text-gray-200">{ioc.value}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(ioc.value)}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 h-8 w-8 p-0"
                    aria-label={`${t("Actions.copy")} ${ioc.type}: ${ioc.value}`}
                  >
                    {copiedValue === ioc.value ? (
                      <Check size={16} className="text-green-500 dark:text-green-400" />
                    ) : (
                      <ClipboardCopy size={16} />
                    )}
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Card 4: Recomendação */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
            <ClipboardCheck className="text-green-500 dark:text-green-400" size={20} />
            {t("OutputPanel.recommendationTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{analysisResult.recommendation}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}