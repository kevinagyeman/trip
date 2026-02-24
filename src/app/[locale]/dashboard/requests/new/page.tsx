import { redirect } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { auth } from "@/server/auth";
import { CreateTripRequestForm } from "@/app/_components/trip-requests/create-trip-request-form";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default async function NewTripRequestPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	const session = await auth();
	if (!session?.user) {
		redirect("/");
	}

	const t = await getTranslations("pages");

	return (
		<div className="container mx-auto max-w-2xl px-4 py-8">
			<div className="mb-6">
				<Link href="/dashboard">
					<Button variant="outline">{t("backToDashboard")}</Button>
				</Link>
			</div>
			<h1 className="mb-6 text-3xl font-bold">{t("newTripRequest")}</h1>
			<CreateTripRequestForm />
		</div>
	);
}
