import { CreateTripRequestForm } from "@/app/_components/trip-requests/create-trip-request-form";
import { SectionCard } from "@/app/_components/ui/section-card";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function PublicBookPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations("publicQuote");
	const tReq = await getTranslations("requestDetail");

	return (
		<div className="mx-auto max-w-2xl space-y-6 p-4">
			<SectionCard contentClassName="space-y-4">
				<h1 className="text-2xl font-bold">{t("title")}</h1>
				<p className="text-sm text-muted-foreground">{t("subtitle")}</p>
			</SectionCard>
			<CreateTripRequestForm companySlug="demo" isPublic />
		</div>
	);
}
