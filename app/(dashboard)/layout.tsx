"use client"

import { useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { useAppStore } from "@/lib/store"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const initializeDay = useAppStore((state) => state.initializeDay)

  useEffect(() => {
    initializeDay()
  }, [initializeDay])

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col lg:pl-64">
        <DashboardHeader />
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
