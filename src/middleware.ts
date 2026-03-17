import NextAuth from "next-auth";
import createMiddleware from "next-intl/middleware";
import { authConfigEdge } from "@/server/auth/config-edge";
import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

const { auth } = NextAuth(authConfigEdge);

export default auth((req) => {
	const { pathname } = req.nextUrl;

	// Strip locale prefix for path matching
	const localePattern = /^\/(en|it|de|fr)/;
	const pathWithoutLocale = pathname.replace(localePattern, "") || "/";
	const localePrefix = pathname.match(localePattern)?.[0] ?? "/en";

	// /auth/register is disabled — registration only via /book/[slug]
	if (pathWithoutLocale === "/auth/register") {
		return NextResponse.redirect(new URL(`${localePrefix}/`, req.url));
	}

	// Redirect logged-in users away from auth pages
	if (pathWithoutLocale === "/auth/signin") {
		if (req.auth?.user) {
			const role = req.auth.user.role;
			const dest =
				role === "SUPER_ADMIN"
					? "/super-admin"
					: role === "ADMIN"
						? "/admin"
						: "/dashboard";
			return NextResponse.redirect(new URL(`${localePrefix}${dest}`, req.url));
		}
	}

	// Protect /admin routes: must be ADMIN or SUPER_ADMIN
	if (pathWithoutLocale.startsWith("/admin")) {
		const role = req.auth?.user?.role;
		if (!role || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
			return NextResponse.redirect(
				new URL(`${localePrefix}/auth/signin`, req.url),
			);
		}
	}

	// Protect /super-admin routes: must be SUPER_ADMIN
	if (pathWithoutLocale.startsWith("/super-admin")) {
		const role = req.auth?.user?.role;
		if (role !== "SUPER_ADMIN") {
			return NextResponse.redirect(
				new URL(`${localePrefix}/auth/signin`, req.url),
			);
		}
	}

	// Protect /dashboard routes: must be authenticated
	if (pathWithoutLocale.startsWith("/dashboard")) {
		if (!req.auth?.user) {
			return NextResponse.redirect(
				new URL(`${localePrefix}/auth/signin`, req.url),
			);
		}
	}

	return intlMiddleware(req as NextRequest);
});

export const config = {
	matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
