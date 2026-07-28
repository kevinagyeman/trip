import { AllTripRequests } from "@/app/_components/admin/all-trip-requests";
import { AlertBanner } from "@/app/_components/ui/alert-banner";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { api, HydrateClient } from "@/trpc/server";
import { getTranslations } from "next-intl/server";

type SearchParams = Promise<{ company?: string }>;

export default async function SuperAdminRequestsPage({
	searchParams,
}: {
	searchParams: SearchParams;
}) {
	const { company: initialCompanyId } = await searchParams;
	const t = await getTranslations("superAdmin");

	const companies = await api.company.getAll();

	void api.tripRequest.getAllRequests.prefetch({ companyId: initialCompanyId });
	void api.tripRequest.getStatusCounts.prefetch({
		companyId: initialCompanyId,
	});

	return (
		<HydrateClient>
			<div className="container mx-auto max-w-3xl p-4 space-y-4">
				<div>
					<Link href="/super-admin">
						<Button variant="outline" size="sm">
							← {t("backToDashboard")}
						</Button>
					</Link>
				</div>
				<h1 className="text-2xl font-bold">{t("tripRequests")}</h1>
				<AlertBanner variant="info" description={t("readOnlyBanner")} />
				<AllTripRequests
					companies={companies.map((c) => ({ id: c.id, name: c.name }))}
					initialCompanyId={initialCompanyId}
				/>
			</div>
		</HydrateClient>
	);
}
