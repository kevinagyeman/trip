import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { auth } from "@/server/auth";
import { CreateQuotationForm } from "@/app/_components/admin/create-quotation-form";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default async function NewQuotationPage({
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

	return (
		<div className="container mx-auto max-w-2xl py-8">
			<div className="mb-6">
				<Link href={`/admin/requests/${id}`}>
					<Button variant="outline">← Back to Request</Button>
				</Link>
			</div>
			<h1 className="mb-6 text-3xl font-bold">Create New Quotation</h1>
			<CreateQuotationForm tripRequestId={id} />
		</div>
	);
}
