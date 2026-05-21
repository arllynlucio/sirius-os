"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Brain } from "lucide-react"

type GoalInsight = {
  title: string
  is_primary: boolean
  deadline?: string | null
  current_value: number
  target_value: number
  created_at: string
}

type InsightsCardProps = {
  completedTasks: number
  totalTasks: number
  currentStreak: number
  activeGoals: number
  goals: GoalInsight[]
}

function analyzePrimaryGoal(goal: GoalInsight) {
  if (!goal) {
    return "Nenhuma meta principal definida."
  }

  if (goal.current_value >= goal.target_value) {
    return "Sua meta principal foi concluída."
  }

  if (!goal.deadline) {
    return "Sua meta principal está ativa, mas sem prazo definido."
  }

  const today = new Date()
  const deadlineDate = new Date(`${goal.deadline}T23:59:59`)
  const createdDate = new Date(goal.created_at)

  const msPerDay = 1000 * 60 * 60 * 24

  const daysRemaining = Math.max(
    Math.ceil(
      (deadlineDate.getTime() - today.getTime()) / msPerDay
    ),
    0
  )

  const daysSinceCreation = Math.max(
    Math.ceil(
      (today.getTime() - createdDate.getTime()) / msPerDay
    ),
    1
  )

  const remaining =
    goal.target_value - goal.current_value

  const currentPace =
    goal.current_value > 0
      ? goal.current_value / daysSinceCreation
      : 0

  const projectedDays =
    currentPace > 0
      ? Math.ceil(remaining / currentPace)
      : null

  if (projectedDays === null) {
    return "Sua meta principal ainda precisa ganhar tração."
  }

  if (projectedDays < daysRemaining) {
    return "Sua meta principal está adiantada."
  }

  if (projectedDays === daysRemaining) {
    return "Sua meta principal está no ritmo."
  }

  return "Sua meta principal está atrasada."
}

function analyzePerformance(
  completedTasks: number,
  totalTasks: number
) {
  if (totalTasks === 0) {
    return "Nenhuma tarefa criada para hoje."
  }

  const percentage =
    (completedTasks / totalTasks) * 100

  if (percentage === 100) {
    return "Dia perfeito. Todas as tarefas concluídas."
  }

  if (percentage >= 80) {
    return "Excelente ritmo hoje."
  }

  if (percentage >= 50) {
    return "Bom progresso hoje."
  }

  if (percentage > 0) {
    return "Seu foco caiu hoje."
  }

  return "Nenhuma tarefa concluída hoje."
}

function analyzeStreak(currentStreak: number) {
  if (currentStreak === 0) {
    return "Vamos começar uma nova sequência."
  }

  if (currentStreak <= 3) {
    return "Você está construindo consistência."
  }

  if (currentStreak <= 7) {
    return "Ótima sequência em andamento."
  }

  return "Alto desempenho consistente."
}

export function InsightsCard({
  completedTasks,
  totalTasks,
  currentStreak,
  activeGoals,
  goals,
}: InsightsCardProps) {
  const primaryGoal =
    goals.find((goal) => goal.is_primary)

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
            <Brain className="h-5 w-5 text-primary" />
          </div>

          <div>
            <h3 className="font-semibold">
              Insights SIRIUS
            </h3>

            <p className="text-sm text-muted-foreground">
              Leitura inteligente do seu dia
            </p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <p>
            •{" "}
            {analyzePerformance(
              completedTasks,
              totalTasks
            )}
          </p>

          <p>
            • {analyzePrimaryGoal(primaryGoal as any)}
          </p>

          <p>
            • {analyzeStreak(currentStreak)}
          </p>

          <p>
            •{" "}
            {activeGoals === 0
              ? "Nenhuma meta ativa no momento."
              : activeGoals === 1
              ? "Você possui 1 meta ativa."
              : `Você possui ${activeGoals} metas ativas.`}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}