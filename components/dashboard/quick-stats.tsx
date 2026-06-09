"use client"

import {
  CheckCircle2,
  Target,
  CalendarDays,
  Flame,
} from "lucide-react"

import { cn } from "@/lib/utils"

interface QuickStatsProps {
  completedTasks: number
  totalTasks: number
  activeGoals: number
  productiveDays: number
  currentStreak: number
}

const stats = (
  completedTasks: number,
  totalTasks: number,
  activeGoals: number,
  productiveDays: number,
  currentStreak: number
) => [
  {
    label: "Tarefas",
    value: `${completedTasks}/${totalTasks}`,
    icon: CheckCircle2,
    iconClass:
      "bg-green-500/10 text-green-500",
  },
  {
    label: "Metas",
    value: activeGoals,
    icon: Target,
    iconClass:
      "bg-blue-500/10 text-blue-500",
  },
  {
    label: "Dias",
    value: productiveDays,
    icon: CalendarDays,
    iconClass:
      "bg-purple-500/10 text-purple-500",
  },
  {
    label: "Sequência",
    value: currentStreak,
    icon: Flame,
    iconClass:
      "bg-orange-500/10 text-orange-500",
  },
]

export function QuickStats({
  completedTasks,
  totalTasks,
  activeGoals,
  productiveDays,
  currentStreak,
}: QuickStatsProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {stats(
        completedTasks,
        totalTasks,
        activeGoals,
        productiveDays,
        currentStreak
      ).map((stat) => {
        const Icon = stat.icon

        return (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card/50 p-3 backdrop-blur-sm"
          >
            <div className="flex flex-col gap-3">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg",
                  stat.iconClass
                )}
              >
                <Icon className="h-4 w-4" />
              </div>

              <div>
                <h2 className="text-2xl font-bold leading-none">
                  {stat.value}
                </h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}