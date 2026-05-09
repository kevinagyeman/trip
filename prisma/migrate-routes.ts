/**
 * One-shot data migration: reads all existing TripRequest.routes (JSON text)
 * and inserts rows into the new Route table.
 *
 * Run with:  npx tsx prisma/migrate-routes.ts
 *
 * Safe to re-run — skips requests that already have Route rows.
 */

import { PrismaClient } from "../generated/prisma";

const db = new PrismaClient();

type LegacyPickupInfo = {
	meetingPoint?: string;
	beThereAtDate?: string;
	beThereAtTime?: string;
	driverName?: string;
	driverPhone?: string;
	additionalInfo?: string;
};

type LegacyRoute = {
	pickup: string;
	destination: string;
	type?: "airport_in" | "airport_out" | "standard" | "airport";
	departureDate?: string;
	departureTime?: string;
	flightNumber?: string;
	pickupInfo?: LegacyPickupInfo;
};

async function main() {
	const requests = await db.tripRequest.findMany({
		select: { id: true, routes: true },
		where: { routesList: { none: {} } }, // skip already-migrated
	});

	console.log(`Migrating ${requests.length} trip requests…`);
	let ok = 0;
	let skipped = 0;

	for (const req of requests) {
		let parsed: LegacyRoute[];
		try {
			parsed = JSON.parse(req.routes);
			if (!Array.isArray(parsed)) throw new Error("not an array");
		} catch {
			console.warn(`  [SKIP] ${req.id} — could not parse routes JSON`);
			skipped++;
			continue;
		}

		await db.route.createMany({
			data: parsed.map((r, i) => ({
				tripRequestId: req.id,
				position: i,
				type: r.type ?? "standard",
				pickup: r.pickup,
				destination: r.destination,
				scheduledDate: r.departureDate ?? null,
				scheduledTime: r.departureTime ?? null,
				flightNumber: r.flightNumber ?? null,
				meetingPoint: r.pickupInfo?.meetingPoint ?? null,
				beThereAtDate: r.pickupInfo?.beThereAtDate ?? null,
				beThereAtTime: r.pickupInfo?.beThereAtTime ?? null,
				driverName: r.pickupInfo?.driverName ?? null,
				driverPhone: r.pickupInfo?.driverPhone ?? null,
				additionalInfo: r.pickupInfo?.additionalInfo ?? null,
			})),
		});
		ok++;
	}

	console.log(`Done. Migrated: ${ok}, skipped: ${skipped}`);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(() => db.$disconnect());
