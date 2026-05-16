"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getLocalDate } from "@/lib/date"

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
  const [currentDate, setCurrentDate] = useState(getLocalDate())

  const [tasks, setTasks] = useState<DashboardTask[]>([])
  const [activeGoals, setActiveGoals] = useState(0)
  const [productiveDays, setProductiveDays] = useState(0)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = getLocalDate()

      if (now !== currentDate) {
        handleDayChange(now)
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [currentDate])

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

  const handleDayChange = async (newDate: string) => {
    setCurrentDate(newDate)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    await regenerateRoutineTasks(user.id, newDate)
    await loadDashboardData()
  }

  const regenerateRoutineTasks = async (
    userId: string,
    newDate: string
  ) => {
    const yesterdayTasksDate = currentDate

    const { data: routineTasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("date", yesterdayTasksDate)
      .eq("type", "routine")

    if (!routineTasks?.length) return

    const routinesToInsert = routineTasks.map((task) => ({
      user_id: userId,
      title: task.title,
      emoji: task.emoji,
      type: "routine",
      completed: false,
      date: newDate,
    }))

    await supabase.from("tasks").insert(routinesToInsert)
  }

  const loadDashboardData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const today = getLocalDate()

    const { data: tasksData } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
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