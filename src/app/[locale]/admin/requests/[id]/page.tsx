import { notFound, redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import { AdminRequestDetail } from "@/app/_components/admin/admin-request-detail";

export default async function AdminRequestPage({
	params,
}: {
	params: Promise<{ locale: string; id: string }>;
}) {
	const { locale, id } = await params;
	setRequestLocale(locale);

	const session = await auth();

	if (!session?.user || session.user.role !== "ADMIN") {
		redirect("/");
	}

	try {
		await api.tripRequest.getByIdAdmin.prefetch({ id });
	} catch {
		notFound();
	}

	return (
		<HydrateClient>
			<div className="container mx-auto py-8">
				<AdminRequestDetail requestId={id} />
			</div>
		</HydrateClient>
	);
}
