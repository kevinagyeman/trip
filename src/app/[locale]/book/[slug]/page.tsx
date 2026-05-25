import { CreateTripRequestForm } from "@/app/_components/trip-requests/create-trip-request-form";
import { SectionCard } from "@/app/_components/ui/section-card";
import { db } from "@/server/db";
import Image from "next/image";
import { notFound } from "next/navigation";

export default async function BookingPortalPage({
	params,
}: {
	params: Promise<{ slug: string }>;
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
			{company.coverPhotoUrl && (
				<div className="relative h-64 w-full overflow-hidden">
					<Image
						src={company.coverPhotoUrl}
						alt=""
						fill
						unoptimized
						className="object-cover"
						priority
					/>
					<div className="absolute inset-0 bg-black/30" />
				</div>
			)}
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
