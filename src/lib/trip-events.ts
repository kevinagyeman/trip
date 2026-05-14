export type EventActor = "admin" | "customer";

export type EventType =
	| "request_submitted"
	| "quotation_sent"
	| "quotation_accepted"
	| "quotation_rejected"
	| "trip_confirmed"
	| "pickup_info_sent"
	| "departure_updated"
	| "confirmation_viewed"
	| "pickup_info_viewed";

export interface TripEvent {
	type: EventType;
	actor: EventActor;
	at: Date;
}
