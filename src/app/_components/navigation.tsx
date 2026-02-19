import Link from "next/link";
import { auth } from "@/server/auth";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/app/_components/sign-out-button";

export async function Navigation() {
	const session = await auth();

	if (!session?.user) {
		return null;
	}

	return (
		<nav className="border-b">
			<div className="container mx-auto px-4 py-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-6">
						<Link href="/" className="text-xl font-bold">
							Trip Manager
						</Link>
						<div className="flex gap-4">
							<Link href="/dashboard">
								<Button variant="ghost">My Trips</Button>
							</Link>
							{session.user.role === "ADMIN" && (
								<Link href="/admin">
									<Button variant="ghost">Admin Dashboard</Button>
								</Link>
							)}
						</div>
					</div>
					<div className="flex items-center gap-4">
						<span className="text-sm text-muted-foreground">
							{session.user.name || session.user.email}
						</span>
						<SignOutButton />
					</div>
				</div>
			</div>
		</nav>
	);
}
