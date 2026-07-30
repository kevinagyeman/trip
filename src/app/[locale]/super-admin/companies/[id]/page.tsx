import { CompanyDetail } from "@/app/_components/super-admin/company-detail";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { api, HydrateClient } from "@/trpc/server";

export default async function CompanyDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	void api.company.getById.prefetch({ id });

	return (
		<HydrateClient>
			<div className="container mx-auto max-w-4xl p-4">
				<div className="mb-6">
					<Link href="/super-admin">
						<Button variant="outline" size="sm">
							← Back to Dashboard
						</Button>
					</Link>
				</div>
				<CompanyDetail id={id} />
			</div>
		</HydrateClient>
	);
}
