import { LanguageSwitcher } from "@/app/_components/language-switcher";
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
		return null;
	}

	return (
		<nav className="border-b">
			<div className="container mx-auto px-4 py-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-6">
						<Link href="/" className="text-xl font-bold">
							{t("brand")}
						</Link>
						<div className="flex gap-4">
							<Link href="/dashboard">
								<Button variant="ghost">{t("myTrips")}</Button>
							</Link>
							{session.user.role === "ADMIN" && (
								<Link href="/admin">
									<Button variant="ghost">{t("adminDashboard")}</Button>
								</Link>
							)}
						</div>
					</div>
					<div className="flex items-center gap-3">
						<span className="text-sm text-muted-foreground">
							{session.user.name ?? session.user.email}
						</span>
						<LanguageSwitcher />
						<ThemeToggle />
						<SignOutButton />
					</div>
				</div>
			</div>
		</nav>
	);
}
