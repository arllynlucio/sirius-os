"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

import { EnergySelector } from "@/components/dashboard/energy-selector"
import { TaskList } from "@/components/dashboard/task-list"
import { ProductivityRating } from "@/components/dashboard/productivity-rating"
import { StreakCard } from "@/components/dashboard/streak-card"
import { QuickStats } from "@/components/dashboard/quick-stats"

export type DashboardTask = {
  id: string
  title: string
  emoji: string
  type: "single" | "routine"
  completed: boolean
}

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  const [tasks, setTasks] = useState<DashboardTask[]>([])
  const [activeGoals, setActiveGoals] = useState(0)
  const [productiveDays, setProductiveDays] = useState(0)

  useEffect(() => {
    checkAuth()
  }, [])

  const getToday = () => new Date().toLocaleDateString("en-CA")

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      router.replace("/login")
      return
    }

    await loadDashboardData()
    setLoading(false)
  }

  const loadDashboardData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data: tasksData } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", getToday())
      .order("created_at", { ascending: false })

    const { data: goals } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)

    const { data: checkins } = await supabase
      .from("checkins")
      .select("*")
      .eq("user_id", user.id)

    setTasks((tasksData as DashboardTask[]) || [])
    setActiveGoals(goals?.length || 0)
    setProductiveDays(checkins?.length || 0)
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Carregando SIRIUS...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <StreakCard />

      <QuickStats
        completedTasks={tasks.filter((t) => t.completed).length}
        totalTasks={tasks.length}
        activeGoals={activeGoals}
        productiveDays={productiveDays}
      />

      <EnergySelector />

      <TaskList tasks={tasks} setTasks={setTasks} />

      <ProductivityRating />
    </div>
  )
}