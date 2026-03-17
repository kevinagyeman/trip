import { redirect } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { CreateTripRequestForm } from "@/app/_components/trip-requests/create-trip-request-form";
import { parseQuickFillOptions } from "@/lib/trip-utils";
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

	const companyId = session.user.companyId;
	if (!companyId) {
		redirect("/dashboard");
	}

	const company = await db.company.findUnique({
		where: { id: companyId },
		select: { slug: true, quickFillOptions: true },
	});

	if (!company) {
		redirect("/dashboard");
	}

	const quickFillOptions = parseQuickFillOptions(
		company.quickFillOptions ?? "",
	);
	const t = await getTranslations("pages");

	return (
		<div className="container mx-auto max-w-2xl px-4 py-8">
			<div className="mb-6">
				<Link href="/dashboard">
					<Button variant="outline">{t("backToDashboard")}</Button>
				</Link>
			</div>
			<h1 className="mb-6 text-3xl font-bold">{t("newTripRequest")}</h1>
			<CreateTripRequestForm
				companySlug={company.slug}
				quickFillOptions={quickFillOptions}
			/>
		</div>
	);
}
