import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { auth } from "@/server/auth";
import { ConfirmTripForm } from "@/app/_components/trip-requests/confirm-trip-form";

export default async function ConfirmTripPage({
	params,
}: {
	params: Promise<{ locale: string; id: string }>;
}) {
	const { locale, id } = await params;
	setRequestLocale(locale);

	const session = await auth();

	if (!session?.user) {
		redirect("/auth/signin");
	}

	return (
		<div className="container mx-auto max-w-4xl py-10">
			<ConfirmTripForm requestId={id} />
		</div>
	);
}
