"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

import {
  User,
  Shield,
  LogOut,
  AlertTriangle,
  Save,
  KeyRound,
} from "lucide-react"

import { toast } from "sonner"

type Profile = {
  id: string
  name: string
  email: string
  avatar_url?: string | null
}

export default function SettingsPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)

  const [profile, setProfile] = useState<Profile | null>(null)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

 const handleAvatarUpload = async (
  event: React.ChangeEvent<HTMLInputElement>
) => {
  const file = event.target.files?.[0]

  if (!file || !profile) return

  try {
    const fileExt = file.name.split(".").pop()

    const fileName =
      `${profile.id}-${Date.now()}.${fileExt}`

    const { error: uploadError } =
      await supabase.storage
        .from("avatars")
        .upload(fileName, file)

    if (uploadError) throw uploadError

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName)

    const avatarUrl =
      `${publicUrl}?t=${Date.now()}`

    const { error: updateError } =
      await supabase
        .from("profiles")
        .update({
          avatar_url: avatarUrl,
        })
        .eq("id", profile.id)

    if (updateError) throw updateError

    toast.success("Foto atualizada")

    await loadProfile()
  } catch (error) {
    console.error("UPLOAD ERROR:", error)

    toast.error("Erro ao enviar foto")
  }
}

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.replace("/login")
      return
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()

    if (!data || error) {
      const fallbackProfile = {
        id: user.id,
        name: user.user_metadata?.name || "Usuário",
        email: user.email || "",
      }

      setProfile(fallbackProfile)
      setName(fallbackProfile.name)
      setEmail(fallbackProfile.email)
      setLoading(false)
      return
    }

    setProfile(data)
    setName(data.name || "")
    setEmail(data.email || "")
    setLoading(false)
  }

  const handleSaveProfile = async () => {
    if (!profile) return

    if (!name.trim() || !email.trim()) {
      toast.error("Nome e email são obrigatórios")
      return
    }

    setSaving(true)

    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: profile.id,
          name: name.trim(),
          email: email.trim(),
        })

      if (error) throw error

      toast.success("Perfil atualizado com sucesso")
      await loadProfile()
    } catch (error) {
      console.error(error)
      toast.error("Erro ao salvar perfil")
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!newPassword.trim()) {
      toast.error("Digite uma nova senha")
      return
    }

    if (newPassword.length < 6) {
      toast.error("Senha precisa ter pelo menos 6 caracteres")
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      setNewPassword("")
      toast.success("Senha alterada com sucesso")
    } catch (error) {
      console.error(error)
      toast.error("Erro ao alterar senha")
    }
  }

  const handleResetAll = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const confirmed = window.confirm(
      "Tem certeza? Isso apagará TODO o histórico operacional do SIRIUS."
    )

    if (!confirmed) return

    const secondConfirmation = window.confirm(
      "Confirmação final: essa ação é irreversível."
    )

    if (!secondConfirmation) return

    setResetting(true)

    try {
      await supabase.from("tasks").delete().eq("user_id", user.id)
      await supabase.from("goals").delete().eq("user_id", user.id)
      await supabase.from("checkins").delete().eq("user_id", user.id)
      await supabase.from("streaks").delete().eq("user_id", user.id)

      toast.success("SIRIUS redefinido com sucesso")

      router.push("/dashboard")
      router.refresh()
    catch (error) {
  console.error("UPLOAD ERROR:", error)

  toast.error(
    JSON.stringify(error, null, 2)
  )
}
    } finally {
      setResetting(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace("/login")
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">
          Carregando configurações...
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Configurações
        </h1>

        <p className="text-sm text-muted-foreground">
          Gerencie sua conta e preferências do SIRIUS
        </p>
      </div>

      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Perfil
          </CardTitle>

          <CardDescription>
            Informações da sua conta
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-3">
  <Avatar className="h-20 w-20 border-2 border-border">
    <AvatarImage
      src={profile?.avatar_url || ""}
      alt={name}
    />

    <AvatarFallback className="bg-primary/10 text-xl text-primary">
      {name?.[0]?.toUpperCase() || "U"}
    </AvatarFallback>
  </Avatar>

  <Input
    type="file"
    accept="image/*"
    onChange={handleAvatarUpload}
    className="max-w-xs"
  />
</div>

            <div>
              <p className="font-medium text-foreground">{name}</p>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Nome</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Button
            onClick={handleSaveProfile}
            disabled={saving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Segurança
          </CardTitle>

          <CardDescription>
            Controle de acesso
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nova senha</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Digite nova senha"
            />
          </div>

          <Button
            onClick={handleChangePassword}
            variant="outline"
            className="gap-2"
          >
            <KeyRound className="h-4 w-4" />
            Alterar senha
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/40 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Zona de perigo
          </CardTitle>

          <CardDescription>
            Ações irreversíveis
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Button
            onClick={handleResetAll}
            disabled={resetting}
            variant="destructive"
            className="w-full"
          >
            {resetting ? "Redefinindo..." : "Redefinir tudo"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border bg-card/50">
        <CardContent className="py-4">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sair da conta
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}