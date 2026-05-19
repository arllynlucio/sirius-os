"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { getLocalDate } from "@/lib/date"
import { useGoals } from "@/contexts/goals-context"
import { useGoalLinks } from "@/contexts/goal-links-context"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

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

import {
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  ListTodo,
} from "lucide-react"

import type { DashboardTask } from "@/app/(dashboard)/dashboard/page"

const emojiOptions = [
  "📚",
  "🏃",
  "💻",
  "🧘",
  "💼",
  "🎯",
  "✍️",
  "🎨",
  "📞",
  "🛒",
  "🏠",
  "💪",
]

type TaskListProps = {
  tasks: DashboardTask[]
  setTasks: React.Dispatch<React.SetStateAction<DashboardTask[]>>
  onTasksChanged: () => Promise<void>
}

export function TaskList({
  tasks,
  setTasks,
  onTasksChanged,
}: TaskListProps) {
  const { goals, applyTaskLinkProgress } = useGoals()
  const { createLink } = useGoalLinks()

  const [isOpen, setIsOpen] = useState(false)

  const [newTaskEmoji, setNewTaskEmoji] = useState("📚")
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskType, setNewTaskType] =
    useState<"single" | "routine">("single")

  const [linkGoalEnabled, setLinkGoalEnabled] = useState(false)
  const [selectedGoalId, setSelectedGoalId] = useState("")
  const [progressDelta, setProgressDelta] = useState("1")

  const completedCount = tasks.filter((t) => t.completed).length

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: user.id,
        title: newTaskTitle.trim(),
        emoji: newTaskEmoji,
        type: newTaskType,
        completed: false,
        date: getLocalDate(),
      })
      .select()
      .single()

    if (error || !data) {
      console.error(error)
      return
    }

    if (linkGoalEnabled && selectedGoalId) {
      await createLink({
        goal_id: selectedGoalId,
        task_id: data.id,
        progress_delta: Number(progressDelta),
      })
    }

    setTasks((prev) => [data as DashboardTask, ...prev])

    setNewTaskTitle("")
    setNewTaskEmoji("📚")
    setNewTaskType("single")

    setLinkGoalEnabled(false)
    setSelectedGoalId("")
    setProgressDelta("1")

    setIsOpen(false)

    await onTasksChanged()
  }

  const toggleTask = async (
    taskId: string,
    currentStatus: boolean
  ) => {
    const nextStatus = !currentStatus

    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, completed: nextStatus }
          : task
      )
    )

    const { error } = await supabase
      .from("tasks")
      .update({
        completed: nextStatus,
      })
      .eq("id", taskId)

    if (error) {
      console.error("Erro ao atualizar task:", error)
      return
    }

    await applyTaskLinkProgress(taskId, nextStatus)
    await onTasksChanged()
  }

  const deleteTask = async (taskId: string) => {
    setTasks((prev) =>
      prev.filter((task) => task.id !== taskId)
    )

    await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId)

    await onTasksChanged()
  }

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <ListTodo className="h-5 w-5 text-primary" />
          Tarefas do dia

          <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
            {completedCount}/{tasks.length}
          </span>
        </CardTitle>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Adicionar</span>
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nova tarefa</DialogTitle>
            </DialogHeader>

            <div className="space-y-5 py-4">
              <div>
                <p className="mb-2 text-sm font-medium">Emoji</p>

                <div className="flex flex-wrap gap-2">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewTaskEmoji(emoji)}
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl border text-xl",
                        newTaskEmoji === emoji
                          ? "border-primary bg-primary"
                          : "border-border bg-background"
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Nome da tarefa"
              />

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setNewTaskType("single")}
                  className={cn(
                    "rounded-xl border p-3 text-sm font-medium",
                    newTaskType === "single"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border"
                  )}
                >
                  Tarefa única
                </button>

                <button
                  type="button"
                  onClick={() => setNewTaskType("routine")}
                  className={cn(
                    "rounded-xl border p-3 text-sm font-medium",
                    newTaskType === "routine"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border"
                  )}
                >
                  Rotina diária
                </button>
              </div>

              <div className="flex items-center justify-between rounded-xl border p-4">
                <Label>Vincular a uma meta</Label>

                <Switch
                  checked={linkGoalEnabled}
                  onCheckedChange={setLinkGoalEnabled}
                />
              </div>

              {linkGoalEnabled && (
                <div className="space-y-4">
                  <div>
                    <Label>Selecionar meta</Label>

                    <Select
                      value={selectedGoalId}
                      onValueChange={setSelectedGoalId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha uma meta" />
                      </SelectTrigger>

                      <SelectContent>
                        {goals.map((goal) => (
                          <SelectItem
                            key={goal.id}
                            value={goal.id}
                          >
                            {goal.emoji || "🎯"} {goal.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>
                      Quanto essa tarefa adiciona?
                    </Label>

                    <Input
                      type="number"
                      min="1"
                      value={progressDelta}
                      onChange={(e) =>
                        setProgressDelta(e.target.value)
                      }
                    />
                  </div>
                </div>
              )}

              <Button
                onClick={handleAddTask}
                className="w-full"
              >
                Adicionar tarefa
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="group flex items-center gap-3 rounded-xl bg-background/50 p-3"
          >
            <button
              onClick={() =>
                toggleTask(task.id, task.completed)
              }
            >
              {task.completed ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
            </button>

            <span className="text-xl">{task.emoji}</span>

            <span
              className={cn(
                "flex-1",
                task.completed && "line-through opacity-60"
              )}
            >
              {task.title}

              {task.type === "routine" && (
                <span className="ml-2 text-xs text-primary">
                  (rotina)
                </span>
              )}
            </span>

            <button onClick={() => deleteTask(task.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}