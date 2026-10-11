"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { supabase } from "@/lib/supabase"
import {
  getLocalDate,
  getMonthReference,
} from "@/lib/date"

import { useDashboard } from "@/components/dashboard/dashboard-context"

import { EnergySelector } from "@/components/dashboard/energy-selector"
import { TaskList } from "@/components/dashboard/task-list"
import { ProductivityRating } from "@/components/dashboard/productivity-rating"
import { QuickStats } from "@/components/dashboard/quick-stats"

export type DashboardTask = {
  id: string
  title: string
  emoji: string
  type: "single" | "routine"
  completed: boolean
  category?: "personal" | "professional"
  original_date?: string
  completed_at?: string | null
  date?: string
  routine_days?: number[] | null
}

type DashboardGoal = {
  id: string
  title: string
  is_primary: boolean
  deadline?: string | null
  current_value: number
  target_value: number
  created_at: string
}

export default function DashboardPage() {
  const router = useRouter()

  const {
    currentStreak,
    setCurrentStreak,
    triggerRefresh,
  } = useDashboard()

  const [loading, setLoading] = useState(true)

  const [currentDate, setCurrentDate] =
    useState(getLocalDate())

  const [tasks, setTasks] = useState<
    DashboardTask[]
  >([])

  const [goals, setGoals] = useState<
    DashboardGoal[]
  >([])

  const [activeGoals, setActiveGoals] =
    useState(0)

  const [productiveDays, setProductiveDays] =
    useState(0)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    const checkLocalDate = () => {
      const localDate = getLocalDate()
      if (localDate !== currentDate) void handleDayChange(localDate)
    }
    const interval = setInterval(checkLocalDate, 10000)
    window.addEventListener("focus", checkLocalDate)
    document.addEventListener("visibilitychange", checkLocalDate)
    return () => {
      clearInterval(interval)
      window.removeEventListener("focus", checkLocalDate)
      document.removeEventListener("visibilitychange", checkLocalDate)
    }
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

  const evaluateStreak = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const today = getLocalDate()
    const currentMonth = getMonthReference()

    const { data: tasksData } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)

    const totalTasks = tasksData?.length || 0

    const completedTasks =
      tasksData?.filter(
        (task) => task.completed
      ).length || 0

    const { data: checkin } = await supabase
      .from("checkins")
      .select("productivity")
      .eq("user_id", user.id)
      .eq("checkin_date", today)
      .maybeSingle()

    const { data: allCheckins } = await supabase
      .from("checkins")
      .select("productivity")
      .eq("user_id", user.id)

    setProductiveDays(
      allCheckins?.filter(
        (item) =>
          item.productivity &&
          item.productivity.trim() !== ""
      ).length || 0
    )

    const validDay =
      totalTasks > 0 &&
      completedTasks === totalTasks &&
      checkin?.productivity !== null &&
      checkin?.productivity !== undefined

    const { data: streak } = await supabase
      .from("streaks")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()

    if (!streak) {
      if (!validDay) {
        setCurrentStreak(0)
        triggerRefresh()
        return
      }

      await supabase.from("streaks").insert({
        user_id: user.id,
        current_streak: 1,
        longest_streak: 1,
        perfect_days: 1,
        failed_days: 0,
        month_reference: currentMonth,
        last_qualified_date: today,
      })

      setCurrentStreak(1)
      triggerRefresh()
      return
    }

    if (
      streak.month_reference !== currentMonth
    ) {
      if (!validDay) {
        await supabase
          .from("streaks")
          .update({
            current_streak: 0,
            perfect_days: 0,
            failed_days: 0,
            month_reference: currentMonth,
            last_qualified_date: null,
          })
          .eq("user_id", user.id)

        setCurrentStreak(0)
        triggerRefresh()
        return
      }

      await supabase
        .from("streaks")
        .update({
          current_streak: 1,
          longest_streak:
            streak.longest_streak || 1,
          perfect_days: 1,
          failed_days: 0,
          month_reference: currentMonth,
          last_qualified_date: today,
        })
        .eq("user_id", user.id)

      setCurrentStreak(1)
      triggerRefresh()
      return
    }

    if (!validDay) {
      if (
        streak.last_qualified_date === today
      ) {
        const fallback = Math.max(
          (streak.current_streak || 1) - 1,
          0
        )

        await supabase
          .from("streaks")
          .update({
            current_streak: fallback,
            perfect_days: Math.max(
              (streak.perfect_days || 1) - 1,
              0
            ),
            last_qualified_date: null,
          })
          .eq("user_id", user.id)

        setCurrentStreak(fallback)
        triggerRefresh()
        return
      }

      setCurrentStreak(
        streak.current_streak || 0
      )

      triggerRefresh()
      return
    }

    if (
      streak.last_qualified_date === today
    ) {
      setCurrentStreak(
        streak.current_streak || 0
      )

      triggerRefresh()
      return
    }

    const nextStreak =
      (streak.current_streak || 0) + 1

    const nextLongest = Math.max(
      streak.longest_streak || 0,
      nextStreak
    )

    await supabase
      .from("streaks")
      .update({
        current_streak: nextStreak,
        longest_streak: nextLongest,
        perfect_days:
          (streak.perfect_days || 0) + 1,
        last_qualified_date: today,
      })
      .eq("user_id", user.id)

    setCurrentStreak(nextStreak)
    triggerRefresh()
  }

  const handleDayChange = async (newDate: string) => {
    setCurrentDate(newDate)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await ensureTodayRoutineTasks(user.id)
    await loadDashboardData()
  }

  const regenerateRoutineTasks = async (userId: string, newDate: string) => {
    if (newDate !== getLocalDate()) return
    const targetWeekday = new Date(`${newDate}T12:00:00`).getDay()
    const { data: routineTasks, error: routineError } = await supabase
      .from("tasks").select("*").eq("user_id", userId)
      .eq("type", "routine")
      .order("date", { ascending: false })
    if (routineError || !routineTasks?.length) return

    const { data: todayRoutines, error: todayError } = await supabase
      .from("tasks").select("title, emoji").eq("user_id", userId)
      .eq("type", "routine").eq("date", newDate)
    if (todayError) return

    const existingKeys = new Set((todayRoutines || []).map(
      (task) => `${task.title}::${task.emoji}`
    ))
    const latestTemplates = new Map<string, any>()
    for (const task of routineTasks) {
      const key = `${task.title}::${task.emoji}`
      if (!latestTemplates.has(key)) latestTemplates.set(key, task)
    }

    const routinesToInsert = Array.from(latestTemplates.entries())
      .filter(([key, task]) => {
        const days = Array.isArray(task.routine_days) && task.routine_days.length
          ? task.routine_days : [0, 1, 2, 3, 4, 5, 6]
        return !existingKeys.has(key) && days.includes(targetWeekday)
      })
      .map(([, task]) => ({
        user_id: userId, title: task.title, emoji: task.emoji,
        type: "routine", category: task.category, completed: false,
        date: newDate, original_date: newDate, completed_at: null,
        scheduled_time: task.scheduled_time || null,
        reminder_enabled: task.reminder_enabled || false,
        reminder_minutes_before: task.reminder_minutes_before || 15,
        last_reminder_sent: null, late_reminder_sent: null,
        routine_days: Array.isArray(task.routine_days) && task.routine_days.length
          ? task.routine_days : [0, 1, 2, 3, 4, 5, 6],
      }))
    if (routinesToInsert.length) await supabase.from("tasks").insert(routinesToInsert)
  }

  const ensureTodayRoutineTasks = async (userId: string) => {
    await regenerateRoutineTasks(userId, getLocalDate())
  }

  const loadDashboardData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    await ensureTodayRoutineTasks(user.id)

    const today = getLocalDate()
    const currentMonth = getMonthReference()

    const { data: tasksData } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      })

    const { data: goalsData } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)

    const { data: checkins } = await supabase
      .from("checkins")
      .select("*")
      .eq("user_id", user.id)

    const { data: streak } = await supabase
      .from("streaks")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()

    const todayWeekday = new Date(`${today}T12:00:00`).getDay()

    const filteredTasks = (tasksData || []).filter((task) => {
      if (task.type === "routine") {
        if (task.date !== today) return false
        const routineDays = Array.isArray(task.routine_days) && task.routine_days.length
          ? task.routine_days : [0, 1, 2, 3, 4, 5, 6]
        return routineDays.includes(todayWeekday)
      }
      // Tarefas concluídas devem ser agrupadas pela data local da conclusão,
      // não pela data original da tarefa. Isso mantém tarefas atrasadas concluídas
      // hoje visíveis até a virada do dia.
      if (task.completed) {
        const completionDate = task.completed_at
          ? (() => {
              const completedAt = new Date(task.completed_at)
              const year = completedAt.getFullYear()
              const month = String(completedAt.getMonth() + 1).padStart(2, "0")
              const day = String(completedAt.getDate()).padStart(2, "0")
              return `${year}-${month}-${day}`
            })()
          : task.date

        if (completionDate !== today) return false
      }

      // Tarefas pendentes antigas continuam visíveis para que possam ser concluídas.
      return true
    })

    setTasks(
      filteredTasks as DashboardTask[]
    )

    setGoals(
      (goalsData as DashboardGoal[]) || []
    )

    setActiveGoals(goalsData?.length || 0)

    setProductiveDays(
      checkins?.filter(
        (checkin) =>
          checkin.productivity !== null
      ).length || 0
    )

    if (
      !streak ||
      streak.month_reference !== currentMonth
    ) {
      setCurrentStreak(0)
    } else {
      setCurrentStreak(
        streak.current_streak || 0
      )
    }

    triggerRefresh()
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">
          Carregando SIRIUS...
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <QuickStats
        completedTasks={
          tasks.filter((t) => t.completed)
            .length
        }
        totalTasks={tasks.length}
        activeGoals={activeGoals}
        productiveDays={productiveDays}
        currentStreak={currentStreak}
      />

      <EnergySelector />

      <TaskList
        tasks={tasks}
        setTasks={setTasks}
        onTasksChanged={evaluateStreak}
      />

      <ProductivityRating
        onProductivityChanged={
          evaluateStreak
        }
      />
    </div>
  )
}