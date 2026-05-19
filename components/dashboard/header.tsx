"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Flame, LogOut } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDashboard } from "@/components/dashboard/dashboard-context"

export function DashboardHeader() {
  const router = useRouter()
  const { currentStreak } = useDashboard()

  const [userName, setUserName] = useState("Usuário")

  const today = new Date()

  const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  const formattedDate = dateFormatter.format(today)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const displayName =
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Usuário"

    setUserName(displayName)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const getGreeting = () => {
    const hour = today.getHours()

    if (hour < 12) return "Bom dia"
    if (hour < 18) return "Boa tarde"
    return "Boa noite"
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="min-w-0 pl-12 lg:pl-0">
          <h1 className="truncate text-base font-semibold text-foreground sm:text-lg">
            {getGreeting()}, {userName.split(" ")[0]}!
          </h1>

          <p className="truncate text-xs capitalize text-muted-foreground sm:text-sm">
            {formattedDate}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1 rounded-full bg-warning/10 px-3 py-2 sm:gap-2 sm:px-4">
            <Flame className="h-4 w-4 text-warning sm:h-5 sm:w-5" />

            <span className="font-bold text-warning">
              {currentStreak}
            </span>

            <span className="hidden text-sm text-warning/80 md:inline">
              dias
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg border border-border px-2 py-2 text-sm hover:bg-muted sm:px-3"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>

          <Avatar className="h-8 w-8 border-2 border-border sm:h-9 sm:w-9">
            <AvatarFallback className="bg-primary/10 text-primary">
              {userName[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}