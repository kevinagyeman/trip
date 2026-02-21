import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { auth } from "@/server/auth";
import { CreateTripRequestForm } from "@/app/_components/trip-requests/create-trip-request-form";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default async function NewTripRequestPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	const session = await auth();
	if (!session?.user) {
		redirect("/");
	}

	return (
		<div className="container mx-auto max-w-2xl py-8">
			<div className="mb-6">
				<Link href="/dashboard">
					<Button variant="outline">← Back to Dashboard</Button>
				</Link>
			</div>
			<h1 className="mb-6 text-3xl font-bold">New Trip Request</h1>
			<CreateTripRequestForm />
		</div>
	);
}
