export async function solicitarPermissaoNotificacoes() {
  if (typeof window === "undefined") return false

  if (!("Notification" in window)) {
    return false
  }

  if (Notification.permission === "granted") {
    return true
  }

  if (Notification.permission === "denied") {
    return false
  }

  const permission = await Notification.requestPermission()

  return permission === "granted"
}

export function enviarNotificacao(
  titulo: string,
  corpo: string
) {
  if (typeof window === "undefined") return

  if (!("Notification" in window)) return

  if (Notification.permission !== "granted") return

  new Notification(titulo, {
    body: corpo,
    icon: "/icon-192.png",
  })
}