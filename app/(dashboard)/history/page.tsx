"use client"

import { useState } from "react"
import { useAppStore, type DailyRecord, type EnergyLevel, type ProductivityRating } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Calendar, Zap, BarChart3, CheckCircle2, TrendingUp, TrendingDown, Minus } from "lucide-react"

const energyLabels: Record<EnergyLevel, { emoji: string; label: string }> = {
  low: { emoji: "😴", label: "Baixa" },
  medium: { emoji: "🙂", label: "Média" },
  high: { emoji: "⚡", label: "Alta" },
}

const productivityLabels: Record<ProductivityRating, { emoji: string; label: string; color: string }> = {
  weak: { emoji: "📉", label: "Fraco", color: "text-destructive" },
  normal: { emoji: "📊", label: "Normal", color: "text-warning" },
  productive: { emoji: "🚀", label: "Produtivo", color: "text-success" },
}

function formatDate(dateString: string): string {
  const date = new Date(dateString + "T12:00:00")
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date)
}

function formatShortDate(dateString: string): string {
  const date = new Date(dateString + "T12:00:00")
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(date)
}

function HistoryItem({ record, onClick }: { record: DailyRecord; onClick: () => void }) {
  const energy = record.energy ? energyLabels[record.energy] : null
  const productivity = record.productivity ? productivityLabels[record.productivity] : null

  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-4 rounded-xl bg-card/50 p-4 text-left transition-all duration-200 hover:bg-card"
    >
      <div className="flex h-12 w-12 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-background">
        <span className="text-sm font-bold text-foreground">
          {formatShortDate(record.date).split("/")[0]}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatShortDate(record.date).split("/")[1]}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium capitalize text-foreground">
          {formatDate(record.date).split(",")[0]}
        </p>
        <div className="mt-1 flex items-center gap-3">
          {energy && (
            <span className="text-xs text-muted-foreground">
              {energy.emoji} {energy.label}
            </span>
          )}
          {productivity && (
            <span className={cn("text-xs", productivity.color)}>
              {productivity.emoji} {productivity.label}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-full bg-background px-3 py-1.5">
        <CheckCircle2 className="h-4 w-4 text-success" />
        <span className="text-sm font-medium text-foreground">
          {record.completedTasksCount}
        </span>
      </div>
    </button>
  )
}

function HistoryStats({ history }: { history: DailyRecord[] }) {
  const totalDays = history.length
  const productiveDays = history.filter((r) => r.productivity === "productive").length
  const avgTasks = totalDays > 0
    ? Math.round(history.reduce((acc, r) => acc + r.completedTasksCount, 0) / totalDays)
    : 0
  
  // Calculate trend (comparing last 7 days with previous 7 days)
  const last7 = history.slice(0, 7)
  const prev7 = history.slice(7, 14)
  const last7Productive = last7.filter((r) => r.productivity === "productive").length
  const prev7Productive = prev7.filter((r) => r.productivity === "productive").length
  const trend = last7Productive - prev7Productive

  const stats = [
    {
      icon: Calendar,
      label: "Dias registrados",
      value: totalDays.toString(),
      color: "bg-primary/10 text-primary",
    },
    {
      icon: TrendingUp,
      label: "Dias produtivos",
      value: productiveDays.toString(),
      color: "bg-success/10 text-success",
    },
    {
      icon: CheckCircle2,
      label: "Média de tarefas/dia",
      value: avgTasks.toString(),
      color: "bg-chart-4/10 text-chart-4",
    },
    {
      icon: trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus,
      label: "Tendência semanal",
      value: trend > 0 ? `+${trend}` : trend.toString(),
      color: trend > 0 ? "bg-success/10 text-success" : trend < 0 ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className="border-border bg-card/50 backdrop-blur-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", stat.color)}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function HistoryPage() {
  const history = useAppStore((state) => state.history)
  const [selectedRecord, setSelectedRecord] = useState<DailyRecord | null>(null)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Histórico</h1>
        <p className="text-sm text-muted-foreground">
          Veja sua evolução ao longo do tempo
        </p>
      </div>

      {/* Stats */}
      <HistoryStats history={history} />

      {/* History List */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Calendar className="h-5 w-5 text-primary" />
            Registros diários
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Calendar className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Nenhum registro ainda</p>
              <p className="text-xs text-muted-foreground">
                Complete seu primeiro check-in para começar
              </p>
            </div>
          ) : (
            history.map((record) => (
              <HistoryItem
                key={record.id}
                record={record}
                onClick={() => setSelectedRecord(record)}
              />
            ))
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent className="border-border bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="capitalize text-foreground">
              {selectedRecord && formatDate(selectedRecord.date)}
            </DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4 py-4">
              {/* Energy & Productivity */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-background p-4 text-center">
                  <Zap className="mx-auto mb-2 h-5 w-5 text-warning" />
                  <p className="text-xs text-muted-foreground">Energia</p>
                  {selectedRecord.energy ? (
                    <p className="mt-1 text-lg">
                      {energyLabels[selectedRecord.energy].emoji}{" "}
                      {energyLabels[selectedRecord.energy].label}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">Não registrado</p>
                  )}
                </div>
                <div className="rounded-xl bg-background p-4 text-center">
                  <BarChart3 className="mx-auto mb-2 h-5 w-5 text-primary" />
                  <p className="text-xs text-muted-foreground">Produtividade</p>
                  {selectedRecord.productivity ? (
                    <p className={cn("mt-1 text-lg", productivityLabels[selectedRecord.productivity].color)}>
                      {productivityLabels[selectedRecord.productivity].emoji}{" "}
                      {productivityLabels[selectedRecord.productivity].label}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">Não registrado</p>
                  )}
                </div>
              </div>

              {/* Tasks Summary */}
              <div className="rounded-xl bg-background p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">Tarefas completadas</p>
                  <span className="rounded-full bg-success/10 px-2 py-0.5 text-sm font-medium text-success">
                    {selectedRecord.completedTasksCount}
                  </span>
                </div>
                {selectedRecord.tasks.length > 0 ? (
                  <div className="space-y-2">
                    {selectedRecord.tasks.map((task) => (
                      <div
                        key={task.id}
                        className={cn(
                          "flex items-center gap-2 text-sm",
                          task.completed ? "text-foreground" : "text-muted-foreground line-through"
                        )}
                      >
                        <span>{task.emoji}</span>
                        <span>{task.title}</span>
                        {task.completed && (
                          <CheckCircle2 className="ml-auto h-4 w-4 text-success" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Sem detalhes de tarefas</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
