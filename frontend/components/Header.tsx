"use client"

import { ShieldCheck } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import ThemeToggleButton from "./ThemeToggleButton"
import SettingsDrawer from "./SettingsDrawer"

/**
 * Componente Header - Cabeçalho fixo da aplicação
 * Exibe o título e ícone da aplicação Log Sentinel AI
 */
export default function Header() {
  return (
    <header className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <motion.div
          className="flex items-center gap-2 transition-colors duration-300 hover:text-blue-500 dark:hover:text-blue-400"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ShieldCheck size={24} className="text-blue-500 dark:text-blue-400" aria-hidden="true" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Log Sentinel AI</h1>
        </motion.div>
      </Link>

      <div className="flex items-center gap-2">
        <ThemeToggleButton />
        <SettingsDrawer />
      </div>
    </header>
  )
}