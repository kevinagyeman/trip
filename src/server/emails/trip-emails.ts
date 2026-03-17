import { GenericEmail } from "@/emails/generic-email";
import { APP_URL, resolveAdminEmails, sendEmail } from "@/server/email";
import { createElement } from "react";

function order(orderNumber: number) {
	return `#${String(orderNumber).padStart(7, "0")}`;
}

type TripRequestBase = {
	firstName: string;
	lastName: string;
	orderNumber: number;
};

type AdminTarget = TripRequestBase & {
	id: string;
	companyId: string | null;
};

type CustomerTarget = TripRequestBase & {
	customerEmail: string;
	token: string;
	language?: string | null;
};

// ─── Translations ──────────────────────────────────────────────────────────────

const TRANSLATIONS = {
	en: {
		requestReceived: {
			subject: (o: string, name: string) => `${o} - REQUEST RECEIVED | ${name}`,
			preview: "View your request",
			title: (firstName: string, lastName: string, o: string) =>
				`Dear ${firstName} ${lastName}, your request ${o} has been received.`,
			subtitle: "We'll notify you as soon as a quotation is ready.",
			button: "View Request",
		},
		requestDetails: {
			subject: (o: string, name: string) => `${o} - ACTION REQUIRED | ${name}`,
			preview: "Complete your trip details",
			title: (firstName: string) =>
				`Dear ${firstName}, please complete your departure details.`,
			subtitle:
				"Your quotation has been accepted. To finalise your booking, please fill in the departure date, time.",
			button: "Complete Details",
		},
		quotationReady: {
			subject: (o: string, name: string) => `${o} - QUOTATION READY | ${name}`,
			preview: "View quotation",
			title: (firstName: string, o: string) =>
				`Dear ${firstName}, your quotation for request ${o} is ready.`,
			subtitle: "Review your quotation and accept it when you're ready.",
			button: "View Quotation",
		},
		tripConfirmed: {
			subject: (o: string, name: string) => `${o} - TRIP CONFIRMED | ${name}`,
			preview: "Your trip is confirmed",
			title: (firstName: string) =>
				`Dear ${firstName}, your trip is confirmed!`,
			subtitle: "The operator has confirmed your booking.",
			button: "View Details",
		},
	},
	it: {
		requestReceived: {
			subject: (o: string, name: string) =>
				`${o} - RICHIESTA RICEVUTA | ${name}`,
			preview: "Visualizza la tua richiesta",
			title: (firstName: string, lastName: string, o: string) =>
				`Gentile ${firstName} ${lastName}, la tua richiesta ${o} è stata ricevuta.`,
			subtitle: "Ti avviseremo non appena sarà pronto un preventivo.",
			button: "Visualizza Richiesta",
		},
		requestDetails: {
			subject: (o: string, name: string) => `${o} - AZIONE RICHIESTA | ${name}`,
			preview: "Completa i dettagli del viaggio",
			title: (firstName: string) =>
				`Gentile ${firstName}, completa i dettagli di partenza.`,
			subtitle:
				"Il tuo preventivo è stato accettato. Per finalizzare la prenotazione, inserisci la data e l'ora di partenza.",
			button: "Completa i Dettagli",
		},
		quotationReady: {
			subject: (o: string, name: string) =>
				`${o} - PREVENTIVO PRONTO | ${name}`,
			preview: "Visualizza preventivo",
			title: (firstName: string, o: string) =>
				`Gentile ${firstName}, il tuo preventivo per la richiesta ${o} è pronto.`,
			subtitle: "Rivedi il tuo preventivo e accettalo quando sei pronto.",
			button: "Visualizza Preventivo",
		},
		tripConfirmed: {
			subject: (o: string, name: string) =>
				`${o} - VIAGGIO CONFERMATO | ${name}`,
			preview: "Il tuo viaggio è confermato",
			title: (firstName: string) =>
				`Gentile ${firstName}, il tuo viaggio è confermato!`,
			subtitle: "L'operatore ha confermato la tua prenotazione.",
			button: "Visualizza Dettagli",
		},
	},
} as const;

function tr(language: string | null | undefined) {
	const lang = (language ?? "en") as keyof typeof TRANSLATIONS;
	return TRANSLATIONS[lang] ?? TRANSLATIONS.en;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function notifyAdmins(
	companyId: string | null,
	subject: string,
	data: {
		preview: string;
		title: string;
		subtitle?: string;
		buttonLabel: string;
	},
	href: string,
) {
	const emails = await resolveAdminEmails(companyId);
	await Promise.all(
		emails.map((to) =>
			sendEmail({
				to,
				subject,
				react: createElement(GenericEmail, { data, href }),
			}),
		),
	);
}

// ─── Trip Request ─────────────────────────────────────────────────────────────

export async function sendNewTripRequestToAdmins(t: AdminTarget) {
	const o = order(t.orderNumber);
	const name = `${t.firstName} ${t.lastName}`;
	await notifyAdmins(
		t.companyId,
		`${o} - NEW TRIP REQUEST | ${name}`,
		{
			preview: "View request",
			title: `New trip request from ${name} — ${o}`,
			subtitle: "A new request has been submitted and is awaiting your review.",
			buttonLabel: "View Request",
		},
		`${APP_URL}/admin/requests/${t.id}`,
	);
}

export async function sendRequestReceivedToCustomer(t: CustomerTarget) {
	const o = order(t.orderNumber);
	const name = `${t.firstName} ${t.lastName}`;
	const c = tr(t.language).requestReceived;
	await sendEmail({
		to: t.customerEmail,
		subject: c.subject(o, name),
		react: createElement(GenericEmail, {
			data: {
				preview: c.preview,
				title: c.title(t.firstName, t.lastName, o),
				subtitle: c.subtitle,
				buttonLabel: c.button,
			},
			href: `${APP_URL}/request/${t.token}`,
		}),
	});
}

export async function sendTripConfirmedToAdmins(t: AdminTarget) {
	const o = order(t.orderNumber);
	const name = `${t.firstName} ${t.lastName}`;
	await notifyAdmins(
		t.companyId,
		`${o} - TRIP CONFIRMED | ${name}`,
		{
			preview: "View request",
			title: `${name} confirmed their trip — ${o}`,
			subtitle: "The trip is ready to be finalised.",
			buttonLabel: "View Request",
		},
		`${APP_URL}/admin/requests/${t.id}`,
	);
}

export async function sendTripConfirmedToCustomer(t: CustomerTarget) {
	const o = order(t.orderNumber);
	const name = `${t.firstName} ${t.lastName}`;
	const c = tr(t.language).tripConfirmed;
	await sendEmail({
		to: t.customerEmail,
		subject: c.subject(o, name),
		react: createElement(GenericEmail, {
			data: {
				preview: c.preview,
				title: c.title(t.firstName),
				subtitle: c.subtitle,
				buttonLabel: c.button,
			},
			href: `${APP_URL}/request/${t.token}`,
		}),
	});
}

export async function sendPickupDetailsToAdmins(t: AdminTarget) {
	const o = order(t.orderNumber);
	const name = `${t.firstName} ${t.lastName}`;
	await notifyAdmins(
		t.companyId,
		`${o} - PICKUP DETAILS READY | ${name}`,
		{
			preview: "View request",
			title: `${name} added pickup details`,
			subtitle: `Order ${o} — ready to confirm`,
			buttonLabel: "View Request",
		},
		`${APP_URL}/admin/requests/${t.id}`,
	);
}

export async function sendRequestDetailsToCustomer(t: CustomerTarget) {
	const o = order(t.orderNumber);
	const name = `${t.firstName} ${t.lastName}`;
	const c = tr(t.language).requestDetails;
	await sendEmail({
		to: t.customerEmail,
		subject: c.subject(o, name),
		react: createElement(GenericEmail, {
			data: {
				preview: c.preview,
				title: c.title(t.firstName),
				subtitle: c.subtitle,
				buttonLabel: c.button,
			},
			href: `${APP_URL}/request/${t.token}`,
		}),
	});
}

// ─── Quotation ────────────────────────────────────────────────────────────────

export async function sendQuotationToCustomer(t: CustomerTarget) {
	const o = order(t.orderNumber);
	const name = `${t.firstName} ${t.lastName}`;
	const c = tr(t.language).quotationReady;
	await sendEmail({
		to: t.customerEmail,
		subject: c.subject(o, name),
		react: createElement(GenericEmail, {
			data: {
				preview: c.preview,
				title: c.title(t.firstName, o),
				subtitle: c.subtitle,
				buttonLabel: c.button,
			},
			href: `${APP_URL}/request/${t.token}`,
		}),
	});
}

export async function sendQuotationAcceptedToAdmins(t: AdminTarget) {
	const o = order(t.orderNumber);
	const name = `${t.firstName} ${t.lastName}`;
	await notifyAdmins(
		t.companyId,
		`${o} - QUOTATION ACCEPTED | ${name}`,
		{
			preview: "View request",
			title: `${name} accepted the quotation for request ${o}.`,
			buttonLabel: "View Request",
		},
		`${APP_URL}/admin/requests/${t.id}`,
	);
}

export async function sendQuotationRejectedToAdmins(t: AdminTarget) {
	const o = order(t.orderNumber);
	const name = `${t.firstName} ${t.lastName}`;
	await notifyAdmins(
		t.companyId,
		`${o} - QUOTATION REJECTED | ${name}`,
		{
			preview: "View request",
			title: `${name} rejected the quotation for request ${o}.`,
			subtitle: "You can revise the quotation and resend it.",
			buttonLabel: "View Request",
		},
		`${APP_URL}/admin/requests/${t.id}`,
	);
}
