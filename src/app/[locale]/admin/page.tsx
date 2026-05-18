import { AllTripRequests } from "@/app/_components/admin/all-trip-requests";
import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

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

	if (session.user.role === "SUPER_ADMIN") {
		redirect("/super-admin");
	}

	if (session.user.role !== "ADMIN") {
		redirect("/dashboard");
	}

	const t = await getTranslations("adminDashboard");

	await Promise.all([
		api.tripRequest.getStats.prefetch(),
		api.tripRequest.getAllRequests.prefetch(),
	]);

	return (
		<HydrateClient>
			<div className="container mx-auto p-4">
				<h1 className="mb-6 text-3xl font-bold">{t("title")}</h1>
				<div className="space-y-8">
					<AllTripRequests />
				</div>
			</div>
		</HydrateClient>
	);
}
