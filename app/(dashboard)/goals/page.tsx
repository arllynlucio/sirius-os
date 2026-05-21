"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useGoals } from "@/contexts/goals-context"
import { Goal } from "@/types/goals"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Plus,
  Trash2,
  Pencil,
  Calendar,
  Crown,
  TrendingUp,
  Target,
  Clock3,
  Brain,
} from "lucide-react"

import { toast } from "sonner"
import { cn } from "@/lib/utils"

type GoalProgressEvent = {
  id: string
  goal_id: string
  delta: number
  created_at: string
  source_type: string
  event_type: string
}

type GoalAnalytics = {
  progress: number
  daysRemaining: number | null
  requiredPerDay: number | null
  projectedDays: number | null
  status: string
  statusLabel: string
  statusColor: string
}

const emojiOptions = [
  "🎯",
  "📖",
  "🏋️",
  "💰",
  "💼",
  "🚀",
  "🎓",
  "🏠",
  "❤️",
  "🌍",
  "✨",
  "🔥",
]

function prioridadeLabel(priority: string) {
  switch (priority) {
    case "low":
      return "Baixa"
    case "medium":
      return "Média"
    case "high":
      return "Alta"
    case "critical":
      return "Crítica"
    default:
      return priority
  }
}

function acompanhamentoLabel(mode: string) {
  switch (mode) {
    case "manual":
      return "Manual"
    case "automatic":
      return "Automático"
    case "hybrid":
      return "Híbrido"
    default:
      return mode
  }
}

function calcularAnalytics(
  goal: Goal,
  history: GoalProgressEvent[]
): GoalAnalytics {
  const today = new Date()

  const progress =
    goal.target_value > 0
      ? (goal.current_value / goal.target_value) * 100
      : 0

  if (goal.current_value >= goal.target_value) {
    return {
      progress,
      daysRemaining: 0,
      requiredPerDay: 0,
      projectedDays: 0,
      status: "concluido",
      statusLabel: "Concluído",
      statusColor:
        "bg-blue-500/10 text-blue-500 border-blue-500/20",
    }
  }

  if (!goal.deadline) {
    return {
      progress,
      daysRemaining: null,
      requiredPerDay: null,
      projectedDays: null,
      status: "sem-prazo",
      statusLabel: "Sem prazo",
      statusColor: "bg-muted text-muted-foreground",
    }
  }

  const deadlineDate = new Date(`${goal.deadline}T23:59:59`)
  const msPerDay = 1000 * 60 * 60 * 24

  const daysRemaining = Math.max(
    Math.ceil(
      (deadlineDate.getTime() - today.getTime()) /
        msPerDay
    ),
    0
  )

  const remainingValue =
    goal.target_value - goal.current_value

  const requiredPerDay =
    daysRemaining > 0
      ? remainingValue / daysRemaining
      : remainingValue

  if (!history.length) {
    return {
      progress,
      daysRemaining,
      requiredPerDay,
      projectedDays: null,
      status: "sem-historico",
      statusLabel: "Sem histórico",
      statusColor:
        "bg-muted text-muted-foreground",
    }
  }

  const sortedHistory = [...history].sort(
    (a, b) =>
      new Date(a.created_at).getTime() -
      new Date(b.created_at).getTime()
  )

  const firstEventDate = new Date(
    sortedHistory[0].created_at
  )

  const daysTracked = Math.max(
    Math.ceil(
      (today.getTime() - firstEventDate.getTime()) /
        msPerDay
    ),
    1
  )

  const totalProgress = sortedHistory.reduce(
    (sum, item) => sum + Number(item.delta),
    0
  )

  if (totalProgress <= 0) {
    return {
      progress,
      daysRemaining,
      requiredPerDay,
      projectedDays: null,
      status: "sem-historico",
      statusLabel: "Sem ritmo",
      statusColor:
        "bg-muted text-muted-foreground",
    }
  }

  const realPace = totalProgress / daysTracked

  const projectedDays =
    realPace > 0
      ? Math.ceil(remainingValue / realPace)
      : null

  let status = "atrasado"
  let statusLabel = "Atrasado"
  let statusColor =
    "bg-red-500/10 text-red-500 border-red-500/20"

  if (projectedDays !== null) {
    if (projectedDays < daysRemaining) {
      status = "adiantado"
      statusLabel = "Adiantado"
      statusColor =
        "bg-green-500/10 text-green-500 border-green-500/20"
    } else if (projectedDays === daysRemaining) {
      status = "ritmo"
      statusLabel = "No ritmo"
      statusColor =
        "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
    }
  }

  return {
    progress,
    daysRemaining,
    requiredPerDay,
    projectedDays,
    status,
    statusLabel,
    statusColor,
  }
}

function EditGoalDialog({
  goal,
  updateGoal,
}: {
  goal: Goal
  updateGoal: any
}) {
  const [open, setOpen] = useState(false)

  const [emoji, setEmoji] = useState(goal.emoji || "🎯")
  const [title, setTitle] = useState(goal.title)
  const [targetValue, setTargetValue] = useState(
    goal.target_value.toString()
  )
  const [unit, setUnit] = useState(goal.unit)
  const [priority, setPriority] = useState(goal.priority)
  const [trackingMode, setTrackingMode] = useState(goal.tracking_mode)
  const [deadline, setDeadline] = useState(goal.deadline || "")
  const [isPrimary, setIsPrimary] = useState(goal.is_primary)

  async function handleSave() {
    await updateGoal(goal.id, {
      emoji,
      title,
      target_value: Number(targetValue),
      unit,
      priority,
      tracking_mode: trackingMode,
      deadline: deadline || null,
      is_primary: isPrimary,
    })

    toast.success("Meta atualizada")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="outline">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar meta</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <Label>Emoji</Label>

            <div className="mt-3 flex flex-wrap gap-2">
              {emojiOptions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setEmoji(item)}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl border text-xl",
                    emoji === item
                      ? "border-primary bg-primary/20"
                      : "border-border"
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nome da meta"
          />

          <Input
            type="number"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            placeholder="Objetivo"
          />

          <Input
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="Unidade"
          />

          <div>
            <Label>Prazo</Label>

            <Input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div>
            <Label>Prioridade</Label>

            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Acompanhamento</Label>

            <Select
              value={trackingMode}
              onValueChange={setTrackingMode}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="automatic">Automático</SelectItem>
                <SelectItem value="hybrid">Híbrido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label>Meta principal</Label>

            <Switch
              checked={isPrimary}
              onCheckedChange={setIsPrimary}
            />
          </div>

          <Button className="w-full" onClick={handleSave}>
            Salvar alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function GoalsPage() {
  const {
    goals,
    loading,
    createGoal,
    deleteGoal,
    updateGoal,
    updateManualProgress,
    setPrimaryGoal,
  } = useGoals()

  const [goalHistory, setGoalHistory] = useState<
    Record<string, GoalProgressEvent[]>
  >({})

  const [isOpen, setIsOpen] = useState(false)

  const [emoji, setEmoji] = useState("🎯")
  const [title, setTitle] = useState("")
  const [targetValue, setTargetValue] = useState("")
  const [unit, setUnit] = useState("páginas")
  const [priority, setPriority] = useState("medium")
  const [trackingMode, setTrackingMode] = useState("manual")
  const [deadline, setDeadline] = useState("")
  const [isPrimary, setIsPrimary] = useState(false)

  useEffect(() => {
    loadGoalHistory()
  }, [goals])

  async function loadGoalHistory() {
    if (!goals.length) return

    const goalIds = goals.map((goal) => goal.id)

    const { data } = await supabase
      .from("goal_progress_events")
      .select("*")
      .in("goal_id", goalIds)

    const grouped: Record<string, GoalProgressEvent[]> = {}

    ;(data || []).forEach((event) => {
      if (!grouped[event.goal_id]) {
        grouped[event.goal_id] = []
      }

      grouped[event.goal_id].push(
        event as GoalProgressEvent
      )
    })

    setGoalHistory(grouped)
  }

  async function handleCreateGoal() {
    await createGoal({
      emoji,
      title,
      target_value: Number(targetValue),
      unit,
      priority,
      tracking_mode: trackingMode,
      deadline: deadline || null,
      is_primary: isPrimary,
    })

    toast.success("Meta criada")

    setEmoji("🎯")
    setTitle("")
    setTargetValue("")
    setUnit("páginas")
    setPriority("medium")
    setTrackingMode("manual")
    setDeadline("")
    setIsPrimary(false)
    setIsOpen(false)
  }

  if (loading) {
    return <div className="p-6">Carregando metas...</div>
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Metas</h1>

          <p className="text-sm text-muted-foreground">
            Transforme ações em progresso real.
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Criar meta
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar meta</DialogTitle>
            </DialogHeader>

            <div className="space-y-5">
              <div>
                <Label>Emoji</Label>

                <div className="mt-3 flex flex-wrap gap-2">
                  {emojiOptions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setEmoji(item)}
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl border text-xl",
                        emoji === item
                          ? "border-primary bg-primary/20"
                          : "border-border"
                      )}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                placeholder="Nome da meta"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <Input
                type="number"
                placeholder="Objetivo"
                value={targetValue}
                onChange={(e) =>
                  setTargetValue(e.target.value)
                }
              />

              <Input
                placeholder="Unidade"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />

              <div>
                <Label>Prazo</Label>

                <Input
                  type="date"
                  value={deadline}
                  onChange={(e) =>
                    setDeadline(e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Prioridade</Label>

                <Select
                  value={priority}
                  onValueChange={setPriority}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="low">
                      Baixa
                    </SelectItem>
                    <SelectItem value="medium">
                      Média
                    </SelectItem>
                    <SelectItem value="high">
                      Alta
                    </SelectItem>
                    <SelectItem value="critical">
                      Crítica
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Acompanhamento</Label>

                <Select
                  value={trackingMode}
                  onValueChange={setTrackingMode}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="manual">
                      Manual
                    </SelectItem>
                    <SelectItem value="automatic">
                      Automático
                    </SelectItem>
                    <SelectItem value="hybrid">
                      Híbrido
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label>Meta principal</Label>

                <Switch
                  checked={isPrimary}
                  onCheckedChange={setIsPrimary}
                />
              </div>

              <Button
                className="w-full"
                onClick={handleCreateGoal}
              >
                Criar meta
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {goals.map((goal) => {
          const analytics = calcularAnalytics(
            goal,
            goalHistory[goal.id] || []
          )

          return (
            <Card
              key={goal.id}
              className={cn(
                "border-border bg-card/50 backdrop-blur-sm transition-all",
                goal.is_primary &&
                  "border-primary shadow-lg shadow-primary/10"
              )}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">
                        {goal.emoji || "🎯"}
                      </span>

                      <span>{goal.title}</span>
                    </CardTitle>

                    <div className="flex flex-wrap gap-2">
                      <Badge>
                        {prioridadeLabel(goal.priority)}
                      </Badge>

                      <Badge variant="secondary">
                        {acompanhamentoLabel(
                          goal.tracking_mode
                        )}
                      </Badge>

                      {goal.deadline && (
                        <Badge variant="outline">
                          <Calendar className="mr-1 h-3 w-3" />
                          {goal.deadline}
                        </Badge>
                      )}

                      {goal.is_primary && (
                        <Badge>
                          <Crown className="mr-1 h-3 w-3" />
                          Principal
                        </Badge>
                      )}

                      <Badge
                        className={analytics.statusColor}
                        variant="outline"
                      >
                        <Brain className="mr-1 h-3 w-3" />
                        {analytics.statusLabel}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <EditGoalDialog
                      goal={goal}
                      updateGoal={updateGoal}
                    />

                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() =>
                        deleteGoal(goal.id)
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {goal.current_value} /{" "}
                      {goal.target_value} {goal.unit}
                    </p>

                    <p className="text-lg font-bold text-primary">
                      {Math.min(
                        Math.round(analytics.progress),
                        100
                      )}
                      %
                    </p>
                  </div>

                  <Progress
                    value={Math.min(
                      Math.round(analytics.progress),
                      100
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-primary" />

                      <span className="text-xs text-muted-foreground">
                        Dias restantes
                      </span>
                    </div>

                    <p className="text-lg font-bold">
                      {analytics.daysRemaining !== null
                        ? analytics.daysRemaining
                        : "--"}
                    </p>
                  </div>

                  <div className="rounded-xl border p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />

                      <span className="text-xs text-muted-foreground">
                        Ritmo necessário
                      </span>
                    </div>

                    <p className="text-sm font-bold">
                      {analytics.requiredPerDay !== null
                        ? `${analytics.requiredPerDay.toFixed(
                            1
                          )} ${goal.unit}/dia`
                        : "--"}
                    </p>
                  </div>

                  <div className="col-span-2 rounded-xl border p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />

                      <span className="text-xs text-muted-foreground">
                        Projeção de conclusão
                      </span>
                    </div>

                    <p className="text-sm font-bold">
                      {analytics.projectedDays !== null
                        ? `${analytics.projectedDays} dias`
                        : "Sem dados suficientes"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {!goal.is_primary && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        setPrimaryGoal(goal.id)
                      }
                    >
                      Tornar principal
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={() =>
                      updateManualProgress(goal.id, 1)
                    }
                  >
                    +1
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() =>
                      updateManualProgress(goal.id, 5)
                    }
                  >
                    +5
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() =>
                      updateManualProgress(goal.id, 10)
                    }
                  >
                    +10
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}