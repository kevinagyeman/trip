import { BrandLogo } from "@/app/_components/brand-logo";
import { LanguageSwitcher } from "@/app/_components/language-switcher";
import { MobileMenu } from "@/app/_components/mobile-menu";
import { SignOutButton } from "@/app/_components/sign-out-button";
import { ThemeToggle } from "@/app/_components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { auth } from "@/server/auth";
import { Settings } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function Navigation() {
	const session = await auth();
	const t = await getTranslations("navigation");

	if (!session?.user) {
		return (
			<nav className="sticky top-0 z-50 border-b bg-background">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<BrandLogo label={t("brand")} isLoggedIn={false} />
						<div className="flex items-center gap-3">
							<LanguageSwitcher />
							<ThemeToggle />
						</div>
					</div>
				</div>
			</nav>
		);
	}

	const userName = session.user.name ?? session.user.email ?? "";
	const role = session.user.role;
	const isAdmin = role === "ADMIN";
	const isSuperAdmin = role === "SUPER_ADMIN";
	const logoHref = isAdmin
		? "/admin"
		: isSuperAdmin
			? "/super-admin"
			: "/dashboard";

	return (
		<nav className="sticky top-0 z-50 border-b bg-background">
			<div className="container mx-auto px-4 py-4">
				<div className="flex items-center justify-between">
					{/* Brand + desktop nav links */}
					<div className="flex items-center gap-6">
						<BrandLogo label={t("brand")} isLoggedIn={true} href={logoHref} />

						<div className="hidden items-center gap-2 md:flex">
							{!isAdmin && !isSuperAdmin && (
								<Link href="/dashboard">
									<Button variant="ghost">{t("myTrips")}</Button>
								</Link>
							)}
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

					{/* Right side */}
					<div className="flex items-center gap-3">
						<LanguageSwitcher />

						<span className="hidden text-sm text-muted-foreground md:block">
							{userName}
						</span>
						<ThemeToggle className="hidden md:flex" />
						{isAdmin && (
							<Link href="/admin/settings" className="hidden md:block">
								<Button variant="ghost" size="icon">
									<Settings className="h-4 w-4" />
								</Button>
							</Link>
						)}
						<div className="hidden md:block">
							<SignOutButton />
						</div>

						{/* Mobile burger */}
						{(isAdmin || isSuperAdmin) && (
							<MobileMenu
								userName={userName}
								isAdmin={isAdmin}
								isSuperAdmin={isSuperAdmin}
								myTripsLabel={t("myTrips")}
								adminLabel={t("adminDashboard")}
								adminStatsLabel={t("adminStats")}
							/>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
}
