import type React from "react"
import type { Metadata } from "next"
import { Inter, Roboto_Mono } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })
const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
})

export const metadata: Metadata = {
  title: "Log Sentinel AI",
  description: "Análise inteligente de logs de segurança",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} ${robotoMono.variable} bg-gray-900 text-gray-100`}>{children}</body>
    </html>
  )
}
