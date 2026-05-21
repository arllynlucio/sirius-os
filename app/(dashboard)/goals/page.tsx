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
  Zap,
  ChevronDown,
  ChevronUp,
  Undo2,
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
  source_id?: string | null
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

function formatRelativeDate(dateString: string) {
  const now = new Date()
  const date = new Date(dateString)

  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) return "agora"
  if (diffHours < 24) return `há ${diffHours}h`
  if (diffDays === 1) return "ontem"
  return `há ${diffDays} dias`
}

function getEventVisual(event: GoalProgressEvent) {
  if (event.delta < 0) {
    return {
      icon: Undo2,
      label: "Reversão",
      className:
        "bg-red-500/10 text-red-500 border-red-500/20",
    }
  }

  if (event.source_type === "task") {
    return {
      icon: Zap,
      label: "Tarefa vinculada",
      className:
        "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    }
  }

  return {
    icon: TrendingUp,
    label: "Manual",
    className:
      "bg-green-500/10 text-green-500 border-green-500/20",
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
      status: "coletando",
      statusLabel: "Coletando dados",
      statusColor:
        "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
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
      status: "coletando",
      statusLabel: "Coletando dados",
      statusColor:
        "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
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
  const [trackingMode, setTrackingMode] =
    useState(goal.tracking_mode)
  const [deadline, setDeadline] = useState(
    goal.deadline || ""
  )
  const [isPrimary, setIsPrimary] =
    useState(goal.is_primary)

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

        <div className="space-y-5"></div>
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

          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input
            type="number"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
          />
          <Input value={unit} onChange={(e) => setUnit(e.target.value)} />

          <Input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />

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

  const [expandedHistory, setExpandedHistory] = useState<
    Record<string, boolean>
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
      .order("created_at", { ascending: false })

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
    setIsOpen(false)
  }

  if (loading) {
    return <div className="p-6">Carregando metas...</div>
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="grid gap-5 md:grid-cols-2">
        {goals.map((goal) => {
          const analytics = calcularAnalytics(
            goal,
            goalHistory[goal.id] || []
          )

          const history = goalHistory[goal.id] || []
          const expanded = expandedHistory[goal.id]
          const visibleHistory = expanded
            ? history.slice(0, 5)
            : history.slice(0, 3)

          return (
            <Card key={goal.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span>{goal.emoji}</span>
                    {goal.title}
                  </CardTitle>

                  <div className="flex gap-2">
                    <EditGoalDialog
                      goal={goal}
                      updateGoal={updateGoal}
                    />

                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => deleteGoal(goal.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                <Progress value={analytics.progress} />

                <div className="rounded-xl border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      Histórico recente ({history.length})
                    </p>

                    {history.length > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExpandedHistory((prev) => ({
                            ...prev,
                            [goal.id]: !expanded,
                          }))
                        }
                      >
                        {expanded ? (
                          <>
                            Ocultar
                            <ChevronUp className="ml-1 h-4 w-4" />
                          </>
                        ) : (
                          <>
                            Ver histórico
                            <ChevronDown className="ml-1 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {!history.length && (
                    <p className="text-sm text-muted-foreground">
                      Nenhum evento registrado ainda.
                    </p>
                  )}

                  {visibleHistory.map((event) => {
                    const visual = getEventVisual(event)
                    const Icon = visual.icon

                    return (
                      <div
                        key={event.id}
                        className={cn(
                          "rounded-xl border p-3",
                          visual.className
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span className="font-medium">
                              {event.delta > 0 ? "+" : ""}
                              {event.delta} {goal.unit}
                            </span>
                          </div>

                          <span className="text-xs opacity-70">
                            {formatRelativeDate(event.created_at)}
                          </span>
                        </div>

                        <p className="mt-1 text-xs opacity-80">
                          {visual.label}
                        </p>
                      </div>
                    )
                  })}
                </div>

                <div className="flex flex-wrap gap-2">
                  {!goal.is_primary && (
                    <Button
                      variant="outline"
                      onClick={() => setPrimaryGoal(goal.id)}
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