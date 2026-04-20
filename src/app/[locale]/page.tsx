import { auth } from "@/server/auth";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { LandingPage } from "@/app/_components/landing/landing-page";

export default async function Home({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	const session = await auth();

	if (session?.user) {
		if (session.user.role === "SUPER_ADMIN") redirect("/super-admin");
		if (session.user.role === "ADMIN") redirect("/admin");
		redirect("/dashboard");
	}

	return <LandingPage />;
}
