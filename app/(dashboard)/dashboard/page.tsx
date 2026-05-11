"use client"

import { EnergySelector } from "@/components/dashboard/energy-selector"
import { TaskList } from "@/components/dashboard/task-list"
import { ProductivityRating } from "@/components/dashboard/productivity-rating"
import { StreakCard } from "@/components/dashboard/streak-card"
import { QuickStats } from "@/components/dashboard/quick-stats"

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Streak Card */}
      <StreakCard />

      {/* Quick Stats */}
      <QuickStats />

      {/* Energy Selector */}
      <EnergySelector />

      {/* Task List */}
      <TaskList />

      {/* End of Day Productivity Rating */}
      <ProductivityRating />
    </div>
  )
}
