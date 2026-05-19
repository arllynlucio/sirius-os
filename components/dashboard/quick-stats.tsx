"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Target, CheckCircle2, Calendar } from "lucide-react"

type QuickStatsProps = {
  completedTasks: number
  totalTasks: number
  activeGoals: number
  productiveDays: number
}

export function QuickStats({
  completedTasks,
  totalTasks,
  activeGoals,
  productiveDays,
}: QuickStatsProps) {
  const stats = [
    {
      icon: CheckCircle2,
      label: "Tarefas hoje",
      value: `${completedTasks}/${totalTasks}`,
      color: "bg-success/10 text-success",
    },
    {
      icon: Target,
      label: "Metas ativas",
      value: activeGoals.toString(),
      color: "bg-primary/10 text-primary",
    },
    {
      icon: Calendar,
      label: "Dias produtivos",
      value: productiveDays.toString(),
      color: "bg-chart-4/10 text-chart-4",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="border-border bg-card/50 backdrop-blur-sm"
        >
          <CardContent className="flex items-center gap-4 p-5">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${stat.color}`}
            >
              <stat.icon className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="text-3xl font-bold leading-none text-foreground sm:text-2xl">
                {stat.value}
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                {stat.label}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}