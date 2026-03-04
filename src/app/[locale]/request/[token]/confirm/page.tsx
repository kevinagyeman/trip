import { api } from "@/trpc/server";
import { notFound } from "next/navigation";
import { PublicConfirmTripForm } from "@/app/_components/trip-requests/public-confirm-trip-form";

export default async function PublicConfirmPage({
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
			<PublicConfirmTripForm token={token} />
		</div>
	);
}
