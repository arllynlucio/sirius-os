"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { getLocalDate } from "@/lib/date"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { BarChart3 } from "lucide-react"
import { toast } from "sonner"

const productivityOptions = [
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
    value: "great",
    emoji: "🚀",
    label: "Muito produtivo",
    description: "Dia incrível",
    color: "bg-success text-success-foreground",
  },
]

type ProductivityRatingProps = {
  onProductivityChanged: () => Promise<void>
}

export function ProductivityRating({
  onProductivityChanged,
}: ProductivityRatingProps) {
  const [selectedProductivity, setSelectedProductivity] =
    useState<string | null>(null)

  useEffect(() => {
    loadToday()
  }, [])

  const loadToday = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data } = await supabase
      .from("checkins")
      .select("id, productivity")
      .eq("user_id", user.id)
      .eq("checkin_date", getLocalDate())
      .maybeSingle()

    setSelectedProductivity(data?.productivity || null)
  }

  const handleSelect = async (value: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const today = getLocalDate()

    const nextValue =
      selectedProductivity === value
        ? null
        : value

    const { data: tasksData } = await supabase
      .from("tasks")
      .select("id")
      .eq("user_id", user.id)
      .eq("date", today)
      .eq("completed", true)

    const completedTasks =
      tasksData?.length || 0

    const { data: goalsData } = await supabase
      .from("goals")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "completed")

    const completedGoals =
      goalsData?.length || 0

    const { data: existingCheckin } =
      await supabase
        .from("checkins")
        .select("*")
        .eq("user_id", user.id)
        .eq("checkin_date", today)
        .maybeSingle()

    if (existingCheckin) {
      await supabase
        .from("checkins")
        .update({
          productivity: nextValue,
          completed_tasks: completedTasks,
          completed_goals: completedGoals,
        })
        .eq("id", existingCheckin.id)
    } else if (nextValue) {
      await supabase
        .from("checkins")
        .insert({
          user_id: user.id,
          checkin_date: today,
          productivity: nextValue,
          completed_tasks: completedTasks,
          completed_goals: completedGoals,
        })
    }

    setSelectedProductivity(nextValue)

    await onProductivityChanged()

    if (nextValue === "great") {
      toast.success(
        "Parabéns pelo dia incrível!"
      )
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
              onClick={() =>
                handleSelect(option.value)
              }
              className={cn(
                "group flex flex-col items-center gap-2 rounded-2xl p-4 transition-all duration-200",
                selectedProductivity ===
                  option.value
                  ? `${option.color} shadow-lg`
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
                  selectedProductivity ===
                    option.value
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