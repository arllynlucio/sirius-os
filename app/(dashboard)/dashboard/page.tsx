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

  const handleDayChange = async (
    newDate: string
  ) => {
    setCurrentDate(newDate)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    await regenerateRoutineTasks(
      user.id,
      newDate
    )

    await loadDashboardData()
  }

  const regenerateRoutineTasks = async (
    userId: string,
    newDate: string
  ) => {
    const { data: routineTasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("type", "routine")
      .neq("date", newDate)

    if (!routineTasks?.length) return

    const uniqueTasks = Array.from(
      new Map(
        routineTasks.map((task) => [
          `${task.title}-${task.emoji}`,
          task,
        ])
      ).values()
    )

    const routinesToInsert =
  uniqueTasks.map((task) => ({
    user_id: userId,
    title: task.title,
    emoji: task.emoji,
    type: "routine",
    category: task.category,
    completed: false,
    date: newDate,
  }))

    await supabase
      .from("tasks")
      .insert(routinesToInsert)
  }

  const ensureTodayRoutineTasks = async (
  userId: string
) => {
  const today = getLocalDate()

  const { data: todayRoutines } =
    await supabase
      .from("tasks")
      .select("id")
      .eq("user_id", userId)
      .eq("type", "routine")
      .eq("date", today)

  if ((todayRoutines?.length || 0) > 0) {
    return
  }

  await regenerateRoutineTasks(
    userId,
    today
  )
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
      .eq("date", today)
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

    setTasks(
      (tasksData as DashboardTask[]) || []
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