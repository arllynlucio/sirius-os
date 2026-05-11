"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles, ArrowLeft, Eye, EyeOff, Check } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const passwordRequirements = [
    { label: "Mínimo 8 caracteres", met: password.length >= 8 },
    { label: "Uma letra maiúscula", met: /[A-Z]/.test(password) },
    { label: "Um número", met: /[0-9]/.test(password) },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate signup
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    router.push("/dashboard")
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-8">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 h-[300px] w-[300px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        {/* Back link */}
        <Link 
          href="/" 
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para o início
        </Link>

        <Card className="border-border bg-card/80 backdrop-blur-xl">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">Criar sua conta</CardTitle>
              <CardDescription className="mt-2 text-muted-foreground">
                Comece a transformar sua produtividade
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Nome</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-border bg-background pr-10 text-foreground placeholder:text-muted-foreground focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {passwordRequirements.map((req, index) => (
                      <div 
                        key={index} 
                        className={`flex items-center gap-2 text-xs transition-colors ${
                          req.met ? "text-success" : "text-muted-foreground"
                        }`}
                      >
                        <div className={`flex h-4 w-4 items-center justify-center rounded-full ${
                          req.met ? "bg-success/20" : "bg-muted"
                        }`}>
                          {req.met && <Check className="h-2.5 w-2.5" />}
                        </div>
                        {req.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Criando conta...
                  </span>
                ) : (
                  "Criar conta"
                )}
              </Button>
            </form>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Ao criar uma conta, você concorda com nossos{" "}
              <Link href="#" className="text-primary hover:text-primary/80">
                Termos de Uso
              </Link>{" "}
              e{" "}
              <Link href="#" className="text-primary hover:text-primary/80">
                Política de Privacidade
              </Link>
            </p>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Link href="/login" className="text-primary hover:text-primary/80">
                Entrar
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
