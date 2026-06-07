"use client";

import { LanguageSwitcher } from "@/app/_components/language-switcher";
import { SignOutButton } from "@/app/_components/sign-out-button";
import { ThemeToggle } from "@/app/_components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Home, LogIn, Menu, Play, Settings, Tag, X, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function GuestMobileMenu() {
	const t = useTranslations("navigation");
	const [open, setOpen] = useState(false);
	const close = () => setOpen(false);

	return (
		<div className="relative md:hidden">
			<Button
				variant="secondary"
				size="icon"
				onClick={() => setOpen((prev) => !prev)}
				aria-label="Toggle menu"
			>
				{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
			</Button>

			{open && (
				<div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-md border bg-background shadow-lg">
					<div className="flex flex-col gap-1 p-2">
						<Link href="/auth/signin" onClick={close}>
							<Button variant="ghost" className="w-full justify-start">
								<LogIn className="h-4 w-4" />
								{t("signIn")}
							</Button>
						</Link>
						<Link href="/register-company" onClick={close}>
							<Button variant="ghost" className="w-full justify-start">
								<Zap className="h-4 w-4" />
								{t("register")}
							</Button>
						</Link>
						<Link href="/pricing" onClick={close}>
							<Button variant="ghost" className="w-full justify-start">
								<Tag className="h-4 w-4" />
								{t("pricing")}
							</Button>
						</Link>
						<Link href="/book/demo" onClick={close}>
							<Button variant="ghost" className="w-full justify-start">
								<Play className="h-4 w-4" />
								{t("demo")}
							</Button>
						</Link>
						<Link href="/" onClick={close}>
							<Button variant="ghost" className="w-full justify-start">
								<Home className="h-4 w-4" />
								{t("home")}
							</Button>
						</Link>
					</div>
				</div>
			)}
		</div>
	);
}

interface MobileMenuProps {
	userName: string;
	role: "ADMIN" | "SUPER_ADMIN";
}

export function MobileMenu({ userName, role }: MobileMenuProps) {
	const t = useTranslations("navigation");
	const [open, setOpen] = useState(false);
	const close = () => setOpen(false);

	return (
		<div className="relative md:hidden">
			<Button
				variant="secondary"
				size="icon"
				onClick={() => setOpen((prev) => !prev)}
				aria-label="Toggle menu"
			>
				{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
			</Button>

			{open && (
				<div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-md border bg-background shadow-lg">
					<div className="border-b px-4 py-3">
						<p className="truncate text-sm text-muted-foreground">{userName}</p>
					</div>

					<div className="flex flex-col gap-1 p-2">
						{role === "ADMIN" && (
							<>
								<Link href="/admin" onClick={close}>
									<Button variant="ghost" className="w-full justify-start">
										{t("adminDashboard")}
									</Button>
								</Link>
								<Link href="/admin/stats" onClick={close}>
									<Button variant="ghost" className="w-full justify-start">
										{t("adminStats")}
									</Button>
								</Link>
							</>
						)}
						{role === "SUPER_ADMIN" && (
							<Link href="/super-admin" onClick={close}>
								<Button variant="ghost" className="w-full justify-start">
									{t("adminDashboard")}
								</Button>
							</Link>
						)}
					</div>

					<div className="flex items-center justify-between border-t p-3">
						{(role === "ADMIN" || role === "SUPER_ADMIN") && (
							<Link href="/admin/settings" onClick={close} className="block">
								<Button variant="ghost" size={"icon"}>
									<Settings />
								</Button>
							</Link>
						)}
						{role === "ADMIN" && <LanguageSwitcher />}
						<ThemeToggle />
						<SignOutButton />
					</div>
				</div>
			)}
		</div>
	);
}
