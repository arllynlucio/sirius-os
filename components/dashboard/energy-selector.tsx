"use client"

import { useAppStore, type EnergyLevel } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Zap } from "lucide-react"

const energyOptions: { value: EnergyLevel; emoji: string; label: string; description: string }[] = [
  { value: "low", emoji: "😴", label: "Baixa", description: "Cansado, precisando de energia" },
  { value: "medium", emoji: "🙂", label: "Média", description: "Normal, estável" },
  { value: "high", emoji: "⚡", label: "Alta", description: "Energizado, pronto para tudo" },
]

export function EnergySelector() {
  const todayRecord = useAppStore((state) => state.todayRecord)
  const setTodayEnergy = useAppStore((state) => state.setTodayEnergy)

  const selectedEnergy = todayRecord?.energy

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Zap className="h-5 w-5 text-primary" />
          Como está sua energia hoje?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {energyOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTodayEnergy(option.value)}
              className={cn(
                "group flex flex-col items-center gap-2 rounded-2xl p-4 transition-all duration-200",
                selectedEnergy === option.value
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-background hover:bg-background/80"
              )}
            >
              <span className="text-3xl transition-transform duration-200 group-hover:scale-110">
                {option.emoji}
              </span>
              <span className="text-sm font-medium">{option.label}</span>
              <span
                className={cn(
                  "hidden text-xs sm:block",
                  selectedEnergy === option.value
                    ? "text-primary-foreground/80"
                    : "text-muted-foreground"
                )}
              >
                {option.description}
              </span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
