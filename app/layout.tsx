import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import { GoalsProvider } from '@/contexts/goals-context'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'SIRIUS OS - Seu Sistema Operacional de Gestão Pessoal',
  description:
    'Check-ins diários, metas e evolução em um único lugar. O sistema operacional pessoal para produtividade e gestão de vida.',
  generator: 'v0.app',
  keywords: [
    'produtividade',
    'gestão pessoal',
    'metas',
    'check-in',
    'streaks',
    'tarefas',
  ],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="bg-background">
      <body className={`${inter.variable} font-sans antialiased`}>
        <GoalsProvider>
          {children}
          <Toaster />
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </GoalsProvider>
      </body>
    </html>
  )
}