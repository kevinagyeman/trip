import { SuperAdminDashboard } from "@/app/_components/super-admin/super-admin-dashboard";
import { api, HydrateClient } from "@/trpc/server";

export default async function SuperAdminPage() {
	void api.company.getAll.prefetch();

	return (
		<HydrateClient>
			<SuperAdminDashboard />
		</HydrateClient>
	);
}
