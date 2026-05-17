import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '接地線太さ計算',
  description: 'A種・B種・C種・D種接地の接地線最小太さを現場で即計算',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-gray-100 min-h-screen">{children}</body>
    </html>
  )
}
