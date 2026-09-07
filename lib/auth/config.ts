import NextAuth, { DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getDb } from '../db/client';
import { verifyPassword } from './password';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      tenantId?: string;
      role?: string;
    } & DefaultSession['user'];
  }

  interface User {
    tenantId?: string;
    role?: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credenciales',
      credentials: {
        email: { label: 'Correo', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
        tenantSlug: { label: 'Clínica (slug)', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);
        const tenantSlug = (credentials.tenantSlug as string) || 'demo';

        const db = getDb();
        const tenant = db.prepare('SELECT id FROM tenants WHERE slug = ? AND active = 1').get(tenantSlug) as { id: string } | undefined;
        if (!tenant) return null;

        const user = db
          .prepare('SELECT * FROM users WHERE tenant_id = ? AND email = ? AND active = 1')
          .get(tenant.id, email) as any;

        if (!user) return null;

        const isValid = verifyPassword(password, user.password_hash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenant_id,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.tenantId = user.tenantId;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.tenantId = token.tenantId as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'medischedule-secure-secret-key-32-chars-long!',
});
