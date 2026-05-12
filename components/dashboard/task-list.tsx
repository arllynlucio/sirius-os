"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Plus, CheckCircle2, Circle, Trash2, ListTodo } from "lucide-react"

const emojiOptions = ["📚", "🏃", "💻", "🧘", "💼", "🎯", "✍️", "🎨", "📞", "🛒", "🏠", "💪"]

type Task = {
  id: string
  title: string
  emoji: string
  type: "single" | "routine"
  completed: boolean
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [newTaskEmoji, setNewTaskEmoji] = useState("📚")
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskType, setNewTaskType] = useState<"single" | "routine">("single")

  const completedCount = tasks.filter((t) => t.completed).length

  const loadTasks = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

const today = new Date().toISOString().split("T")[0]

const { data } = await supabase
  .from("tasks")
  .select("*")
  .eq("user_id", user.id)
  .eq("date", today)
  .order("created_at", { ascending: false })

    if (data) {
      setTasks(data as Task[])
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const today = new Date().toISOString().split("T")[0]

await supabase.from("tasks").insert({
  user_id: user.id,
  title: newTaskTitle.trim(),
  emoji: newTaskEmoji,
  type: newTaskType,
  completed: false,
  date: today,
})

    setNewTaskTitle("")
    setNewTaskEmoji("📚")
    setNewTaskType("single")
    setIsOpen(false)

    loadTasks()
  }

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const today = new Date().toISOString().split("T")[0]

  await supabase
    .from("tasks")
    .update({
      completed: !currentStatus,
    })
    .eq("id", taskId)

  const { data: updatedTasks } = await supabase
    .from("tasks")
    .select("completed")
    .eq("user_id", user.id)
    .eq("date", today)

  const completedCount =
    updatedTasks?.filter((task) => task.completed).length || 0

  await supabase
    .from("checkins")
    .update({
      completed_tasks: completedCount,
    })
    .eq("user_id", user.id)
    .eq("checkin_date", today)

  loadTasks()
}

  const deleteTask = async (taskId: string) => {
    await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId)

    loadTasks()
  }

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <ListTodo className="h-5 w-5 text-primary" />
          Tarefas do dia
          <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
            {completedCount}/{tasks.length}
          </span>
        </CardTitle>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Adicionar
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova tarefa</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label>Ícone</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setNewTaskEmoji(emoji)}
                      className={cn(
                        "h-10 w-10 rounded-lg text-xl",
                        newTaskEmoji === emoji ? "bg-primary" : "bg-muted"
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Nome da tarefa</Label>
                <Input
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                />
              </div>

              <div>
                <Label>Tipo</Label>
                <Select value={newTaskType} onValueChange={(v) => setNewTaskType(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Único</SelectItem>
                    <SelectItem value="routine">Rotina</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleAddTask} className="w-full">
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
            className={cn(
              "group flex items-center gap-3 rounded-xl bg-background/50 p-3",
              task.completed && "opacity-60"
            )}
          >
            <button onClick={() => toggleTask(task.id, task.completed)}>
              {task.completed ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </button>

            <span className="text-xl">{task.emoji}</span>

            <span
              className={cn(
                "flex-1 text-sm",
                task.completed && "line-through"
              )}
            >
              {task.title}
            </span>

            <button onClick={() => deleteTask(task.id)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}