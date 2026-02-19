import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import { MyTripRequests } from "@/app/_components/trip-requests/my-trip-requests";
import { CreateTripRequestButton } from "@/app/_components/trip-requests/create-trip-request-button";

export default async function DashboardPage() {
	const session = await auth();

	if (!session?.user) {
		redirect("/");
	}

	// Prefetch data for React Query
	void api.tripRequest.getMyRequests.prefetch();

	return (
		<HydrateClient>
			<div className="container mx-auto py-8">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-3xl font-bold">My Trip Requests</h1>
					<CreateTripRequestButton />
				</div>
				<MyTripRequests />
			</div>
		</HydrateClient>
	);
}
