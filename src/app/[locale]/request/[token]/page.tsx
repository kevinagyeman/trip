import { api } from "@/trpc/server";
import { notFound } from "next/navigation";
import { PublicTripRequestDetail } from "@/app/_components/trip-requests/public-trip-request-detail";

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
		<div className="container mx-auto max-w-3xl py-8 px-4">
			<PublicTripRequestDetail token={token} />
		</div>
	);
}
