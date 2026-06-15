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
  Bell,
  Clock,
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

function enviarNotificacao(titulo: string, mensagem: string) {
  if (typeof window === "undefined") return
  if (!("Notification" in window)) return
  if (Notification.permission !== "granted") return

  new Notification(titulo, {
    body: mensagem,
    icon: "/icon-192.png",
  })
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
  const [editingTask, setEditingTask] = useState<any>(null)

  const [taskEmoji, setTaskEmoji] = useState("📚")
  const [taskTitle, setTaskTitle] = useState("")
  const [taskType, setTaskType] =
    useState<"single" | "routine">("single")

    const [taskCategory, setTaskCategory] =
  useState<"personal" | "professional">(
    "personal"
  )
  const [scheduledTime, setScheduledTime] = useState("")
  const [reminderEnabled, setReminderEnabled] =
    useState(false)

  const [reminderMinutes, setReminderMinutes] =
    useState("15")

  const [linkGoalEnabled, setLinkGoalEnabled] =
    useState(false)

  const [selectedGoalId, setSelectedGoalId] =
    useState("")

  const [progressDelta, setProgressDelta] =
    useState("1")

  const completedCount = tasks.filter(
    (t) => t.completed
  ).length

  const resetForm = () => {
    setTaskEmoji("📚")
    setTaskTitle("")
    setTaskType("single")
    setTaskCategory("personal")
    setScheduledTime("")
    setReminderEnabled(false)
    setReminderMinutes("15")
    setLinkGoalEnabled(false)
    setSelectedGoalId("")
    setProgressDelta("1")
    setEditingTask(null)
  }

  const getGoalUnit = () => {
    const goal = goals.find(
      (g) => g.id === selectedGoalId
    )

    return goal?.unit || "unidades"
  }

  const openEdit = async (task: DashboardTask) => {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", task.id)
      .single()

    const link = getTaskLinks(task.id)[0]

    setEditingTask(data)
    setTaskEmoji(data.emoji)
    setTaskTitle(data.title)
    setTaskType(data.type)
    setTaskCategory(
  data.category || "personal"
)
    setScheduledTime(data.scheduled_time || "")
    setReminderEnabled(data.reminder_enabled || false)

    setReminderMinutes(
      String(data.reminder_minutes_before || 15)
    )

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
          category: taskCategory,
          scheduled_time: scheduledTime || null,
          reminder_enabled: reminderEnabled,
          reminder_minutes_before:
            Number(reminderMinutes),
        })
        .eq("id", editingTask.id)

      const existingLink =
        getTaskLinks(editingTask.id)[0]

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
    category: taskCategory,
    title: taskTitle.trim(),
    emoji: taskEmoji,
    type: taskType,
    completed: false,
    date: getLocalDate(),
    original_date: getLocalDate(),
    completed_at: null,
    scheduled_time: scheduledTime || null,
    reminder_enabled: reminderEnabled,
    reminder_minutes_before:
      Number(reminderMinutes),
    last_reminder_sent: null,
    late_reminder_sent: null,
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

    const { data: tasksData } = await supabase
  .from("tasks")
  .select("*")
  .eq("user_id", user.id)
  .eq("completed", false)
  .order("created_at", {
    ascending: false,
  })

const filteredTasks =
  (tasksData || []).filter((task) => {
    if (task.type === "routine") {
      return (
        task.date === getLocalDate()
      )
    }

    return true
  })

setTasks(
  filteredTasks as DashboardTask[]
)

    resetForm()
    setIsOpen(false)
  }

  const toggleTask = async (
    taskId: string,
    currentStatus: boolean
  ) => {
    const nextStatus = !currentStatus

    const currentTask = tasks.find(
      (task) => task.id === taskId
    )

    const link = getTaskLinks(taskId)[0]
    const linkedGoal = goals.find(
      (g) => g.id === link?.goal_id
    )

    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: nextStatus,
            }
          : task
      )
    )

    await supabase
  .from("tasks")
  .update({
    completed: nextStatus,
    completed_at: nextStatus
      ? new Date().toISOString()
      : null,
  })
  .eq("id", taskId)

    await applyTaskLinkProgress(
      taskId,
      nextStatus
    )

    if (nextStatus && currentTask) {
      enviarNotificacao(
        "SIRIUS",
        `✅ Tarefa "${currentTask.title}" concluída.`
      )

      if (link && linkedGoal) {
        enviarNotificacao(
          "SIRIUS",
          `📈 +${link.progress_delta} ${linkedGoal.unit} adicionados à meta "${linkedGoal.title}".`
        )

        const updatedGoal = goals.find(
          (g) => g.id === linkedGoal.id
        )

        if (
          updatedGoal &&
          updatedGoal.current_value +
            link.progress_delta >=
            updatedGoal.target_value
        ) {
          enviarNotificacao(
            "SIRIUS",
            `🎯 Meta "${linkedGoal.title}" concluída!`
          )
        }
      }
    }

    await onTasksChanged()
  }

  const removeTask = async (taskId: string) => {
    const existingLink =
      getTaskLinks(taskId)[0]

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

            if (!open) {
              resetForm()
            }
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingTask
                  ? "Editar tarefa"
                  : "Nova tarefa"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                {emojiOptions.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() =>
                      setTaskEmoji(emoji)
                    }
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl border text-xl",
                      taskEmoji === emoji
                        ? "border-primary bg-primary"
                        : "border-border"
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <Input
                placeholder="Nome da tarefa"
                value={taskTitle}
                onChange={(e) =>
                  setTaskTitle(e.target.value)
                }
              />
              <Select
  value={taskCategory}
  onValueChange={(value) =>
    setTaskCategory(
      value as
        | "personal"
        | "professional"
    )
  }
>
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>

  <SelectContent>
    <SelectItem value="personal">
      🏠 Pessoal
    </SelectItem>

    <SelectItem value="professional">
      💼 Profissional
    </SelectItem>
  </SelectContent>
</Select>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setTaskType("single")
                  }
                  className={cn(
                    "rounded-xl border p-3",
                    taskType === "single" &&
                      "bg-primary text-white"
                  )}
                >
                  Tarefa única
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setTaskType("routine")
                  }
                  className={cn(
                    "rounded-xl border p-3",
                    taskType === "routine" &&
                      "bg-primary text-white"
                  )}
                >
                  Rotina diária
                </button>
              </div>

              <div className="space-y-3 rounded-xl border p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <Label>Horário</Label>
                </div>

                <Input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) =>
                    setScheduledTime(
                      e.target.value
                    )
                  }
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <Label>Ativar lembrete</Label>
                  </div>

                  <Switch
                    checked={reminderEnabled}
                    onCheckedChange={
                      setReminderEnabled
                    }
                  />
                </div>

                {reminderEnabled && (
                  <Select
                    value={reminderMinutes}
                    onValueChange={
                      setReminderMinutes
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="5">
                        5 minutos antes
                      </SelectItem>
                      <SelectItem value="10">
                        10 minutos antes
                      </SelectItem>
                      <SelectItem value="15">
                        15 minutos antes
                      </SelectItem>
                      <SelectItem value="30">
                        30 minutos antes
                      </SelectItem>
                      <SelectItem value="60">
                        1 hora antes
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="flex items-center justify-between rounded-xl border p-4">
                <Label>Vincular a uma meta</Label>

                <Switch
                  checked={linkGoalEnabled}
                  onCheckedChange={
                    setLinkGoalEnabled
                  }
                />
              </div>

              {linkGoalEnabled && (
                <div className="space-y-4">
                  <Select
                    value={selectedGoalId}
                    onValueChange={
                      setSelectedGoalId
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha a meta" />
                    </SelectTrigger>

                    <SelectContent>
                      {goals.map((goal) => (
                        <SelectItem
                          key={goal.id}
                          value={goal.id}
                        >
                          {goal.emoji || "🎯"}{" "}
                          {goal.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="number"
                    min="1"
                    value={progressDelta}
                    onChange={(e) =>
                      setProgressDelta(
                        e.target.value
                      )
                    }
                    placeholder={`Quantos ${getGoalUnit()}?`}
                  />
                </div>
              )}

              <Button
                className="w-full"
                onClick={handleSaveTask}
              >
                {editingTask
                  ? "Salvar alterações"
                  : "Criar tarefa"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="space-y-5">
  {tasks.some(
    (task: any) =>
      task.category === "professional"
  ) && (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">💼</span>

        <h3 className="font-semibold text-foreground">
          Trabalho
        </h3>

        <Badge variant="secondary">
          {
            tasks.filter(
              (task: any) =>
                task.category ===
                "professional"
            ).length
          }
        </Badge>
      </div>

      <div className="space-y-2">
        {tasks
          .filter(
            (task: any) =>
              task.category ===
              "professional"
          )
          .map((task: any) => {
            const link =
              getTaskLinks(task.id)[0]

            const linkedGoal =
              goals.find(
                (g) =>
                  g.id === link?.goal_id
              )

            return (
              <div
                key={task.id}
                className="rounded-xl bg-background/50 p-3"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      toggleTask(
                        task.id,
                        task.completed
                      )
                    }
                  >
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>

                  <span className="text-xl">
                    {task.emoji}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        task.completed &&
                          "line-through opacity-60"
                      )}
                    >
                      {task.title}
                    </p>

                    <div className="mt-1 flex flex-wrap gap-2">
                      {task.type ===
                        "routine" && (
                        <Badge variant="secondary">
                          rotina
                        </Badge>
                      )}

                    {task.type === "single" &&
 task.original_date &&
 (() => {
   const diff = Math.floor(
     (new Date().getTime() -
       new Date(task.original_date).getTime()) /
     (1000 * 60 * 60 * 24)
   )

   if (diff <= 0) return null

   return (
     <Badge variant="destructive">
       ⚠️ {diff} dia{diff > 1 ? "s" : ""}
     </Badge>
   )
 })()}

                      {task.scheduled_time && (
                        <Badge
                          variant="outline"
                          className="gap-1"
                        >
                          <Clock className="h-3 w-3" />
                          {task.scheduled_time.slice(
                            0,
                            5
                          )}
                        </Badge>
                      )}

                      {task.reminder_enabled && (
                        <Badge
                          variant="outline"
                          className="gap-1"
                        >
                          <Bell className="h-3 w-3" />
                          {
                            task.reminder_minutes_before
                          }{" "}
                          min
                        </Badge>
                      )}

                      {link &&
                        linkedGoal && (
                          <Badge
                            variant="outline"
                            className="gap-1"
                          >
                            <Link2 className="h-3 w-3" />
                            {
                              linkedGoal.title
                            }{" "}
                            (+
                            {
                              link.progress_delta
                            }
                            )
                          </Badge>
                        )}
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      openEdit(task)
                    }
                  >
                    <Pencil className="h-4 w-4 text-primary" />
                  </button>

                  <button
                    onClick={() =>
                      removeTask(task.id)
                    }
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )}

  {tasks.some(
    (task: any) =>
      task.category !== "professional"
  ) && (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">🏠</span>

        <h3 className="font-semibold text-foreground">
          Pessoal
        </h3>

        <Badge variant="secondary">
          {
            tasks.filter(
              (task: any) =>
                task.category !==
                "professional"
            ).length
          }
        </Badge>
      </div>

      <div className="space-y-2">
        {tasks
          .filter(
            (task: any) =>
              task.category !==
              "professional"
          )
          .map((task: any) => {
            const link =
              getTaskLinks(task.id)[0]

            const linkedGoal =
              goals.find(
                (g) =>
                  g.id === link?.goal_id
              )

            return (
              <div
                key={task.id}
                className="rounded-xl bg-background/50 p-3"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      toggleTask(
                        task.id,
                        task.completed
                      )
                    }
                  >
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>

                  <span className="text-xl">
                    {task.emoji}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        task.completed &&
                          "line-through opacity-60"
                      )}
                    >
                      {task.title}
                    </p>

                    <div className="mt-1 flex flex-wrap gap-2">
                      {task.type ===
                        "routine" && (
                        <Badge variant="secondary">
                          rotina
                        </Badge>
                      )}

                      {task.type === "single" &&
  task.original_date && (() => {
    const diff = Math.floor(
      (new Date().getTime() -
        new Date(task.original_date).getTime()) /
      (1000 * 60 * 60 * 24)
    )

    if (diff <= 0) return null

    return (
      <Badge variant="destructive">
        ⚠️ {diff} dia{diff > 1 ? "s" : ""}
      </Badge>
    )
  })()}

                      {task.scheduled_time && (
                        <Badge
                          variant="outline"
                          className="gap-1"
                        >
                          <Clock className="h-3 w-3" />
                          {task.scheduled_time.slice(
                            0,
                            5
                          )}
                        </Badge>
                      )}

                      {task.reminder_enabled && (
                        <Badge
                          variant="outline"
                          className="gap-1"
                        >
                          <Bell className="h-3 w-3" />
                          {
                            task.reminder_minutes_before
                          }{" "}
                          min
                        </Badge>
                      )}

                      {link &&
                        linkedGoal && (
                          <Badge
                            variant="outline"
                            className="gap-1"
                          >
                            <Link2 className="h-3 w-3" />
                            {
                              linkedGoal.title
                            }{" "}
                            (+
                            {
                              link.progress_delta
                            }
                            )
                          </Badge>
                        )}
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      openEdit(task)
                    }
                  >
                    <Pencil className="h-4 w-4 text-primary" />
                  </button>

                  <button
                    onClick={() =>
                      removeTask(task.id)
                    }
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )}
</CardContent>
    </Card>
  )
}