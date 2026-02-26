import { api, HydrateClient } from "@/trpc/server";
import { CompanyDetail } from "@/app/_components/super-admin/company-detail";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";

export default async function CompanyDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const t = await getTranslations("superAdmin");

	void api.company.getById.prefetch({ id });

	return (
		<HydrateClient>
			<div className="container mx-auto max-w-4xl px-4 py-8">
				<div className="mb-6">
					<Link href="/super-admin">
						<Button variant="ghost" size="sm">
							← {t("backToDashboard")}
						</Button>
					</Link>
				</div>
				<CompanyDetail id={id} />
			</div>
		</HydrateClient>
	);
}
