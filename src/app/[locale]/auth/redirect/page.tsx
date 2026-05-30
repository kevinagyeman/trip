import { auth } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function AuthRedirectPage() {
	const session = await auth();
	const role = session?.user?.role;

	if (role === "SUPER_ADMIN") redirect("/super-admin");
	if (role === "ADMIN") redirect("/admin");
	redirect("/dashboard");
}
