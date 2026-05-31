import { CreateTripRequestForm } from "@/app/_components/trip-requests/create-trip-request-form";
import { SectionCard } from "@/app/_components/ui/section-card";
import { db } from "@/server/db";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
	params,
}: {
	params: Params;
}): Promise<Metadata> {
	const { slug } = await params;
	const company = await db.company.findUnique({
		where: { slug, isActive: true },
		select: { name: true, coverPhotoUrl: true, logoUrl: true },
	});

	if (!company) return {};

	const ogImage = company.coverPhotoUrl ?? company.logoUrl;
	const title = `${company.name} – Book your transfer`;
	const description = `Request a transfer with ${company.name}. Fill in the form and receive a quote.`;

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			images: [{ url: ogImage ?? "/cover-demo.png" }],
		},
	};
}

export default async function BookingPortalPage({
	params,
}: {
	params: Params;
}) {
	const { slug } = await params;

	const company = await db.company.findUnique({
		where: { slug, isActive: true },
		select: {
			name: true,
			slug: true,
			logoUrl: true,
			coverPhotoUrl: true,
			brandColor: true,
		},
	});

	if (!company) {
		notFound();
	}

	const brandColor = company.brandColor ?? null;

	return (
		<div style={brandColor ? { backgroundColor: brandColor } : undefined}>
			<div className="relative h-64 w-full overflow-hidden">
				<Image
					src={company.coverPhotoUrl ?? "/cover-demo.png"}
					alt=""
					fill
					unoptimized
					className="object-cover"
					priority
				/>
				<div className="absolute inset-0 bg-black/30" />
			</div>
			<div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
				<SectionCard contentClassName="space-y-4 pt-0">
					{company.logoUrl && (
						<Image
							src={company.logoUrl}
							alt={company.name}
							width={200}
							height={80}
							unoptimized
							className="mx-auto h-20 w-auto object-contain"
						/>
					)}
					<h1 className="sm:text-3xl text-lg font-bold text-center">
						{company.name}
					</h1>
				</SectionCard>

				<div>
					<CreateTripRequestForm companySlug={slug} />
				</div>
			</div>
		</div>
	);
}
