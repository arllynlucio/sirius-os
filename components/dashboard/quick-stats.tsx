"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Target, CheckCircle2, Calendar } from "lucide-react"

export function QuickStats() {
  const [completedTasks, setCompletedTasks] = useState(0)
  const [totalTasks, setTotalTasks] = useState(0)
  const [activeGoals, setActiveGoals] = useState(0)
  const [productiveDays, setProductiveDays] = useState(0)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const today = new Date().toISOString().split("T")[0]

    const { data: tasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)

    const { data: goals } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)

    const { data: checkins } = await supabase
      .from("checkins")
      .select("*")
      .eq("user_id", user.id)

    if (tasks) {
      setTotalTasks(tasks.length)
      setCompletedTasks(tasks.filter((t) => t.completed).length)
    }

    if (goals) {
      setActiveGoals(goals.length)
    }

    if (checkins) {
      setProductiveDays(checkins.length)
    }
  }

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