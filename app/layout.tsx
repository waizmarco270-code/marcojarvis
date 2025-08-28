import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MARCO - AI Assistant',
  description: 'Voice-first Jarvis-like AI assistant built with Next.js',
  keywords: ['AI', 'assistant', 'voice', 'Jarvis', 'MARCO'],
  authors: [{ name: 'WaizMarco' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0ea5e9',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-900 text-white antialiased`}>
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="fixed bottom-4 left-4 text-sm text-gray-400 z-50">
          Created By <span className="text-blue-400 font-semibold">WaizMarco</span>
        </footer>
      </body>
    </html>
  )
}