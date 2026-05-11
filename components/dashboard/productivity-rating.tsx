"use client"

import { useAppStore, type ProductivityRating as ProductivityRatingType } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { BarChart3 } from "lucide-react"
import { toast } from "sonner"

const productivityOptions: {
  value: ProductivityRatingType
  emoji: string
  label: string
  description: string
  color: string
}[] = [
  {
    value: "weak",
    emoji: "📉",
    label: "Fraco",
    description: "Dia difícil",
    color: "bg-destructive text-destructive-foreground",
  },
  {
    value: "normal",
    emoji: "📊",
    label: "Normal",
    description: "Dia comum",
    color: "bg-warning text-warning-foreground",
  },
  {
    value: "productive",
    emoji: "🚀",
    label: "Muito produtivo",
    description: "Dia incrível",
    color: "bg-success text-success-foreground",
  },
]

export function ProductivityRating() {
  const todayRecord = useAppStore((state) => state.todayRecord)
  const setTodayProductivity = useAppStore((state) => state.setTodayProductivity)

  const selectedProductivity = todayRecord?.productivity

  const handleSelect = (value: ProductivityRatingType) => {
    setTodayProductivity(value)
    
    if (value === "productive") {
      toast.success("Parabéns pelo dia produtivo! Continue assim!")
    } else if (value === "normal") {
      toast("Dia registrado! Amanhã será melhor ainda.")
    } else {
      toast("Tudo bem, dias difíceis acontecem. Descanse e volte mais forte!")
    }
  }

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <BarChart3 className="h-5 w-5 text-primary" />
          Como foi sua produtividade hoje?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {productivityOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={cn(
                "group flex flex-col items-center gap-2 rounded-2xl p-4 transition-all duration-200",
                selectedProductivity === option.value
                  ? `${option.color} shadow-lg`
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
                  selectedProductivity === option.value
                    ? "opacity-80"
                    : "text-muted-foreground"
                )}
              >
                {option.description}
              </span>
            </button>
          ))}
        </div>
        {selectedProductivity && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Dia registrado! Você pode alterar sua avaliação a qualquer momento.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
