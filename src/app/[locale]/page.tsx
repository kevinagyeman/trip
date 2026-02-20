import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

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
			redirect(`/${locale}/admin`);
		} else {
			redirect(`/${locale}/dashboard`);
		}
	}

	return <HomeContent />;
}

function HomeContent() {
	const t = useTranslations("home");

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-8 dark:from-gray-900 dark:to-gray-800">
			<div className="space-y-8 text-center">
				<div className="space-y-4">
					<h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100">
						{t("title")}
					</h1>
					<p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300">
						{t("subtitle")}
					</p>
				</div>

				<div className="space-y-4">
					<div className="flex justify-center gap-4">
						<Link href="/auth/register">
							<Button size="lg" className="px-8 text-lg">
								{t("getStarted")}
							</Button>
						</Link>
						<Link href="/auth/signin">
							<Button size="lg" variant="outline" className="px-8 text-lg">
								{t("signIn")}
							</Button>
						</Link>
					</div>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						{t("accountPrompt")}
					</p>
				</div>

				<div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
					<div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
						<div className="mb-3 text-3xl">✈️</div>
						<h3 className="mb-2 text-lg font-semibold">{t("requestTrips")}</h3>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							{t("requestTripsDesc")}
						</p>
					</div>
					<div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
						<div className="mb-3 text-3xl">💰</div>
						<h3 className="mb-2 text-lg font-semibold">{t("getQuotations")}</h3>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							{t("getQuotationsDesc")}
						</p>
					</div>
					<div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
						<div className="mb-3 text-3xl">🎉</div>
						<h3 className="mb-2 text-lg font-semibold">{t("bookTravel")}</h3>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							{t("bookTravelDesc")}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
