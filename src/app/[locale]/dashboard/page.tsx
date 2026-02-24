import { redirect } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import { MyTripRequests } from "@/app/_components/trip-requests/my-trip-requests";
import { CreateTripRequestButton } from "@/app/_components/trip-requests/create-trip-request-button";

export default async function DashboardPage({
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

	const t = await getTranslations("dashboard");

	await api.tripRequest.getMyRequests.prefetch();

	return (
		<HydrateClient>
			<div className="container mx-auto px-4 py-8">
				<div className="mb-6 flex items-center justify-between">
					<h1 className="text-3xl font-bold">{t("title")}</h1>
					<CreateTripRequestButton />
				</div>
				<MyTripRequests />
			</div>
		</HydrateClient>
	);
}
