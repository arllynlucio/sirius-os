"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { getLocalDate } from "@/lib/date"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Zap } from "lucide-react"

const energyOptions = [
  {
    value: "low",
    emoji: "😴",
    label: "Baixa",
    description: "Cansado",
  },
  {
    value: "medium",
    emoji: "🙂",
    label: "Média",
    description: "Estável",
  },
  {
    value: "high",
    emoji: "⚡",
    label: "Alta",
    description: "Energizado",
  },
]

export function EnergySelector() {
  const [selectedEnergy, setSelectedEnergy] =
    useState<string | null>(null)

  useEffect(() => {
    loadTodayCheckin()
  }, [])

  const loadTodayCheckin = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data } = await supabase
      .from("checkins")
      .select("energy")
      .eq("user_id", user.id)
      .eq("checkin_date", getLocalDate())
      .maybeSingle()

    setSelectedEnergy(data?.energy || null)
  }

  const saveEnergy = async (energy: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const today = getLocalDate()
    const nextValue =
      selectedEnergy === energy ? null : energy

    const { data: existingCheckin } = await supabase
      .from("checkins")
      .select("*")
      .eq("user_id", user.id)
      .eq("checkin_date", today)
      .maybeSingle()

    if (existingCheckin) {
      await supabase
        .from("checkins")
        .update({
          energy: nextValue,
        })
        .eq("id", existingCheckin.id)
    } else if (nextValue) {
      await supabase
        .from("checkins")
        .insert({
          user_id: user.id,
          checkin_date: today,
          energy: nextValue,
        })
    }

    setSelectedEnergy(nextValue)
  }

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
              onClick={() => saveEnergy(option.value)}
              className={cn(
                "group flex flex-col items-center gap-2 rounded-2xl p-4 transition-all duration-200",
                selectedEnergy === option.value
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-background hover:bg-background/80"
              )}
            >
              <span className="text-3xl">
                {option.emoji}
              </span>

              <span className="text-sm font-medium">
                {option.label}
              </span>

              <span
                className={cn(
                  "hidden text-xs sm:block",
                  selectedEnergy === option.value
                    ? "opacity-80"
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