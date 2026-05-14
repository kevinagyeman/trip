"use client";

import { SignOutButton } from "@/app/_components/sign-out-button";
import { ThemeToggle } from "@/app/_components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Menu, Settings, X } from "lucide-react";
import { useState } from "react";

interface MobileMenuProps {
	userName: string;
	isAdmin: boolean;
	myTripsLabel: string;
	adminLabel: string;
	adminStatsLabel: string;
	adminGuideLabel: string;
}

export function MobileMenu({
	userName,
	isAdmin,
	myTripsLabel,
	adminLabel,
	adminStatsLabel,
	adminGuideLabel,
}: MobileMenuProps) {
	const [open, setOpen] = useState(false);

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
						{!isAdmin && (
							<Link href="/dashboard" onClick={() => setOpen(false)}>
								<Button variant="ghost" className="w-full justify-start">
									{myTripsLabel}
								</Button>
							</Link>
						)}
						{isAdmin && (
							<>
								<Link href="/admin" onClick={() => setOpen(false)}>
									<Button variant="ghost" className="w-full justify-start">
										{adminLabel}
									</Button>
								</Link>
								<Link href="/admin/stats" onClick={() => setOpen(false)}>
									<Button variant="ghost" className="w-full justify-start">
										{adminStatsLabel}
									</Button>
								</Link>
								<Link href="/admin/guide" onClick={() => setOpen(false)}>
									<Button variant="ghost" className="w-full justify-start">
										{adminGuideLabel}
									</Button>
								</Link>
							</>
						)}
					</div>
					{isAdmin && (
						<Link
							href="/admin/settings"
							onClick={() => setOpen(false)}
							className="block border-t"
						>
							<Button
								variant="ghost"
								className="w-full justify-start gap-2 px-3 py-2"
							>
								<Settings className="h-4 w-4" />
								Settings
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
