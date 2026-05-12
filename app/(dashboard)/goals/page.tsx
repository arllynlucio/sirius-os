"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
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
import { cn } from "@/lib/utils"
import { Plus, Target, Calendar, Trash2, Edit2 } from "lucide-react"
import { toast } from "sonner"

type Goal = {
  id: string
  title: string
  emoji: string
  type: "monthly" | "yearly"
  progress: number
}

const emojiOptions = ["🎯", "📖", "🏋️", "💰", "🎨", "💼", "🌍", "🎓", "🏠", "❤️", "🚀", "✨"]

function GoalCard({
  goal,
  refreshGoals,
}: {
  goal: Goal
  refreshGoals: () => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [newProgress, setNewProgress] = useState(goal.progress.toString())

  const handleUpdateProgress = async () => {
    const progress = parseInt(newProgress)

    if (isNaN(progress) || progress < 0 || progress > 100) {
      toast.error("Progresso deve ser entre 0 e 100")
      return
    }

    await supabase
      .from("goals")
      .update({ progress })
      .eq("id", goal.id)

    refreshGoals()
    setIsEditing(false)

    if (progress === 100) {
      toast.success("Parabéns! Meta concluída!")
    } else {
      toast.success("Progresso atualizado!")
    }
  }

  const handleDelete = async () => {
    await supabase
      .from("goals")
      .delete()
      .eq("id", goal.id)

    refreshGoals()
    toast("Meta removida")
  }

  return (
    <Card className="group border-border bg-card/50 backdrop-blur-sm transition-all duration-200 hover:border-primary/30">
      <CardContent className="p-4">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{goal.emoji}</span>
            <div>
              <h3 className="font-medium text-foreground">{goal.title}</h3>
              <p className="text-xs text-muted-foreground">
                {goal.type === "monthly" ? "Meta mensal" : "Meta anual"}
              </p>
            </div>
          </div>

          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">{goal.progress}%</span>
          </div>

          <Progress value={goal.progress} className="h-2" />
        </div>

        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Atualizar progresso</DialogTitle>
            </DialogHeader>

            <Input
              type="number"
              min="0"
              max="100"
              value={newProgress}
              onChange={(e) => setNewProgress(e.target.value)}
            />

            <Button onClick={handleUpdateProgress}>
              Salvar
            </Button>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [newGoalEmoji, setNewGoalEmoji] = useState("🎯")
  const [newGoalTitle, setNewGoalTitle] = useState("")
  const [newGoalType, setNewGoalType] = useState<"monthly" | "yearly">("monthly")

  useEffect(() => {
    loadGoals()
  }, [])

  const loadGoals = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (data) {
      setGoals(data as Goal[])
    }
  }

  const handleAddGoal = async () => {
    if (!newGoalTitle.trim()) return

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

   console.log("SALVANDO GOAL NO SUPABASE")

const { error } = await supabase.from("goals").insert({
  user_id: user.id,
  title: newGoalTitle.trim(),
  emoji: newGoalEmoji,
  type: newGoalType,
  progress: 0,
})

if (error) {
  console.error("GOAL ERROR:", error)
  toast.error(error.message)
  return
}

    setNewGoalTitle("")
    setNewGoalEmoji("🎯")
    setNewGoalType("monthly")
    setIsOpen(false)

    loadGoals()
    toast.success("Meta criada!")
  }

  const monthlyGoals = goals.filter((g) => g.type === "monthly")
  const yearlyGoals = goals.filter((g) => g.type === "yearly")

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Metas</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe seu progresso em direção aos seus objetivos
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova meta
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar meta</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Ícone</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setNewGoalEmoji(emoji)}
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl text-xl",
                        newGoalEmoji === emoji
                          ? "bg-primary"
                          : "bg-background"
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Título</Label>
                <Input
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                />
              </div>

              <div>
                <Label>Tipo</Label>
                <Select
                  value={newGoalType}
                  onValueChange={(v) =>
                    setNewGoalType(v as "monthly" | "yearly")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Meta mensal</SelectItem>
                    <SelectItem value="yearly">Meta anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full" onClick={handleAddGoal}>
                Criar meta
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Metas Mensais</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {monthlyGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} refreshGoals={loadGoals} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <Target className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Metas Anuais</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {yearlyGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} refreshGoals={loadGoals} />
          ))}
        </div>
      </section>
    </div>
  )
}