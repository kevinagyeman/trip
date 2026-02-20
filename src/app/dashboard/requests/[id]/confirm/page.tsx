import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";
import { ConfirmTripForm } from "@/app/_components/trip-requests/confirm-trip-form";

export default async function ConfirmTripPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const session = await getServerAuthSession();

	if (!session?.user) {
		redirect("/auth/signin");
	}

	const { id } = await params;

	return (
		<div className="container mx-auto max-w-4xl py-10">
			<ConfirmTripForm requestId={id} />
		</div>
	);
}
