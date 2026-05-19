"use client"

import { useState } from "react"
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
} from "lucide-react"

import { toast } from "sonner"
import { cn } from "@/lib/utils"

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
  const [targetValue, setTargetValue] = useState(goal.target_value.toString())
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

          <div>
            <Label>Nome</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div>
            <Label>Objetivo</Label>
            <Input
              type="number"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
            />
          </div>

          <div>
            <Label>Unidade</Label>
            <Input value={unit} onChange={(e) => setUnit(e.target.value)} />
          </div>

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
              <SelectTrigger><SelectValue /></SelectTrigger>
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
            <Select value={trackingMode} onValueChange={setTrackingMode}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="automatic">Automático</SelectItem>
                <SelectItem value="hybrid">Híbrido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label>Meta principal</Label>
            <Switch checked={isPrimary} onCheckedChange={setIsPrimary} />
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

  const [isOpen, setIsOpen] = useState(false)

  const [emoji, setEmoji] = useState("🎯")
  const [title, setTitle] = useState("")
  const [targetValue, setTargetValue] = useState("")
  const [unit, setUnit] = useState("páginas")
  const [priority, setPriority] = useState("medium")
  const [trackingMode, setTrackingMode] = useState("manual")
  const [deadline, setDeadline] = useState("")
  const [isPrimary, setIsPrimary] = useState(false)

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

  if (loading) return <div className="p-6">Carregando metas...</div>

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

              <Input placeholder="Nome da meta" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Input type="number" placeholder="Objetivo" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} />
              <Input placeholder="Unidade" value={unit} onChange={(e) => setUnit(e.target.value)} />

              <div>
                <Label>Prazo</Label>
                <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
              </div>

              <div>
                <Label>Prioridade</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
                <Select value={trackingMode} onValueChange={setTrackingMode}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="automatic">Automático</SelectItem>
                    <SelectItem value="hybrid">Híbrido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label>Meta principal</Label>
                <Switch checked={isPrimary} onCheckedChange={setIsPrimary} />
              </div>

              <Button className="w-full" onClick={handleCreateGoal}>
                Criar meta
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {goals.map((goal) => {
          const progress = (goal.current_value / goal.target_value) * 100

          return (
            <Card
              key={goal.id}
              className={goal.is_primary ? "border-primary shadow-lg" : ""}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{goal.emoji || "🎯"}</span>
                    {goal.title}
                  </CardTitle>

                  <div className="flex gap-2">
                    <EditGoalDialog goal={goal} updateGoal={updateGoal} />

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
                <p>
                  {goal.current_value} / {goal.target_value} {goal.unit}
                </p>

                <Progress value={Math.min(progress, 100)} />

                <div className="flex flex-wrap gap-2">
                  <Badge>{prioridadeLabel(goal.priority)}</Badge>

                  <Badge variant="secondary">
                    {acompanhamentoLabel(goal.tracking_mode)}
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
                </div>

                <div className="flex gap-2">
                  {!goal.is_primary && (
                    <Button
                      variant="outline"
                      onClick={() => setPrimaryGoal(goal.id)}
                    >
                      Tornar principal
                    </Button>
                  )}

                  <Button variant="outline" onClick={() => updateManualProgress(goal.id, 1)}>+1</Button>
                  <Button variant="outline" onClick={() => updateManualProgress(goal.id, 5)}>+5</Button>
                  <Button variant="outline" onClick={() => updateManualProgress(goal.id, 10)}>+10</Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}