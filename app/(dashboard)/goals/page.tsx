"use client"

import { useState } from "react"
import { useAppStore, type Goal } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

const emojiOptions = ["🎯", "📖", "🏋️", "💰", "🎨", "💼", "🌍", "🎓", "🏠", "❤️", "🚀", "✨"]

function GoalCard({ goal }: { goal: Goal }) {
  const updateGoalProgress = useAppStore((state) => state.updateGoalProgress)
  const deleteGoal = useAppStore((state) => state.deleteGoal)
  const [isEditing, setIsEditing] = useState(false)
  const [newProgress, setNewProgress] = useState(goal.progress.toString())

  const handleUpdateProgress = () => {
    const progress = parseInt(newProgress)
    if (isNaN(progress) || progress < 0 || progress > 100) {
      toast.error("Progresso deve ser entre 0 e 100")
      return
    }
    updateGoalProgress(goal.id, progress)
    setIsEditing(false)
    
    if (progress === 100) {
      toast.success("Parabéns! Meta concluída!")
    } else {
      toast.success("Progresso atualizado!")
    }
  }

  const handleDelete = () => {
    deleteGoal(goal.id)
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
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className={cn(
              "font-medium",
              goal.progress === 100 ? "text-success" : "text-foreground"
            )}>
              {goal.progress}%
            </span>
          </div>
          <Progress 
            value={goal.progress} 
            className="h-2"
          />
        </div>

        {/* Edit Progress Dialog */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="border-border bg-card sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground">Atualizar progresso</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{goal.emoji}</span>
                <span className="font-medium text-foreground">{goal.title}</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="progress" className="text-foreground">
                  Progresso (0-100%)
                </Label>
                <Input
                  id="progress"
                  type="number"
                  min="0"
                  max="100"
                  value={newProgress}
                  onChange={(e) => setNewProgress(e.target.value)}
                  className="border-border bg-background text-foreground"
                />
              </div>
              <Button
                onClick={handleUpdateProgress}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

export default function GoalsPage() {
  const goals = useAppStore((state) => state.goals)
  const addGoal = useAppStore((state) => state.addGoal)

  const [isOpen, setIsOpen] = useState(false)
  const [newGoalEmoji, setNewGoalEmoji] = useState("🎯")
  const [newGoalTitle, setNewGoalTitle] = useState("")
  const [newGoalType, setNewGoalType] = useState<"monthly" | "yearly">("monthly")

  const monthlyGoals = goals.filter((g) => g.type === "monthly")
  const yearlyGoals = goals.filter((g) => g.type === "yearly")

  const handleAddGoal = () => {
    if (!newGoalTitle.trim()) return

    addGoal({
      emoji: newGoalEmoji,
      title: newGoalTitle.trim(),
      type: newGoalType,
    })

    setNewGoalTitle("")
    setNewGoalEmoji("🎯")
    setNewGoalType("monthly")
    setIsOpen(false)
    toast.success("Meta criada!")
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Metas</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe seu progresso em direção aos seus objetivos
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Nova meta
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border bg-card sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground">Criar meta</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Emoji Selector */}
              <div className="space-y-2">
                <Label className="text-foreground">Ícone</Label>
                <div className="flex flex-wrap gap-2">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setNewGoalEmoji(emoji)}
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl text-xl transition-all",
                        newGoalEmoji === emoji
                          ? "bg-primary ring-2 ring-primary ring-offset-2 ring-offset-card"
                          : "bg-background hover:bg-background/80"
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Goal Title */}
              <div className="space-y-2">
                <Label htmlFor="goal-title" className="text-foreground">
                  Título da meta
                </Label>
                <Input
                  id="goal-title"
                  placeholder="Ex: Ler 12 livros"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  className="border-border bg-background text-foreground"
                  onKeyDown={(e) => e.key === "Enter" && handleAddGoal()}
                />
              </div>

              {/* Goal Type */}
              <div className="space-y-2">
                <Label className="text-foreground">Período</Label>
                <Select value={newGoalType} onValueChange={(v) => setNewGoalType(v as "monthly" | "yearly")}>
                  <SelectTrigger className="border-border bg-background text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-card">
                    <SelectItem value="monthly">Meta mensal</SelectItem>
                    <SelectItem value="yearly">Meta anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleAddGoal}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!newGoalTitle.trim()}
              >
                Criar meta
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Monthly Goals */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Metas Mensais</h2>
        </div>
        {monthlyGoals.length === 0 ? (
          <Card className="border-border bg-card/50">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <Target className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Nenhuma meta mensal</p>
              <p className="text-xs text-muted-foreground">Crie metas para este mês</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {monthlyGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        )}
      </section>

      {/* Yearly Goals */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-chart-4" />
          <h2 className="text-lg font-semibold text-foreground">Metas Anuais</h2>
        </div>
        {yearlyGoals.length === 0 ? (
          <Card className="border-border bg-card/50">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <Target className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Nenhuma meta anual</p>
              <p className="text-xs text-muted-foreground">Defina seus objetivos para o ano</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {yearlyGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
