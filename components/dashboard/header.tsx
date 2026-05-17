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
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-xl lg:px-6">
      <div className="pl-12 lg:pl-0">
        <h1 className="text-lg font-semibold text-foreground">
          {getGreeting()}, {userName.split(" ")[0]}!
        </h1>

        <p className="text-sm capitalize text-muted-foreground">
          {formattedDate}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-full bg-warning/10 px-4 py-2">
          <Flame className="h-5 w-5 text-warning" />

          <span className="font-bold text-warning">
            {currentStreak}
          </span>

          <span className="hidden text-sm text-warning/80 sm:inline">
            dias
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>

        <Avatar className="h-9 w-9 border-2 border-border">
          <AvatarFallback className="bg-primary/10 text-primary">
            {userName[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}