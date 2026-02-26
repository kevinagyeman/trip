"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/app/_components/theme-toggle";
import { SignOutButton } from "@/app/_components/sign-out-button";
import { Link } from "@/i18n/navigation";

interface MobileMenuProps {
	userName: string;
	isAdmin: boolean;
	isSuperAdmin: boolean;
	myTripsLabel: string;
	adminLabel: string;
	superAdminLabel: string;
}

export function MobileMenu({
	userName,
	isAdmin,
	isSuperAdmin,
	myTripsLabel,
	adminLabel,
	superAdminLabel,
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
						{!isSuperAdmin && (
							<Link href="/dashboard" onClick={() => setOpen(false)}>
								<Button variant="ghost" className="w-full justify-start">
									{myTripsLabel}
								</Button>
							</Link>
						)}
						{isAdmin && (
							<Link href="/admin" onClick={() => setOpen(false)}>
								<Button variant="ghost" className="w-full justify-start">
									{adminLabel}
								</Button>
							</Link>
						)}
						{isSuperAdmin && (
							<Link href="/super-admin" onClick={() => setOpen(false)}>
								<Button variant="ghost" className="w-full justify-start">
									{superAdminLabel}
								</Button>
							</Link>
						)}
					</div>
					<div className="flex items-center justify-between border-t p-3">
						<ThemeToggle />
						<SignOutButton />
					</div>
				</div>
			)}
		</div>
	);
}
