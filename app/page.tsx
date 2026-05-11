"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sun, Target, Flame, BarChart3, ArrowRight, CheckCircle2, Sparkles, Zap, TrendingUp, Calendar } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">SIRIUS OS</span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Recursos
            </a>
            <a href="#preview" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Preview
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Entrar
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Criar conta
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
              <Flame className="h-4 w-4" />
              <span>Sistema de Produtividade Pessoal</span>
            </div>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Seu sistema operacional de{" "}
              <span className="text-primary">gestão pessoal.</span>
            </h1>
            <p className="mt-6 text-pretty text-lg text-muted-foreground sm:text-xl">
              Check-ins diários, metas e evolução em um único lugar. Transforme sua rotina em resultados extraordinários.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup">
                <Button size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  Começar agora
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#preview">
                <Button size="lg" variant="outline" className="gap-2 border-border text-foreground hover:bg-card">
                  Ver demonstração
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
              Cansado de não conseguir manter consistência?
            </h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              A maioria das pessoas falha em atingir suas metas porque não tem um sistema. 
              SIRIUS OS foi criado para ser o cockpit da sua vida produtiva.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: CheckCircle2,
                title: "Sem estrutura clara",
                description: "Suas tarefas e metas estão espalhadas em vários lugares, sem conexão."
              },
              {
                icon: TrendingUp,
                title: "Falta de acompanhamento",
                description: "Você não sabe se está evoluindo ou estagnado na sua jornada."
              },
              {
                icon: Calendar,
                title: "Inconsistência diária",
                description: "Dias produtivos seguidos de dias perdidos, sem padrão de sucesso."
              }
            ].map((item, index) => (
              <Card 
                key={index} 
                className="border-border bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card"
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                    <item.icon className="h-6 w-6 text-destructive" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
              Tudo que você precisa para{" "}
              <span className="text-primary">evoluir consistentemente</span>
            </h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              Recursos poderosos que trabalham juntos para transformar sua produtividade.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Sun,
                title: "Daily Check-in",
                description: "Comece cada dia com clareza. Registre sua energia e defina o foco.",
                color: "bg-warning/10 text-warning"
              },
              {
                icon: Target,
                title: "Goal Tracking",
                description: "Metas mensais e anuais com progresso visual e celebrações.",
                color: "bg-primary/10 text-primary"
              },
              {
                icon: Flame,
                title: "Streak System",
                description: "Mantenha a consistência viva com sequências de dias produtivos.",
                color: "bg-destructive/10 text-destructive"
              },
              {
                icon: BarChart3,
                title: "Productivity History",
                description: "Veja sua evolução ao longo do tempo com gráficos intuitivos.",
                color: "bg-success/10 text-success"
              }
            ].map((feature, index) => (
              <Card 
                key={index}
                className="group relative overflow-hidden border-border bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card"
              >
                <CardContent className="p-6">
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary transition-all duration-300 group-hover:w-full" />
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Product Preview */}
      <section id="preview" className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
              Uma interface <span className="text-primary">elegante e funcional</span>
            </h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              Design minimalista que não atrapalha. Foque no que importa.
            </p>
          </div>

          <div className="mt-16">
            <Card className="overflow-hidden border-border bg-card">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                  {/* Sidebar Preview */}
                  <div className="border-b border-border bg-background p-4 lg:w-64 lg:border-b-0 lg:border-r">
                    <div className="flex items-center gap-3 rounded-lg bg-card p-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                        <Sparkles className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <span className="font-semibold text-foreground">SIRIUS OS</span>
                    </div>
                    <nav className="mt-6 space-y-1">
                      {[
                        { icon: Zap, label: "Dashboard", active: true },
                        { icon: Target, label: "Metas", active: false },
                        { icon: BarChart3, label: "Histórico", active: false },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                            item.active
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-card hover:text-foreground"
                          }`}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </div>
                      ))}
                    </nav>
                  </div>

                  {/* Main Content Preview */}
                  <div className="flex-1 p-6">
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">Bom dia!</h3>
                        <p className="text-sm text-muted-foreground">Quinta-feira, 15 de Maio</p>
                      </div>
                      <div className="flex items-center gap-2 rounded-full bg-warning/10 px-4 py-2">
                        <Flame className="h-5 w-5 text-warning" />
                        <span className="font-bold text-warning">12</span>
                        <span className="text-sm text-warning/80">dias</span>
                      </div>
                    </div>

                    {/* Energy Selector Preview */}
                    <Card className="mb-6 border-border bg-background/50">
                      <CardContent className="p-4">
                        <p className="mb-3 text-sm font-medium text-foreground">Como está sua energia hoje?</p>
                        <div className="flex gap-3">
                          {[
                            { emoji: "😴", label: "Baixa" },
                            { emoji: "🙂", label: "Média" },
                            { emoji: "⚡", label: "Alta", active: true },
                          ].map((energy, index) => (
                            <button
                              key={index}
                              className={`flex flex-1 flex-col items-center gap-1 rounded-xl p-3 transition-all ${
                                energy.active
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-card text-muted-foreground hover:bg-card/80"
                              }`}
                            >
                              <span className="text-2xl">{energy.emoji}</span>
                              <span className="text-xs font-medium">{energy.label}</span>
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Tasks Preview */}
                    <div className="space-y-2">
                      {[
                        { emoji: "🏃", task: "Exercício matinal", completed: true },
                        { emoji: "📚", task: "Ler 30 minutos", completed: true },
                        { emoji: "💻", task: "Trabalho profundo", completed: false },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className={`flex items-center gap-3 rounded-xl bg-background/50 p-3 transition-all ${
                            item.completed ? "opacity-60" : ""
                          }`}
                        >
                          <span className="text-xl">{item.emoji}</span>
                          <span className={`flex-1 text-foreground ${item.completed ? "line-through" : ""}`}>
                            {item.task}
                          </span>
                          <CheckCircle2
                            className={`h-5 w-5 ${
                              item.completed ? "text-success" : "text-muted-foreground/30"
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-card to-background">
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />
            </div>
            <CardContent className="py-16 text-center">
              <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
                Pronto para transformar sua produtividade?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-lg text-muted-foreground">
                Junte-se a milhares de pessoas que estão construindo hábitos melhores e alcançando suas metas.
              </p>
              <div className="mt-8">
                <Link href="/signup">
                  <Button size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                    Começar gratuitamente
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">SIRIUS OS</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; 2024 SIRIUS OS. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
