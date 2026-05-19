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

import { cn } from "@/lib/utils"

import {
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  ListTodo,
  Pencil,
  Link2,
  Unlink,
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
  "🛒",
  "🏠",
  "💪",
  "📷",
  "🔫",
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
  const {
    createLink,
    updateLink,
    deleteLink,
    getTaskLinks,
  } = useGoalLinks()

  const [isOpen, setIsOpen] = useState(false)
  const [editingTask, setEditingTask] =
    useState<DashboardTask | null>(null)

  const [taskEmoji, setTaskEmoji] = useState("📚")
  const [taskTitle, setTaskTitle] = useState("")
  const [taskType, setTaskType] =
    useState<"single" | "routine">("single")

  const [linkGoalEnabled, setLinkGoalEnabled] = useState(false)
  const [selectedGoalId, setSelectedGoalId] = useState("")
  const [progressDelta, setProgressDelta] = useState("1")

  const completedCount = tasks.filter((t) => t.completed).length

  const resetForm = () => {
    setTaskEmoji("📚")
    setTaskTitle("")
    setTaskType("single")
    setLinkGoalEnabled(false)
    setSelectedGoalId("")
    setProgressDelta("1")
    setEditingTask(null)
  }

  const getGoalUnit = () => {
    const goal = goals.find((g) => g.id === selectedGoalId)
    return goal?.unit || "unidades"
  }

  const openEdit = (task: DashboardTask) => {
    const link = getTaskLinks(task.id)[0]

    setEditingTask(task)
    setTaskEmoji(task.emoji)
    setTaskTitle(task.title)
    setTaskType(task.type)

    if (link) {
      setLinkGoalEnabled(true)
      setSelectedGoalId(link.goal_id)
      setProgressDelta(String(link.progress_delta))
    } else {
      setLinkGoalEnabled(false)
      setSelectedGoalId("")
      setProgressDelta("1")
    }

    setIsOpen(true)
  }

  const handleSaveTask = async () => {
    if (!taskTitle.trim()) return

    if (linkGoalEnabled && !selectedGoalId) return

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    if (editingTask) {
      await supabase
        .from("tasks")
        .update({
          title: taskTitle.trim(),
          emoji: taskEmoji,
          type: taskType,
        })
        .eq("id", editingTask.id)

      const existingLink = getTaskLinks(editingTask.id)[0]

      if (linkGoalEnabled) {
        if (existingLink) {
          await updateLink(existingLink.id, {
            goal_id: selectedGoalId,
            progress_delta: Number(progressDelta),
          })
        } else {
          await createLink({
            goal_id: selectedGoalId,
            task_id: editingTask.id,
            progress_delta: Number(progressDelta),
          })
        }
      } else if (existingLink) {
        await deleteLink(existingLink.id)
      }
    } else {
      const { data } = await supabase
        .from("tasks")
        .insert({
          user_id: user.id,
          title: taskTitle.trim(),
          emoji: taskEmoji,
          type: taskType,
          completed: false,
          date: getLocalDate(),
        })
        .select()
        .single()

      if (!data) return

      if (linkGoalEnabled) {
        await createLink({
          goal_id: selectedGoalId,
          task_id: data.id,
          progress_delta: Number(progressDelta),
        })
      }
    }

    await onTasksChanged()
    resetForm()
    setIsOpen(false)

    const { data: tasksData } = await supabase
      .from("tasks")
      .select("*")
      .eq("date", getLocalDate())
      .order("created_at", { ascending: false })

    setTasks((tasksData as DashboardTask[]) || [])
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

    await supabase
      .from("tasks")
      .update({
        completed: nextStatus,
      })
      .eq("id", taskId)

    await applyTaskLinkProgress(taskId, nextStatus)
    await onTasksChanged()
  }

  const removeTask = async (taskId: string) => {
    const existingLink = getTaskLinks(taskId)[0]

    if (existingLink) {
      await deleteLink(existingLink.id)
    }

    await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId)

    setTasks((prev) =>
      prev.filter((task) => task.id !== taskId)
    )

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

        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Adicionar</span>
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingTask ? "Editar tarefa" : "Nova tarefa"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5 py-4">
              <div>
                <Label>Emoji</Label>

                <div className="mt-3 flex flex-wrap gap-2">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setTaskEmoji(emoji)}
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl border text-xl",
                        taskEmoji === emoji
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
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Nome da tarefa"
              />

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTaskType("single")}
                  className={cn(
                    "rounded-xl border p-3 text-sm font-medium",
                    taskType === "single"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border"
                  )}
                >
                  Tarefa única
                </button>

                <button
                  type="button"
                  onClick={() => setTaskType("routine")}
                  className={cn(
                    "rounded-xl border p-3 text-sm font-medium",
                    taskType === "routine"
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
                      Quantos {getGoalUnit()}?
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
                onClick={handleSaveTask}
                className="w-full"
              >
                {editingTask ? "Salvar alterações" : "Adicionar tarefa"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="space-y-2">
        {tasks.map((task) => {
          const link = getTaskLinks(task.id)[0]
          const linkedGoal = goals.find(
            (g) => g.id === link?.goal_id
          )

          return (
            <div
              key={task.id}
              className="rounded-xl bg-background/50 p-3"
            >
              <div className="flex items-center gap-3">
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

                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      task.completed &&
                        "line-through opacity-60"
                    )}
                  >
                    {task.title}
                  </p>

                  <div className="mt-1 flex flex-wrap gap-2">
                    {task.type === "routine" && (
                      <Badge variant="secondary">
                        rotina
                      </Badge>
                    )}

                    {link && linkedGoal && (
                      <Badge
                        variant="outline"
                        className="gap-1"
                      >
                        <Link2 className="h-3 w-3" />
                        {linkedGoal.title} (+{link.progress_delta})
                      </Badge>
                    )}
                  </div>
                </div>

                <button onClick={() => openEdit(task)}>
                  <Pencil className="h-4 w-4 text-primary" />
                </button>

                <button onClick={() => removeTask(task.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </button>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}