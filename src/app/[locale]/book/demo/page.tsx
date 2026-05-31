import { CreateTripRequestForm } from "@/app/_components/trip-requests/create-trip-request-form";
import { SectionCard } from "@/app/_components/ui/section-card";
import type { Metadata } from "next";
import Image from "next/image";

type SearchParams = Promise<{
	company?: string;
	logo?: string;
	coverphoto?: string;
}>;

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
	searchParams,
}: {
	searchParams: SearchParams;
}) {
	const { company, logo, coverphoto } = await searchParams;

	return (
		<div>
			<div className="relative h-64 w-full overflow-hidden">
				<Image
					src={coverphoto ?? "/cover-demo.png"}
					alt=""
					fill
					unoptimized
					className="object-cover"
					priority
				/>
				<div className="absolute inset-0 bg-black/30" />
			</div>
			<div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
				<SectionCard contentClassName="space-y-4 pt-0">
					{logo && (
						<Image
							src={logo}
							alt={company ?? "Company"}
							width={200}
							height={80}
							unoptimized
							className="mx-auto h-20 w-auto object-contain"
						/>
					)}
					{company && (
						<h1 className="text-center text-lg font-bold sm:text-3xl">
							{company}
						</h1>
					)}
				</SectionCard>

				<div>
					<CreateTripRequestForm companySlug="demo" isDemo />
				</div>
			</div>
		</div>
	);
}
