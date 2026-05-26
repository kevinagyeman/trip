"use client";

import { SignOutButton } from "@/app/_components/sign-out-button";
import { ThemeToggle } from "@/app/_components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Menu, Settings, X } from "lucide-react";
import { useState } from "react";

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
				variant="ghost"
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

					{role === "ADMIN" && (
						<Link
							href="/admin/settings"
							onClick={close}
							className="block border-t"
						>
							<Button
								variant="ghost"
								className="w-full justify-start gap-2 px-3 py-2"
							>
								<Settings className="h-4 w-4" />
								{t("settings")}
							</Button>
						</Link>
					)}

					<div className="flex items-center justify-between border-t p-3">
						<ThemeToggle />
						<SignOutButton />
					</div>
				</div>
			)}
		</div>
	);
}
