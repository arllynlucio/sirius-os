"use client"

import { useAppStore } from "@/lib/store"
import { Card, CardContent } from "@/components/ui/card"
import { Target, CheckCircle2, Calendar } from "lucide-react"

export function QuickStats() {
  const todayRecord = useAppStore((state) => state.todayRecord)
  const goals = useAppStore((state) => state.goals)
  const history = useAppStore((state) => state.history)

  const completedTasks = todayRecord?.tasks.filter((t) => t.completed).length || 0
  const totalTasks = todayRecord?.tasks.length || 0
  const activeGoals = goals.length
  const productiveDays = history.filter((r) => r.productivity === "productive").length

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
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((stat, index) => (
        <Card key={index} className="border-border bg-card/50 backdrop-blur-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
