import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import { AllTripRequests } from "@/app/_components/admin/all-trip-requests";

export default async function AdminDashboardPage() {
	const session = await auth();

	if (!session?.user) {
		redirect("/");
	}

	if (session.user.role !== "ADMIN") {
		redirect("/dashboard");
	}

	void api.tripRequest.getAllRequests.prefetch();

	return (
		<HydrateClient>
			<div className="container mx-auto py-8">
				<h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
				<AllTripRequests />
			</div>
		</HydrateClient>
	);
}
