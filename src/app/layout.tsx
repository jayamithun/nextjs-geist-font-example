import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Koredio - Gym Management System',
  description: 'Premium multi-branch gym management platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
