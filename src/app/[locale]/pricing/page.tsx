import { PricingPage } from "@/app/_components/landing/pricing-page";
import { setRequestLocale } from "next-intl/server";

export default async function Pricing({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	return <PricingPage />;
}
