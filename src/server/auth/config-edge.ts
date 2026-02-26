import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "../../../generated/prisma";

/**
 * Edge-compatible auth config for middleware.
 * Must NOT import Prisma, bcryptjs, or any Node.js-only module.
 * Only needs JWT/session callbacks to read the token.
 */
export const authConfigEdge = {
	providers: [], // no providers needed — middleware only reads the JWT
	session: { strategy: "jwt" },
	pages: { signIn: "/auth/signin" },
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				return { ...token, id: user.id, role: user.role, companyId: (user as { companyId?: string | null }).companyId ?? null };
			}
			return token;
		},
		async session({ session, token }) {
			if (token && session.user) {
				session.user.id = token["id"] as string;
				session.user.role = token["role"] as UserRole;
				session.user.companyId = token["companyId"] as string | null;
			}
			return session;
		},
	},
} satisfies NextAuthConfig;
