"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
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
  const [language, setLanguage] = useState("pt-BR")

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-gray-200 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Abrir configurações"
        >
          <Menu size={20} />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle className="text-gray-900 dark:text-white">Configurações</DrawerTitle>
            <DrawerDescription className="text-gray-600 dark:text-gray-400">
              Ajuste suas preferências da aplicação aqui.
            </DrawerDescription>
          </DrawerHeader>

          <div className="p-4 pb-0">
            <div className="space-y-4">
              {/* Seção de Idioma */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Idioma</h3>
                <RadioGroup value={language} onValueChange={setLanguage} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pt-BR" id="pt-BR" />
                    <Label htmlFor="pt-BR" className="text-gray-700 dark:text-gray-300">
                      Português (BR)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="en" id="en" />
                    <Label htmlFor="en" className="text-gray-700 dark:text-gray-300">
                      English
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline" className="border-gray-300 dark:border-gray-600 bg-transparent">
                Fechar
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}