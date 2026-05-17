"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Flame, TrendingUp } from "lucide-react"

type StreakCardProps = {
  currentStreak: number
}

export function StreakCard({ currentStreak }: StreakCardProps) {
  return (
    <Card className="relative overflow-hidden border-warning/20 bg-gradient-to-br from-warning/10 via-card to-card">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-warning/10 blur-2xl" />

      <CardContent className="relative flex items-center justify-between p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warning/20">
            <Flame className="h-7 w-7 text-warning" />
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Streak mensal
            </p>

            <p className="text-3xl font-bold text-foreground">
              {currentStreak}{" "}
              <span className="text-lg font-normal text-muted-foreground">
                dias
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-success/10 px-3 py-1.5">
          <TrendingUp className="h-4 w-4 text-success" />
          <span className="text-sm font-medium text-success">
            Em progresso
          </span>
        </div>
      </CardContent>
    </Card>
  )
}