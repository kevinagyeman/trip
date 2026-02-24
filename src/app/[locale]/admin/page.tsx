import { redirect } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import { AllTripRequests } from "@/app/_components/admin/all-trip-requests";

export default async function AdminDashboardPage({
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

	if (session.user.role !== "ADMIN") {
		redirect("/dashboard");
	}

	const t = await getTranslations("dashboard");

	await api.tripRequest.getAllRequests.prefetch();

	return (
		<HydrateClient>
			<div className="container mx-auto px-4 py-8">
				<h1 className="mb-6 text-3xl font-bold">{t("adminTitle")}</h1>
				<AllTripRequests />
			</div>
		</HydrateClient>
	);
}
