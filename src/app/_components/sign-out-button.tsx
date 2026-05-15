"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function SignOutButton() {
	return (
		<Button
			type="button"
			variant="ghost"
			size="icon"
			onClick={() => signOut({ callbackUrl: "/" })}
		>
			<LogOut className="h-4 w-4" />
		</Button>
	);
}
