import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ポタりん V2',
  description: 'AIが提案する散歩・サイクリングコース',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}