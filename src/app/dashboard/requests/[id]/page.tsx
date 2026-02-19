import { notFound, redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import { TripRequestDetail } from "@/app/_components/trip-requests/trip-request-detail";

export default async function TripRequestPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const session = await auth();

	if (!session?.user) {
		redirect("/");
	}

	const { id } = await params;

	try {
		void api.tripRequest.getById.prefetch({ id });
	} catch {
		notFound();
	}

	return (
		<HydrateClient>
			<div className="container mx-auto py-8">
				<TripRequestDetail requestId={id} />
			</div>
		</HydrateClient>
	);
}
