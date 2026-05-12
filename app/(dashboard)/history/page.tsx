"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, TrendingUp, CheckCircle2 } from "lucide-react"

type Checkin = {
  id: string
  checkin_date: string
  energy: string | null
  productivity: string | null
  completed_tasks: number | null
}

const productivityLabels = {
  weak: "📉 Fraco",
  normal: "📊 Normal",
  great: "🚀 Muito produtivo",
}

const energyLabels = {
  low: "😴 Baixa",
  medium: "🙂 Média",
  high: "⚡ Alta",
}

export default function HistoryPage() {
  const [history, setHistory] = useState<Checkin[]>([])

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data } = await supabase
      .from("checkins")
      .select("*")
      .eq("user_id", user.id)
      .order("checkin_date", { ascending: false })

    if (data) {
      setHistory(data)
    }
  }

  const productiveDays = history.filter((h) => h.productivity === "great").length
  const avgTasks =
    history.length > 0
      ? Math.round(
          history.reduce((acc, h) => acc + (h.completed_tasks || 0), 0) /
            history.length
        )
      : 0

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Histórico</h1>
        <p className="text-sm text-muted-foreground">
          Sua evolução real registrada
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <Calendar className="h-6 w-6" />
            <div>
              <p className="text-2xl font-bold">{history.length}</p>
              <p className="text-xs text-muted-foreground">Dias registrados</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <TrendingUp className="h-6 w-6" />
            <div>
              <p className="text-2xl font-bold">{productiveDays}</p>
              <p className="text-xs text-muted-foreground">Dias produtivos</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <CheckCircle2 className="h-6 w-6" />
            <div>
              <p className="text-2xl font-bold">{avgTasks}</p>
              <p className="text-xs text-muted-foreground">Média tarefas/dia</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registros reais</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum histórico ainda.
            </p>
          ) : (
            history.map((record) => (
              <div
                key={record.id}
                className="rounded-xl border border-border p-4"
              >
                <p className="font-semibold">
                  {new Date(record.checkin_date).toLocaleDateString("pt-BR")}
                </p>

                <div className="mt-2 flex flex-wrap gap-4 text-sm">
                  <span>
                    Energia:{" "}
                    {record.energy
                      ? energyLabels[record.energy as keyof typeof energyLabels]
                      : "-"}
                  </span>

                  <span>
                    Produtividade:{" "}
                    {record.productivity
                      ? productivityLabels[
                          record.productivity as keyof typeof productivityLabels
                        ]
                      : "-"}
                  </span>

                  <span>
                    Tarefas: {record.completed_tasks || 0}
                  </span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}