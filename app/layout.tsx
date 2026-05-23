import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'Overlift',
  description: 'Lean bulk workout tracker',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#1e1e1c',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className={geist.className}>
        <div className="max-w-[700px] mx-auto px-3 py-4 pb-24 sm:pb-6 sm:py-6">
          {children}
        </div>
      </body>
    </html>
  )
}
