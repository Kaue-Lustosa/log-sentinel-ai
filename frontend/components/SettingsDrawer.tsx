"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useTranslations, useLocale } from "next-intl"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

/**
 * Componente SettingsDrawer - Menu de configurações deslizante
 * Contém configurações de idioma e outras preferências da aplicação
 */
export default function SettingsDrawer() {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const [language, setLanguage] = useState(locale)

  const handleLanguageChange = (newLocale: string) => {
    setLanguage(newLocale)
    // Remove o locale atual do pathname e adiciona o novo
    const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/"
    router.push(`/${newLocale}${pathWithoutLocale}`)
  }

  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-gray-200 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label={t("Header.settings")}
        >
          <Menu size={20} />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 h-full w-[400px] ml-auto">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle className="text-gray-900 dark:text-white">{t("Header.settings")}</DrawerTitle>
            <DrawerDescription className="text-gray-600 dark:text-gray-400">
              {t("Header.settingsDescription")}
            </DrawerDescription>
          </DrawerHeader>

          <div className="p-4 pb-0">
            <div className="space-y-4">
              {/* Seção de Idioma */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">{t("Header.language")}</h3>
                <RadioGroup value={language} onValueChange={handleLanguageChange} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pt-BR" id="pt-BR" />
                    <Label htmlFor="pt-BR" className="text-gray-700 dark:text-gray-300">
                      {t("Languages.portuguese")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="en" id="en" />
                    <Label htmlFor="en" className="text-gray-700 dark:text-gray-300">
                      {t("Languages.english")}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline" className="border-gray-300 dark:border-gray-600 bg-transparent">
                {t("Actions.close")}
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}