"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Target, CheckCircle2, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

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
  const router = useRouter()

  const stats = [
    {
      icon: CheckCircle2,
      label: "Tarefas",
      value: `${completedTasks}/${totalTasks}`,
      color: "bg-success/10 text-success",
    },
    {
      icon: Target,
      label: "Metas",
      value: activeGoals.toString(),
      color: "bg-primary/10 text-primary",
      action: () => router.push("/goals"),
    },
    {
      icon: Calendar,
      label: "Produtivos",
      value: productiveDays.toString(),
      color: "bg-chart-4/10 text-chart-4",
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat, index) => {
        const clickable = !!stat.action

        return (
          <Card
            key={index}
            onClick={stat.action}
            className={cn(
              "border-border bg-card/50 backdrop-blur-sm",
              clickable &&
                "cursor-pointer transition-all hover:border-primary/40 hover:bg-card"
            )}
          >
            <CardContent className="flex flex-col items-center justify-center gap-2 p-3 sm:flex-row sm:justify-start sm:p-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.color}`}
              >
                <stat.icon className="h-4 w-4" />
              </div>

              <div className="text-center sm:text-left">
                <p className="text-lg font-bold leading-none text-foreground sm:text-2xl">
                  {stat.value}
                </p>

                <p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">
                  {stat.label}
                </p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}