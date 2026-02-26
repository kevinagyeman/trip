import { api, HydrateClient } from "@/trpc/server";
import { SuperAdminDashboard } from "@/app/_components/super-admin/super-admin-dashboard";

export default async function SuperAdminPage() {
	void api.company.getAll.prefetch();

	return (
		<HydrateClient>
			<SuperAdminDashboard />
		</HydrateClient>
	);
}
