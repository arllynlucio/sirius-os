"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import {
  getLocalDate,
  getMonthReference,
  isFirstDayOfMonth,
} from "@/lib/date"
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

export function ProductivityRating() {
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

    const today = getLocalDate()

    const { data } = await supabase
      .from("checkins")
      .select("productivity")
      .eq("user_id", user.id)
      .eq("checkin_date", today)
      .maybeSingle()

    if (data?.productivity) {
      setSelectedProductivity(data.productivity)
    } else {
      setSelectedProductivity(null)
    }
  }

  const evaluateStreak = async (userId: string) => {
    const today = getLocalDate()
    const currentMonth = getMonthReference()

    const { data: tasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("date", today)

    const totalTasks = tasks?.length || 0
    const completedTasks =
      tasks?.filter((task) => task.completed).length || 0

    if (totalTasks === 0 || completedTasks !== totalTasks) {
      return
    }

    const { data: streak } = await supabase
      .from("streaks")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()

    if (!streak) {
      await supabase.from("streaks").insert({
        user_id: userId,
        current_streak: 1,
        longest_streak: 1,
        perfect_days: 1,
        failed_days: 0,
        month_reference: currentMonth,
        last_qualified_date: today,
      })

      return
    }

    if (streak.last_qualified_date === today) {
      return
    }

    if (streak.month_reference !== currentMonth || isFirstDayOfMonth()) {
      await supabase
        .from("streaks")
        .update({
          current_streak: 1,
          longest_streak: Math.max(streak.longest_streak || 0, 1),
          perfect_days: 1,
          failed_days: 0,
          month_reference: currentMonth,
          last_qualified_date: today,
        })
        .eq("user_id", userId)

      return
    }

    const nextStreak = (streak.current_streak || 0) + 1
    const nextLongest = Math.max(streak.longest_streak || 0, nextStreak)

    await supabase
      .from("streaks")
      .update({
        current_streak: nextStreak,
        longest_streak: nextLongest,
        perfect_days: (streak.perfect_days || 0) + 1,
        last_qualified_date: today,
      })
      .eq("user_id", userId)
  }

  const handleSelect = async (value: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const today = getLocalDate()

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
          productivity: value,
        })
        .eq("id", existingCheckin.id)
    } else {
      await supabase
        .from("checkins")
        .insert({
          user_id: user.id,
          checkin_date: today,
          productivity: value,
        })
    }

    await evaluateStreak(user.id)

    setSelectedProductivity(value)

    if (value === "great") {
      toast.success("Parabéns pelo dia incrível!")
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
              <span className="text-3xl">{option.emoji}</span>
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
      </CardContent>
    </Card>
  )
}