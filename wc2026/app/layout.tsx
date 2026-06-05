import { Oswald, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const oswald = Oswald({
  weight: ['400', '500', '600'],
  subsets: ['latin', 'vietnamese'],
  variable: '--font-oswald',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${oswald.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-pitch-900 font-body text-white antialiased min-h-screen bg-stadium-gradient">
        {children}
      </body>
    </html>
  )
}