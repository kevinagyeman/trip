import { PublicTripRequestDetail } from "@/app/_components/trip-requests/public-trip-request-detail";
import { api } from "@/trpc/server";
import { notFound } from "next/navigation";

export default async function PublicRequestPage({
	params,
}: {
	params: Promise<{ token: string }>;
}) {
	const { token } = await params;

	try {
		await api.tripRequest.getByToken({ token });
	} catch {
		notFound();
	}

	return (
		<div className="container mx-auto max-w-3xl p-4">
			<PublicTripRequestDetail token={token} />
		</div>
	);
}
