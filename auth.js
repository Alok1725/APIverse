import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import { db } from './lib/db'

const providers = [
  Credentials({
    name: 'credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null
      if (String(credentials.password).length < 6) return null
      const email = String(credentials.email).toLowerCase().trim()
      try {
        const user = await db.user.findUnique({
          where: { email },
          select: { id: true, name: true, email: true, image: true },
        })
        if (!user) return null
        return { id: user.id, name: user.name, email: user.email, image: user.image }
      } catch {
        return null
      }
    },
  }),
]

// Only add GitHub if credentials are configured
if (process.env.GITHUB_CLIENT_ID) {
  providers.push(
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    })
  )
}

// Only add Google if credentials are configured
if (process.env.GOOGLE_CLIENT_ID) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers,
  pages: {
    signIn: '/signin',
    error: '/signin',
  },
  session: { strategy: 'jwt', maxAge: 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) session.user.id = token.id
      return session
    },
  },
})
