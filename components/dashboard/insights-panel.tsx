"use client"

import { Brain, X } from "lucide-react"

interface InsightsPanelProps {
  onClose: () => void
  tasksCompleted: number
  totalTasks: number
  activeGoals: number
  productiveDays: number
  currentStreak: number
}

export function InsightsPanel({
  onClose,
  tasksCompleted,
  totalTasks,
  activeGoals,
  productiveDays,
  currentStreak,
}: InsightsPanelProps) {
  function generateInsights() {
    const insights: string[] = []

    if (totalTasks === 0) {
      insights.push("Nenhuma tarefa criada para hoje.")
    }

    if (tasksCompleted === totalTasks && totalTasks > 0) {
      insights.push("Todas as tarefas de hoje foram concluídas.")
    }

    if (activeGoals === 0) {
      insights.push("Nenhuma meta ativa no momento.")
    }

    if (currentStreak === 0) {
      insights.push("Vamos começar uma nova sequência.")
    }

    if (productiveDays >= 7) {
      insights.push("Você está construindo constância.")
    }

    return insights
  }

  const insights = generateInsights()

  return (
    <div className="rounded-3xl border border-border bg-card/50 p-6 backdrop-blur-sm">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-primary/10 p-3">
            <Brain className="h-6 w-6 text-primary" />
          </div>

          <div>
            <h2 className="text-xl font-bold">
              Insights
            </h2>

            <p className="text-sm text-muted-foreground">
              Leitura inteligente do seu dia
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded-xl border border-border p-2 transition hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        {insights.map((item, index) => (
          <div
            key={index}
            className="flex items-start gap-3"
          >
            <div className="mt-2 h-2 w-2 rounded-full bg-primary" />

            <p className="text-sm text-muted-foreground">
              {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}