"use client"

import { useState } from "react"
import { MessageSquareText, ShieldAlert, Crosshair, ClipboardCheck, ClipboardCopy, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { AnalysisResponse } from "@/app/page"
import { motion } from "framer-motion"

interface ResultDisplayProps {
  analysisResult: AnalysisResponse
}

/**
 * Componente ResultDisplay - Exibe os resultados da análise usando componentes Shadcn/UI
 * Renderiza 4 cards: Tradução, Risco, IoCs e Recomendação
 */
export default function ResultDisplay({ analysisResult }: ResultDisplayProps) {
  const [copiedValue, setCopiedValue] = useState<string | null>(null)

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case "Crítico":
      case "Alto":
        return "destructive"
      case "Médio":
        return "default"
      case "Baixo":
        return "secondary"
      case "Informativo":
        return "outline"
      default:
        return "outline"
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

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Card 1: Tradução */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <MessageSquareText className="text-blue-400" size={20} />
            Tradução do Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 leading-relaxed">{analysisResult.translation}</p>
        </CardContent>
      </Card>

      {/* Card 2: Nível de Risco */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <ShieldAlert className="text-orange-400" size={20} />
            Nível de Risco
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Badge variant={getRiskBadgeVariant(analysisResult.risk_assessment) as any} className="text-sm font-medium">
              {analysisResult.risk_assessment}
            </Badge>
            <p className="text-gray-300 text-sm leading-relaxed">
              <strong>Justificativa:</strong> {analysisResult.justification}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Indicadores de Comprometimento (IoCs) */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Crosshair className="text-red-400" size={20} />
            Indicadores de Comprometimento (IoCs)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analysisResult.iocs.length === 0 ? (
            <p className="text-gray-400">Nenhum IoC encontrado.</p>
          ) : (
            <div className="space-y-2">
              {analysisResult.iocs.map((ioc, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-gray-900 p-3 rounded border border-gray-600"
                >
                  <div>
                    <span className="text-sm text-gray-400">{ioc.type}:</span>
                    <span className="ml-2 font-mono text-gray-200">{ioc.value}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(ioc.value)}
                    className="text-gray-400 hover:text-gray-200 h-8 w-8 p-0"
                    aria-label={`Copiar ${ioc.type}: ${ioc.value}`}
                  >
                    {copiedValue === ioc.value ? (
                      <Check size={16} className="text-green-400" />
                    ) : (
                      <ClipboardCopy size={16} />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card 4: Recomendação */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <ClipboardCheck className="text-green-400" size={20} />
            Recomendação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 leading-relaxed">{analysisResult.recommendation}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}