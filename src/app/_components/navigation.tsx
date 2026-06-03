import { BrandLogo } from "@/app/_components/brand-logo";
import { LanguageSwitcher } from "@/app/_components/language-switcher";
import { GuestMobileMenu, MobileMenu } from "@/app/_components/mobile-menu";
import { SignOutButton } from "@/app/_components/sign-out-button";
import { ThemeToggle } from "@/app/_components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { auth } from "@/server/auth";
import { LogIn, Settings, Zap } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";

export async function Navigation() {
	const session = await auth();
	const t = await getTranslations("navigation");

	// ── Unauthenticated ──────────────────────────────────────────────────────
	if (!session?.user) {
		const headersList = await headers();
		const pathname = headersList.get("x-pathname") ?? "";
		const hideAuthButtons =
			/\/(book|request)\//.test(pathname) || /\/book$/.test(pathname);

		return (
			<nav className="sticky top-0 z-50 border-b bg-background">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-6">
							<BrandLogo
								label={t("brand")}
								href={hideAuthButtons ? pathname : "/"}
							/>
							{!hideAuthButtons && (
								<div className="hidden md:flex items-center gap-2">
									<Link href="/">
										<Button variant="ghost">{t("home")}</Button>
									</Link>
									<Link href="/pricing">
										<Button variant="ghost">{t("pricing")}</Button>
									</Link>
									<Link href="/book/demo">
										<Button variant="ghost">{t("demo")}</Button>
									</Link>
								</div>
							)}
						</div>
						<div className="flex items-center gap-3">
							<LanguageSwitcher />
							<ThemeToggle />
							{!hideAuthButtons && (
								<>
									<div className="hidden md:flex items-center gap-2">
										<Link href="/auth/signin">
											<Button variant="outline" size="sm">
												{t("signIn")} <LogIn className="h-4 w-4" />
											</Button>
										</Link>
										<Link href="/register-company">
											<Button size="sm">
												<Zap className="h-4 w-4" /> {t("register")}
											</Button>
										</Link>
									</div>
									<GuestMobileMenu />
								</>
							)}
						</div>
					</div>
				</div>
			</nav>
		);
	}

	const { role } = session.user;
	const isAdmin = role === "ADMIN";
	const isSuperAdmin = role === "SUPER_ADMIN";
	const userName = session.user.name ?? session.user.email ?? "";
	const logoHref = isSuperAdmin ? "/super-admin" : "/admin";

	// ── Admin / Super-admin ──────────────────────────────────────────────────
	return (
		<nav className="sticky top-0 z-50 border-b bg-background">
			<div className="container mx-auto px-4 py-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-6">
						<BrandLogo label={t("brand")} href={logoHref} />

						<div className="hidden items-center gap-2 md:flex">
							{isAdmin && (
								<>
									<Link href="/admin">
										<Button variant="ghost">{t("adminDashboard")}</Button>
									</Link>
									<Link href="/admin/stats">
										<Button variant="ghost">{t("adminStats")}</Button>
									</Link>
								</>
							)}
						</div>
					</div>

					<div className="flex items-center gap-3">
						<span className="hidden text-sm text-muted-foreground md:block">
							{userName}
						</span>
						<LanguageSwitcher />
						<ThemeToggle className="hidden md:flex" />
						{(isAdmin || isSuperAdmin) && (
							<Link href="/admin/settings" className="hidden md:block">
								<Button variant="ghost" size="icon">
									<Settings className="h-4 w-4" />
								</Button>
							</Link>
						)}
						<div className="hidden md:block">
							<SignOutButton />
						</div>
						<MobileMenu
							userName={userName}
							role={role as "ADMIN" | "SUPER_ADMIN"}
						/>
					</div>
				</div>
			</div>
		</nav>
	);
}
