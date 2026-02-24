import { LanguageSwitcher } from "@/app/_components/language-switcher";
import { MobileMenu } from "@/app/_components/mobile-menu";
import { SignOutButton } from "@/app/_components/sign-out-button";
import { ThemeToggle } from "@/app/_components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { auth } from "@/server/auth";
import { getTranslations } from "next-intl/server";

export async function Navigation() {
	const session = await auth();
	const t = await getTranslations("navigation");

	if (!session?.user) {
		return (
			<nav className="sticky top-0 z-50 border-b bg-background">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<Link href="/" className="text-xl font-bold">
							{t("brand")}
						</Link>
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
	const isAdmin = session.user.role === "ADMIN";

	return (
		<nav className="sticky top-0 z-50 border-b bg-background">
			<div className="container mx-auto px-4 py-4">
				<div className="flex items-center justify-between">
					{/* Brand + desktop nav links */}
					<div className="flex items-center gap-6">
						<Link href="/" className="text-xl font-bold">
							{t("brand")}
						</Link>
						<div className="hidden items-center gap-2 md:flex">
							<Link href="/dashboard">
								<Button variant="ghost">{t("myTrips")}</Button>
							</Link>
							{isAdmin && (
								<Link href="/admin">
									<Button variant="ghost">{t("adminDashboard")}</Button>
								</Link>
							)}
						</div>
					</div>

					{/* Right side */}
					<div className="flex items-center gap-3">
						{/* Always visible */}
						<LanguageSwitcher />

						{/* Desktop only */}
						<span className="hidden text-sm text-muted-foreground md:block">
							{userName}
						</span>
						<ThemeToggle className="hidden md:flex" />
						<div className="hidden md:block">
							<SignOutButton />
						</div>

						{/* Mobile burger */}
						<MobileMenu
							userName={userName}
							isAdmin={isAdmin}
							myTripsLabel={t("myTrips")}
							adminLabel={t("adminDashboard")}
						/>
					</div>
				</div>
			</div>
		</nav>
	);
}
