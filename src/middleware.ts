import createMiddleware from "next-intl/middleware";
import { auth } from "@/server/auth";
import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default auth(async (req) => {
	const { pathname } = req.nextUrl;

	// Strip locale prefix for path matching
	const localePattern = /^\/(en|it|de|fr)/;
	const pathWithoutLocale = pathname.replace(localePattern, "") || "/";

	// Protect /admin routes: must be ADMIN or SUPER_ADMIN
	if (pathWithoutLocale.startsWith("/admin")) {
		const role = req.auth?.user?.role;
		if (!role || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
			const signInUrl = new URL(`${req.nextUrl.pathname.match(localePattern)?.[0] ?? "/en"}/auth/signin`, req.url);
			return NextResponse.redirect(signInUrl);
		}
	}

	// Protect /super-admin routes: must be SUPER_ADMIN
	if (pathWithoutLocale.startsWith("/super-admin")) {
		const role = req.auth?.user?.role;
		if (role !== "SUPER_ADMIN") {
			const signInUrl = new URL(`${req.nextUrl.pathname.match(localePattern)?.[0] ?? "/en"}/auth/signin`, req.url);
			return NextResponse.redirect(signInUrl);
		}
	}

	// Protect /dashboard routes: must be authenticated
	if (pathWithoutLocale.startsWith("/dashboard")) {
		if (!req.auth?.user) {
			const signInUrl = new URL(`${req.nextUrl.pathname.match(localePattern)?.[0] ?? "/en"}/auth/signin`, req.url);
			return NextResponse.redirect(signInUrl);
		}
	}

	return intlMiddleware(req as unknown as NextRequest);
}) as ReturnType<typeof auth>;

export const config = {
	matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
