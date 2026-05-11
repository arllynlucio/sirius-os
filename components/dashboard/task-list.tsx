"use client"

import { useState } from "react"
import { useAppStore, type TaskType } from "@/lib/store"
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

export function TaskList() {
  const todayRecord = useAppStore((state) => state.todayRecord)
  const addTask = useAppStore((state) => state.addTask)
  const toggleTask = useAppStore((state) => state.toggleTask)
  const deleteTask = useAppStore((state) => state.deleteTask)

  const [isOpen, setIsOpen] = useState(false)
  const [newTaskEmoji, setNewTaskEmoji] = useState("📚")
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskType, setNewTaskType] = useState<TaskType>("single")

  const tasks = todayRecord?.tasks || []
  const completedCount = tasks.filter((t) => t.completed).length

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return

    addTask({
      emoji: newTaskEmoji,
      title: newTaskTitle.trim(),
      type: newTaskType,
    })

    setNewTaskTitle("")
    setNewTaskEmoji("📚")
    setNewTaskType("single")
    setIsOpen(false)
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
            <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Adicionar</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border bg-card sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground">Nova tarefa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Emoji Selector */}
              <div className="space-y-2">
                <Label className="text-foreground">Ícone</Label>
                <div className="flex flex-wrap gap-2">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setNewTaskEmoji(emoji)}
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl text-xl transition-all",
                        newTaskEmoji === emoji
                          ? "bg-primary ring-2 ring-primary ring-offset-2 ring-offset-card"
                          : "bg-background hover:bg-background/80"
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Task Title */}
              <div className="space-y-2">
                <Label htmlFor="task-title" className="text-foreground">
                  Nome da tarefa
                </Label>
                <Input
                  id="task-title"
                  placeholder="Ex: Reunião com equipe"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="border-border bg-background text-foreground"
                  onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                />
              </div>

              {/* Task Type */}
              <div className="space-y-2">
                <Label className="text-foreground">Tipo</Label>
                <Select value={newTaskType} onValueChange={(v) => setNewTaskType(v as TaskType)}>
                  <SelectTrigger className="border-border bg-background text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-card">
                    <SelectItem value="single">Único (apenas hoje)</SelectItem>
                    <SelectItem value="routine">Rotina (todos os dias)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleAddTask}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!newTaskTitle.trim()}
              >
                Adicionar tarefa
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-2">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <ListTodo className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Nenhuma tarefa ainda</p>
            <p className="text-xs text-muted-foreground">Adicione tarefas para organizar seu dia</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                "group flex items-center gap-3 rounded-xl bg-background/50 p-3 transition-all duration-200",
                task.completed && "opacity-60"
              )}
            >
              <button
                onClick={() => toggleTask(task.id)}
                className="flex-shrink-0 transition-transform hover:scale-110"
              >
                {task.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                )}
              </button>
              <span className="text-xl">{task.emoji}</span>
              <span
                className={cn(
                  "flex-1 text-sm text-foreground transition-all",
                  task.completed && "line-through text-muted-foreground"
                )}
              >
                {task.title}
              </span>
              {task.type === "routine" && (
                <span className="hidden rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary sm:inline">
                  Rotina
                </span>
              )}
              <button
                onClick={() => deleteTask(task.id)}
                className="flex-shrink-0 text-muted-foreground opacity-0 transition-all hover:text-destructive group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
