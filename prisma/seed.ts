import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

const COMPANY_ID = "cmmayjafc0002h8j5q6edyxp6";

async function main() {
	const admin = await prisma.user.findFirst({
		where: { companyId: COMPANY_ID, role: "ADMIN" },
	});
	if (!admin) throw new Error("No admin found for this company");

	console.log(`Seeding 5 demo trips for company ${COMPANY_ID}…`);

	const trips = [
		{
			status: "PENDING" as const,
			firstName: "James",
			lastName: "Mitchell",
			customerEmail: "james.mitchell@demo.com",
			phone: "+44 7700 900123",
			language: "en",
			numberOfAdults: 2,
			areThereChildren: false,
			routes: JSON.stringify([
				{
					pickup: "JFK International Airport, New York",
					destination: "The Plaza Hotel, 5th Avenue, New York",
					departureDate: "2026-05-10",
					departureTime: "14:30",
					flightNumber: "AA101",
				},
			]),
			createdAt: new Date("2026-04-18T09:12:00Z"),
		},
		{
			status: "QUOTED" as const,
			firstName: "Emma",
			lastName: "Rossi",
			customerEmail: "emma.rossi@demo.com",
			phone: "+39 347 1234567",
			language: "it",
			numberOfAdults: 3,
			areThereChildren: false,
			routes: JSON.stringify([
				{
					pickup: "Milan Malpensa Airport (MXP)",
					destination: "Hotel de la Ville, Milan",
					departureDate: "2026-05-08",
					departureTime: "11:00",
					flightNumber: "AZ612",
				},
			]),
			createdAt: new Date("2026-04-15T10:00:00Z"),
			quotation: {
				price: 180,
				isPriceEachWay: false,
				areCarSeatsIncluded: false,
				quotationAdditionalInfo: "Meet & greet at arrivals with name sign. Toll included.",
			},
		},
		{
			status: "ACCEPTED" as const,
			firstName: "Olivia",
			lastName: "Smith",
			customerEmail: "olivia.smith@demo.com",
			phone: "+44 7911 123456",
			language: "en",
			numberOfAdults: 2,
			areThereChildren: true,
			numberOfChildren: 1,
			ageOfChildren: "4",
			numberOfChildSeats: 1,
			routes: JSON.stringify([
				{
					pickup: "Heathrow Airport Terminal 5, London",
					destination: "The Savoy Hotel, Strand, London",
					departureDate: "2026-05-01",
					departureTime: "08:15",
					flightNumber: "BA456",
				},
			]),
			createdAt: new Date("2026-04-10T11:00:00Z"),
			quotation: {
				price: 145,
				isPriceEachWay: false,
				areCarSeatsIncluded: true,
				quotationAdditionalInfo: "Child seat included. Driver will wait at arrivals.",
			},
		},
		{
			status: "CONFIRMED" as const,
			firstName: "Marco",
			lastName: "Ferrari",
			customerEmail: "marco.ferrari@demo.com",
			phone: "+39 348 7654321",
			language: "it",
			numberOfAdults: 4,
			areThereChildren: false,
			routes: JSON.stringify([
				{
					pickup: "Rome Fiumicino Airport (FCO)",
					destination: "Hotel Hassler, Trinità dei Monti, Rome",
					departureDate: "2026-04-28",
					departureTime: "10:30",
					flightNumber: "AZ1234",
				},
			]),
			createdAt: new Date("2026-04-05T08:00:00Z"),
			quotation: {
				price: 220,
				isPriceEachWay: false,
				areCarSeatsIncluded: false,
				quotationAdditionalInfo: "Minivan. Meet & greet in arrivals hall.",
			},
		},
		{
			status: "COMPLETED" as const,
			firstName: "Sophie",
			lastName: "Dupont",
			customerEmail: "sophie.dupont@demo.com",
			phone: "+33 6 12 34 56 78",
			language: "en",
			numberOfAdults: 2,
			areThereChildren: false,
			routes: JSON.stringify([
				{
					pickup: "Nice Côte d'Azur Airport (NCE)",
					destination: "Monte-Carlo, Place du Casino, Monaco",
					departureDate: "2026-04-02",
					departureTime: "19:45",
				},
			]),
			createdAt: new Date("2026-03-28T12:00:00Z"),
			quotation: {
				price: 95,
				isPriceEachWay: true,
				areCarSeatsIncluded: false,
			},
		},
	];

	for (const req of trips) {
		const { quotation, ...tripData } = req as typeof req & {
			quotation?: {
				price: number;
				isPriceEachWay: boolean;
				areCarSeatsIncluded: boolean;
				quotationAdditionalInfo?: string;
			};
		};

		const trip = await prisma.tripRequest.create({
			data: {
				...tripData,
				companyId: COMPANY_ID,
				privacyAcceptedAt: new Date(),
			},
		});

		if (quotation) {
			await prisma.quotation.create({
				data: {
					tripRequestId: trip.id,
					createdById: admin.id,
					price: quotation.price,
					currency: "EUR",
					isPriceEachWay: quotation.isPriceEachWay,
					areCarSeatsIncluded: quotation.areCarSeatsIncluded,
					quotationAdditionalInfo: quotation.quotationAdditionalInfo ?? null,
					status:
						trip.status === "ACCEPTED" || trip.status === "CONFIRMED" || trip.status === "COMPLETED"
							? "ACCEPTED"
							: "PENDING",
					notifiedAt: new Date(),
					respondedAt:
						trip.status === "ACCEPTED" || trip.status === "CONFIRMED" || trip.status === "COMPLETED"
							? new Date()
							: null,
				},
			});
		}

		// Add a demo conversation to the QUOTED trip (Emma Rossi)
		if (trip.status === "QUOTED" && tripData.firstName === "Emma") {
			const messages = [
				{
					senderType: "CUSTOMER" as const,
					senderName: "Emma Rossi",
					body: "Hi! I just submitted my transfer request. I wanted to let you know I'm travelling with quite a lot of luggage — 3 large suitcases and 2 carry-ons. Will that be a problem?",
					createdAt: new Date("2026-04-15T10:05:00Z"),
				},
				{
					senderType: "ADMIN" as const,
					senderName: "Support",
					body: "Hi Emma! No problem at all — we'll assign a large vehicle with plenty of boot space. I've also noted it on your booking. I'll send you the quote shortly.",
					createdAt: new Date("2026-04-15T10:22:00Z"),
				},
				{
					senderType: "CUSTOMER" as const,
					senderName: "Emma Rossi",
					body: "Perfect, thank you! Also, is it possible to get a receipt once the trip is confirmed? I need it for work expenses.",
					createdAt: new Date("2026-04-15T10:35:00Z"),
				},
				{
					senderType: "ADMIN" as const,
					senderName: "Support",
					body: "Absolutely, we'll send a full receipt to your email after confirmation. Your quote is now ready — please check it and let us know if you have any questions!",
					createdAt: new Date("2026-04-15T10:48:00Z"),
				},
				{
					senderType: "CUSTOMER" as const,
					senderName: "Emma Rossi",
					body: "Great, the price looks good! I'll accept it now. See you at the airport 🙂",
					createdAt: new Date("2026-04-15T11:02:00Z"),
				},
			];

			for (const msg of messages) {
				await prisma.tripMessage.create({
					data: { ...msg, tripRequestId: trip.id },
				});
			}
			console.log(`    💬 5 demo messages added`);
		}

		console.log(`  ✓ [${trip.status}] ${tripData.firstName} ${tripData.lastName}`);
	}

	console.log("\nDone — 5 demo trips created.");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
