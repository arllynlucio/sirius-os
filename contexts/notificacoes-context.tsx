"use client"

import {
  createContext,
  useContext,
  useEffect,
  ReactNode,
} from "react"

import { supabase } from "@/lib/supabase"
import { getLocalDate } from "@/lib/date"

import {
  solicitarPermissaoNotificacoes,
  enviarNotificacao,
} from "@/lib/notificacoes-engine"

type NotificacoesContextType = {
  solicitarPermissao: () => Promise<void>
}

const NotificacoesContext =
  createContext<NotificacoesContextType | undefined>(
    undefined
  )

export function NotificacoesProvider({
  children,
}: {
  children: ReactNode
}) {
  async function solicitarPermissao() {
    await solicitarPermissaoNotificacoes()
  }

  async function verificarTarefas() {
    const permitido =
      Notification.permission === "granted"

    if (!permitido) return

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data: tasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", getLocalDate())
      .eq("completed", false)
      .eq("reminder_enabled", true)

    if (!tasks?.length) return

    const now = new Date()

    for (const task of tasks) {
      if (!task.scheduled_time) continue

      const [hours, minutes] =
        task.scheduled_time.split(":")

      const taskTime = new Date()
      taskTime.setHours(Number(hours))
      taskTime.setMinutes(Number(minutes))
      taskTime.setSeconds(0)

      const reminderTime = new Date(
        taskTime.getTime() -
          task.reminder_minutes_before * 60000
      )

      const diff = Math.abs(
        now.getTime() - reminderTime.getTime()
      )

      if (diff > 60000) continue

      if (task.last_reminder_sent) {
        const lastSent = new Date(task.last_reminder_sent)

        if (
          lastSent.toDateString() === now.toDateString()
        ) {
          continue
        }
      }

      enviarNotificacao(
        "SIRIUS",
        `Sua tarefa "${task.title}" começa em ${task.reminder_minutes_before} minutos.`
      )

      await supabase
        .from("tasks")
        .update({
          last_reminder_sent: new Date().toISOString(),
        })
        .eq("id", task.id)
    }
  }

  useEffect(() => {
    solicitarPermissao()

    verificarTarefas()

    const interval = setInterval(() => {
      verificarTarefas()
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  return (
    <NotificacoesContext.Provider
      value={{
        solicitarPermissao,
      }}
    >
      {children}
    </NotificacoesContext.Provider>
  )
}

export function useNotificacoes() {
  const context = useContext(NotificacoesContext)

  if (!context) {
    throw new Error(
      "useNotificacoes deve ser usado dentro de NotificacoesProvider"
    )
  }

  return context
}