"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { User, Bell, Palette, Shield, LogOut } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function SettingsPage() {
  const user = useAppStore((state) => state.user)
  const setUser = useAppStore((state) => state.setUser)
  const settings = useAppStore((state) => state.settings)
  const updateSettings = useAppStore((state) => state.updateSettings)

  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")

  const handleSaveProfile = () => {
    if (!name.trim() || !email.trim()) {
      toast.error("Nome e email são obrigatórios")
      return
    }
    setUser({ name: name.trim(), email: email.trim() })
    toast.success("Perfil atualizado!")
  }

  const handleToggleNotifications = (checked: boolean) => {
    updateSettings({ notifications: checked })
    toast.success(checked ? "Notificações ativadas" : "Notificações desativadas")
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie sua conta e preferências
        </p>
      </div>

      {/* Profile Section */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <User className="h-5 w-5 text-primary" />
            Perfil
          </CardTitle>
          <CardDescription>
            Suas informações pessoais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-border">
              <AvatarFallback className="bg-primary/10 text-xl text-primary">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-foreground">{user?.name || "Usuário"}</p>
              <p className="text-sm text-muted-foreground">{user?.email || "email@example.com"}</p>
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-border bg-background text-foreground"
              placeholder="Seu nome"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-border bg-background text-foreground"
              placeholder="seu@email.com"
            />
          </div>

          <Button
            onClick={handleSaveProfile}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Salvar alterações
          </Button>
        </CardContent>
      </Card>

      {/* Theme Section */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Palette className="h-5 w-5 text-primary" />
            Aparência
          </CardTitle>
          <CardDescription>
            Personalize a interface do app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Tema escuro</p>
              <p className="text-sm text-muted-foreground">
                O SIRIUS OS foi projetado para o modo escuro
              </p>
            </div>
            <Switch
              checked={settings.theme === "dark"}
              disabled
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Bell className="h-5 w-5 text-primary" />
            Notificações
          </CardTitle>
          <CardDescription>
            Controle seus alertas e lembretes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Lembretes diários</p>
              <p className="text-sm text-muted-foreground">
                Receba lembretes para fazer seu check-in
              </p>
            </div>
            <Switch
              checked={settings.notifications}
              onCheckedChange={handleToggleNotifications}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Shield className="h-5 w-5 text-primary" />
            Segurança
          </CardTitle>
          <CardDescription>
            Gerencie sua segurança
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Alterar senha</p>
              <p className="text-sm text-muted-foreground">
                Atualize sua senha de acesso
              </p>
            </div>
            <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-card">
              Alterar
            </Button>
          </div>
          <Separator className="bg-border" />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Excluir conta</p>
              <p className="text-sm text-muted-foreground">
                Remova permanentemente sua conta e dados
              </p>
            </div>
            <Button variant="outline" size="sm" className="border-destructive text-destructive hover:bg-destructive/10">
              Excluir
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardContent className="py-4">
          <Link href="/">
            <Button
              variant="outline"
              className="w-full gap-2 border-border text-foreground hover:bg-card"
            >
              <LogOut className="h-4 w-4" />
              Sair da conta
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
