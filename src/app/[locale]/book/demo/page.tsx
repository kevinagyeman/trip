import { CreateTripRequestForm } from "@/app/_components/trip-requests/create-trip-request-form";
import { DemoDashboardPreview } from "@/app/_components/trip-requests/demo-dashboard-preview";
import { SectionCard } from "@/app/_components/ui/section-card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Check } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";

type SearchParams = Promise<{
	company?: string;
	logo?: string;
	coverphoto?: string;
}>;

type Params = Promise<{ locale: string }>;

export async function generateMetadata({
	searchParams,
}: {
	searchParams: SearchParams;
}): Promise<Metadata> {
	const { company, logo, coverphoto } = await searchParams;
	const ogImage = coverphoto ?? logo;
	const title = company
		? `${company} – Book your transfer`
		: "Demo – Book your transfer";
	const description = company
		? `Request a transfer with ${company}. Fill in the form and receive a quote.`
		: "Request a transfer. Fill in the form and receive a quote.";

	return {
		title,
		description,
		openGraph: {
			title: company ?? "Demo",
			description,
			images: [{ url: ogImage ?? "/cover-demo.png" }],
		},
	};
}

export default async function DemoBookingPage({
	params,
	searchParams,
}: {
	params: Params;
	searchParams: SearchParams;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	const { company, logo, coverphoto } = await searchParams;
	const t = await getTranslations("bookingDemo");
	const tForm = await getTranslations("tripRequest");
	const tPricing = await getTranslations("pricing");

	const features: string[] = [
		tPricing("feature1"),
		tPricing("feature2"),
		tPricing("feature3"),
		tPricing("feature4"),
		tPricing("feature5"),
		tPricing("feature6"),
		tPricing("feature7"),
		tPricing("feature8"),
		tPricing("feature9"),
	];

	return (
		<div className="mx-auto max-w-2xl space-y-6 p-4">
			<h2 className="text-center text-lg font-bold sm:text-3xl">
				{t("customerViewTitle")}
			</h2>

			<div className="relative w-full overflow-hidden rounded-xl aspect-[16/9]">
				<Image
					src={coverphoto ?? "/cover-demo.png"}
					alt=""
					fill
					unoptimized
					className="object-cover"
					priority
				/>
				{/* Overlay */}
				{!coverphoto && (
					<div className="absolute inset-0 flex items-center justify-center bg-gray-600/70">
						<span className="text-white text-lg font-semibold drop-shadow">
							{t("coverLabel")}
						</span>
					</div>
				)}
			</div>

			<SectionCard contentClassName="space-y-4">
				<div className="mx-auto w-fit rounded-xl bg-white p-4">
					<Image
						src={logo ?? "/logo-sample.png"}
						alt={company ?? "Company"}
						width={200}
						height={80}
						unoptimized
						className="h-20 object-contain"
					/>
				</div>
				<h1 className="text-center text-lg font-bold sm:text-3xl">
					{company ?? t("companyNamePlaceholder")}
				</h1>
			</SectionCard>

			<div>
				<CreateTripRequestForm companySlug="demo" isDemo />
			</div>

			<h2 className="text-center text-lg font-bold sm:text-3xl mt-6">
				{t("adminViewTitle")}
			</h2>

			<DemoDashboardPreview />

			<h2 className="text-center text-lg font-bold sm:text-3xl mt-6">
				{t("featuresTitle")}
			</h2>

			<SectionCard contentClassName="pt-0">
				<ul className="space-y-3">
					{features.map((feature) => (
						<li key={feature} className="flex items-start gap-3 text-sm">
							<Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
							<span>{feature}</span>
						</li>
					))}
				</ul>
			</SectionCard>

			<div className="text-center">
				<Button asChild variant="link">
					<Link href="/">{t("discoverMore")}</Link>
				</Button>
			</div>

			<SectionCard contentClassName="space-y-3 pt-0 text-center">
				<p className="text-muted-foreground">{tForm("demoCtaDescription")}</p>
				<Button asChild size="lg" className="w-full">
					<Link href="/register-company">{tForm("demoCtaButton")}</Link>
				</Button>
			</SectionCard>
		</div>
	);
}
