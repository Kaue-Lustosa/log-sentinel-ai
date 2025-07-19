import { ShieldCheck } from "lucide-react"

/**
 * Componente Header - Cabeçalho fixo da aplicação
 * Exibe o título e ícone da aplicação Log Sentinel AI
 */
export default function Header() {
  return (
    <header className="bg-gray-800 p-4 border-b border-gray-700 flex items-center gap-2">
      <ShieldCheck size={24} className="text-blue-400" aria-hidden="true" />
      <h1 className="text-xl font-bold">Log Sentinel AI</h1>
    </header>
  )
}
