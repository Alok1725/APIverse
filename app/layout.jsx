import './globals.css'
import Providers from '@/components/Providers'

export const metadata = {
  title: {
    default: 'APIverse — AI-Powered API Intelligence Platform',
    template: '%s | APIverse'
  },
  description: 'Discover, understand, test, monitor, and review APIs — all powered by AI. The intelligent API ecosystem for modern developers.',
  keywords: ['API', 'developer tools', 'API documentation', 'API testing', 'API monitoring', 'AI', 'REST API'],
  authors: [{ name: 'APIverse' }],
  openGraph: {
    title: 'APIverse — AI-Powered API Intelligence Platform',
    description: 'Discover, understand, test, monitor, and review APIs — all powered by AI.',
    type: 'website',
  },
}

export const viewport = {
  themeColor: '#0a0a0f',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
