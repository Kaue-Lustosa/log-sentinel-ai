import { ShieldCheck } from "lucide-react"
import ThemeToggleButton from "./ThemeToggleButton"

/**
 * Componente Header - Cabeçalho fixo da aplicação
 * Exibe o título e ícone da aplicação Log Sentinel AI
 */
export default function Header() {
  return (
    <header className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <ShieldCheck size={24} className="text-blue-500 dark:text-blue-400" aria-hidden="true" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Log Sentinel AI</h1>
      </div>
      <ThemeToggleButton />
    </header>
  )
}