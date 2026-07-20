import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { buildStatusLabels, STATUS_COLORS } from "@/lib/trip-utils";
import { ArrowRight, MoveRight, Tag, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";

const SAMPLE_REQUESTS = [
	{
		orderNumber: 46,
		status: "PENDING",
		name: "James Mitchell",
		email: "james.mitchell@demo.com",
		pickup: "JFK International Airport, New York",
		destination: "The Plaza Hotel, 5th Ave",
		passengers: 2,
	},
	{
		orderNumber: 47,
		status: "QUOTED",
		name: "Emma Rossi",
		email: "emma.rossi@demo.com",
		pickup: "Milan Malpensa Airport (MXP)",
		destination: "Hotel de la Ville, Milan",
		passengers: 3,
		price: "85 EUR",
	},
	{
		orderNumber: 48,
		status: "ACCEPTED",
		name: "Olivia Smith",
		email: "olivia.smith@demo.com",
		pickup: "Heathrow Airport Terminal 5, London",
		destination: "The Savoy Hotel, London",
		passengers: 1,
		price: "120 GBP",
	},
] as const;

export async function DemoDashboardPreview() {
	const t = await getTranslations("adminRequests");
	const statusLabels = buildStatusLabels(t as (key: string) => string);

	return (
		<div className="space-y-3">
			{SAMPLE_REQUESTS.map((request) => (
				<Card
					key={request.orderNumber}
					className="pointer-events-none select-none"
				>
					<CardContent>
						<div className="flex items-start justify-between gap-3 min-w-0">
							<div className="space-y-2 min-w-0 flex-1">
								<div className="flex items-center gap-2">
									<p className="text-muted-foreground text-xs">
										#{String(request.orderNumber).padStart(7, "0")}
									</p>
									<Badge
										className={`px-1.5 py-0 text-xs font-medium ${STATUS_COLORS[request.status]}`}
									>
										{statusLabels[request.status] ?? request.status}
									</Badge>
								</div>

								<div className="text-sm min-w-0">
									<p className="truncate font-semibold">{request.name}</p>
									<p className="truncate text-muted-foreground">
										{request.email}
									</p>
								</div>

								<div className="flex items-center gap-1 text-xs text-muted-foreground min-w-0">
									<span className="h-2 w-2 rounded-full shrink-0 bg-sky-500" />
									<span className="truncate">{request.pickup}</span>
									<MoveRight className="h-3 w-3 shrink-0" />
									<span className="truncate">{request.destination}</span>
								</div>

								<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
									<span className="flex items-center gap-1">
										<Users className="h-3 w-3 shrink-0" />
										{request.passengers}
									</span>
									{"price" in request && (
										<span className="flex items-center gap-1">
											<Tag className="h-3 w-3 shrink-0" />
											{request.price}
										</span>
									)}
								</div>
							</div>

							<div className="shrink-0 self-center rounded-md bg-secondary p-2 text-secondary-foreground">
								<ArrowRight className="h-4 w-4" />
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
