"use client"

import {
  CheckCircle2,
  Target,
  CalendarDays,
  Flame,
  Brain,
  ChevronRight,
} from "lucide-react"

import { cn } from "@/lib/utils"

interface QuickStatsProps {
  completedTasks: number
  totalTasks: number
  activeGoals: number
  productiveDays: number
  currentStreak: number
  onToggleInsights: () => void
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
    label: "Dias Produtivos",
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
  onToggleInsights,
}: QuickStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-5">
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
            className="rounded-3xl border border-border bg-card/50 p-6 backdrop-blur-sm"
          >
            <div className="flex flex-col gap-5">
              <div
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-2xl",
                  stat.iconClass
                )}
              >
                <Icon className="h-7 w-7" />
              </div>

              <div>
                <h2 className="text-4xl font-bold leading-none">
                  {stat.value}
                </h2>

                <p className="mt-2 text-base text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            </div>
          </div>
        )
      })}

      <button
        onClick={onToggleInsights}
        className="rounded-3xl border border-border bg-card/50 p-6 text-left backdrop-blur-sm transition hover:border-primary/40 hover:bg-card"
      >
        <div className="flex h-full items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Brain className="h-7 w-7" />
            </div>

            <span className="text-2xl font-semibold">
              Insights
            </span>
          </div>

          <ChevronRight className="h-6 w-6 text-muted-foreground" />
        </div>
      </button>
    </div>
  )
}