import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { auth } from "@/server/auth";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function Home({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	const session = await auth();

	if (session?.user) {
		if (session.user.role === "ADMIN") {
			redirect("/admin");
		} else {
			redirect("/dashboard");
		}
	}

	return <HomeContent />;
}

function HomeContent() {
	const t = useTranslations("home");

	return (
		<div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
			<Link href="/auth/signin">
				<Button size="lg" variant="outline" className="px-8 text-lg">
					{t("signIn")}
				</Button>
			</Link>
		</div>
	);
}
