import { db } from "@/server/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import { CreateTripRequestForm } from "@/app/_components/trip-requests/create-trip-request-form";

export default async function BookingPortalPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;

	const company = await db.company.findUnique({
		where: { slug, isActive: true },
		select: { name: true, slug: true, logoUrl: true },
	});

	if (!company) {
		notFound();
	}

	return (
		<div className="min-h-[calc(100vh-65px)] bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
			<div className="mx-auto max-w-2xl py-8 space-y-6">
				<div className="text-center space-y-3">
					{company.logoUrl && (
						<Image
							src={company.logoUrl}
							alt={company.name}
							width={200}
							height={80}
							className="mx-auto h-20 w-auto object-contain"
						/>
					)}
					<h1 className="text-3xl font-bold">{company.name}</h1>
				</div>

				<div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6">
					<CreateTripRequestForm companySlug={slug} />
				</div>
			</div>
		</div>
	);
}
