"use client"

import { useAppStore } from "@/lib/store"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Flame } from "lucide-react"

export function DashboardHeader() {
  const user = useAppStore((state) => state.user)
  const currentStreak = useAppStore((state) => state.currentStreak)

  const today = new Date()
  const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
  const formattedDate = dateFormatter.format(today)

  const getGreeting = () => {
    const hour = today.getHours()
    if (hour < 12) return "Bom dia"
    if (hour < 18) return "Boa tarde"
    return "Boa noite"
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-xl lg:px-6">
      <div className="pl-12 lg:pl-0">
        <h1 className="text-lg font-semibold text-foreground">
          {getGreeting()}, {user?.name?.split(" ")[0] || "Usuário"}!
        </h1>
        <p className="text-sm capitalize text-muted-foreground">{formattedDate}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Streak Badge */}
        <div className="flex items-center gap-2 rounded-full bg-warning/10 px-4 py-2">
          <Flame className="h-5 w-5 text-warning" />
          <span className="font-bold text-warning">{currentStreak}</span>
          <span className="hidden text-sm text-warning/80 sm:inline">dias</span>
        </div>

        {/* Avatar */}
        <Avatar className="h-9 w-9 border-2 border-border">
          <AvatarFallback className="bg-primary/10 text-primary">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
