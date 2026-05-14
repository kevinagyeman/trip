"use client";

import { SectionCard } from "@/app/_components/ui/section-card";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

type EventActor = "admin" | "customer";
type EventType =
	| "request_submitted"
	| "quotation_sent"
	| "quotation_accepted"
	| "quotation_rejected"
	| "trip_confirmed"
	| "pickup_info_sent"
	| "departure_updated"
	| "confirmation_viewed"
	| "pickup_info_viewed";

interface Event {
	type: EventType;
	actor: EventActor;
	at: Date;
}

interface Props {
	events: Event[];
	adminViewedAt?: Date | null;
}

export function EventsTimeline({ events, adminViewedAt }: Props) {
	const t = useTranslations("adminDetail");

	const labelMap: Record<EventType, string> = {
		request_submitted: t("eventRequestSubmitted"),
		quotation_sent: t("eventQuotationSent"),
		quotation_accepted: t("eventQuotationAccepted"),
		quotation_rejected: t("eventQuotationRejected"),
		trip_confirmed: t("eventTripConfirmed"),
		pickup_info_sent: t("eventPickupInfoSent"),
		departure_updated: t("eventDepartureUpdated"),
		confirmation_viewed: t("eventConfirmationViewed"),
		pickup_info_viewed: t("eventPickupInfoViewed"),
	};

	return (
		<SectionCard title={t("events")} contentClassName="pt-0">
			<div>
				{events.map((event, i) => {
					const isNew =
						adminViewedAt === null ||
						adminViewedAt === undefined ||
						event.at > adminViewedAt;

					return (
						<div key={i} className="flex gap-3">
							{/* Content */}
							<div className="flex w-full items-baseline gap-2 pb-4">
								<p className="text-sm">
									<span
										className={
											event.actor === "admin"
												? "text-blue-500"
												: "text-muted-foreground"
										}
									>
										{event.actor === "admin"
											? t("actorAdmin")
											: t("actorCustomer")}
									</span>
									{" · "}
									<span className="font-medium">{labelMap[event.type]}</span>
								</p>
								<span className="shrink-0 text-xs text-muted-foreground">
									{format(new Date(event.at), "d MMM HH:mm")}
								</span>
							</div>
						</div>
					);
				})}
			</div>
		</SectionCard>
	);
}
