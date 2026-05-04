import { GenericEmail } from "@/emails/generic-email";
import {
	APP_URL,
	resolveAdminUsers,
	resolveCompanyName,
	sendEmail,
} from "@/server/email";
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
	companyId?: string | null;
};

// ─── Translations ──────────────────────────────────────────────────────────────

const ADMIN_TRANSLATIONS = {
	en: {
		newRequest: (o: string, name: string) =>
			`New transfer request ${o} | ${name}`,
		newMessage: (o: string, name: string) => `New message on ${o} | ${name}`,
		departureUpdated: (o: string, name: string) =>
			`Customer updated departure details — ${o} | ${name}`,
		quotationAccepted: (o: string, name: string) =>
			`Quotation accepted — ${o} | ${name}`,
		quotationRejected: (o: string, name: string) =>
			`Quotation rejected — ${o} | ${name}`,
		button: "View Request",
	},
	it: {
		newRequest: (o: string, name: string) =>
			`Nuova richiesta di trasferimento ${o} | ${name}`,
		newMessage: (o: string, name: string) =>
			`Nuovo messaggio su ${o} | ${name}`,
		departureUpdated: (o: string, name: string) =>
			`Il cliente ha aggiornato i dati di partenza — ${o} | ${name}`,
		quotationAccepted: (o: string, name: string) =>
			`Preventivo accettato — ${o} | ${name}`,
		quotationRejected: (o: string, name: string) =>
			`Preventivo rifiutato — ${o} | ${name}`,
		button: "Visualizza",
	},
} as const;

function adminTr(language: string | null | undefined) {
	const lang = (language ?? "en") as keyof typeof ADMIN_TRANSLATIONS;
	return ADMIN_TRANSLATIONS[lang] ?? ADMIN_TRANSLATIONS.en;
}

function makeAdminNotifier(
	subjectFn: (
		tr: (typeof ADMIN_TRANSLATIONS)[keyof typeof ADMIN_TRANSLATIONS],
		o: string,
		name: string,
	) => string,
) {
	return async (t: AdminTarget) => {
		const o = order(t.orderNumber);
		const name = `${t.firstName} ${t.lastName}`;
		await notifyAdmins(
			t.companyId,
			(lang) => {
				const c = adminTr(lang);
				const subject = subjectFn(c, o, name);
				return {
					subject,
					data: { preview: subject, title: subject, buttonLabel: c.button },
				};
			},
			`${APP_URL}/admin/requests/${t.id}`,
		);
	};
}

const TRANSLATIONS = {
	en: {
		departureDetailsRequest: {
			subject: (o: string, name: string) =>
				`${o} - Please provide your departure details | ${name}`,
			preview: "We need your departure details",
			title: (firstName: string) =>
				`Dear ${firstName}, please provide your departure details.`,
			subtitle:
				"To prepare your transfer, we need your departure date, time, and flight number (if applicable). Open your request to fill in the details.",
			button: "Add Departure Details",
		},
		requestReceived: {
			subject: (o: string, name: string) => `${o} - Request received | ${name}`,
			preview: "View your request",
			title: (firstName: string, lastName: string, o: string) =>
				`Dear ${firstName} ${lastName}, your request ${o} has been received.`,
			subtitle: "We'll notify you as soon as a quotation is ready.",
			button: "View Request",
		},

		quotationReady: {
			subject: (o: string, name: string) => `${o} - Quotation ready | ${name}`,
			preview: "View quotation",
			title: (firstName: string, o: string) =>
				`Dear ${firstName}, your quotation for request ${o} is ready.`,
			subtitle: "Review your quotation and accept it when you're ready.",
			button: "View Quotation",
		},
		tripConfirmed: {
			subject: (o: string, name: string) => `${o} - Trip confirmed | ${name}`,
			preview: "Your trip is confirmed",
			title: (firstName: string) =>
				`Dear ${firstName}, your trip is confirmed!`,
			subtitle: "The operator has confirmed your booking.",
			button: "View Details",
		},
		newMessage: {
			subject: (o: string) => `New message on your request ${o}`,
			preview: "You have a new message",
			title: (firstName: string) =>
				`Dear ${firstName}, the operator sent you a new message.`,
			subtitle: "Log in to your request to read it and reply.",
			button: "View Request",
		},
		pickupInfoReady: {
			subject: (o: string, name: string) =>
				`${o} - Pickup details ready | ${name}`,
			preview: "Your pickup details are ready",
			title: (firstName: string) =>
				`Dear ${firstName}, your pickup details are ready!`,
			subtitle:
				"The operator has provided the pickup information for your transfer. Open your request to see the full details.",
			button: "View Details",
		},
	},
	it: {
		departureDetailsRequest: {
			subject: (o: string, name: string) =>
				`${o} - Inserisci i dettagli di partenza | ${name}`,
			preview: "Abbiamo bisogno dei tuoi dettagli di partenza",
			title: (firstName: string) =>
				`Gentile ${firstName}, inserisci i dettagli di partenza.`,
			subtitle:
				"Per preparare il tuo trasferimento, abbiamo bisogno della data, dell'orario di partenza e del numero di volo (se applicabile). Apri la tua richiesta per inserire i dettagli.",
			button: "Inserisci Dettagli",
		},
		requestReceived: {
			subject: (o: string, name: string) =>
				`${o} - Richiesta ricevuta | ${name}`,
			preview: "Visualizza la tua richiesta",
			title: (firstName: string, lastName: string, o: string) =>
				`Gentile ${firstName} ${lastName}, la tua richiesta ${o} è stata ricevuta.`,
			subtitle: "Ti avviseremo non appena sarà pronto un preventivo.",
			button: "Visualizza Richiesta",
		},

		quotationReady: {
			subject: (o: string, name: string) =>
				`${o} - Preventivo pronto | ${name}`,
			preview: "Visualizza preventivo",
			title: (firstName: string, o: string) =>
				`Gentile ${firstName}, il tuo preventivo per la richiesta ${o} è pronto.`,
			subtitle: "Rivedi il tuo preventivo e accettalo quando sei pronto.",
			button: "Visualizza Preventivo",
		},
		tripConfirmed: {
			subject: (o: string, name: string) =>
				`${o} - Viaggio confermato | ${name}`,
			preview: "Il tuo viaggio è confermato",
			title: (firstName: string) =>
				`Gentile ${firstName}, il tuo viaggio è confermato!`,
			subtitle: "L'operatore ha confermato la tua prenotazione.",
			button: "Visualizza Dettagli",
		},
		newMessage: {
			subject: (o: string) => `Nuovo messaggio sulla tua richiesta ${o}`,
			preview: "Hai un nuovo messaggio",
			title: (firstName: string) =>
				`Gentile ${firstName}, l'operatore ti ha inviato un nuovo messaggio.`,
			subtitle: "Accedi alla tua richiesta per leggerlo e rispondere.",
			button: "Visualizza Richiesta",
		},
		pickupInfoReady: {
			subject: (o: string, name: string) =>
				`${o} - Dettagli ritiro pronti | ${name}`,
			preview: "I dettagli del ritiro sono pronti",
			title: (firstName: string) =>
				`Gentile ${firstName}, i dettagli del ritiro sono pronti!`,
			subtitle:
				"L'operatore ha fornito le informazioni di ritiro per il tuo trasferimento. Apri la tua richiesta per vedere tutti i dettagli.",
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
	buildEmail: (lang: string) => {
		subject: string;
		data: {
			preview: string;
			title: string;
			subtitle?: string;
			buttonLabel: string;
		};
	},
	href: string,
) {
	const users = await resolveAdminUsers(companyId);
	await Promise.all(
		users.map(({ email: to, preferredLanguage }) => {
			const { subject, data } = buildEmail(preferredLanguage);
			return sendEmail({
				to,
				subject,
				react: createElement(GenericEmail, { data, href }),
			});
		}),
	);
}

// ─── Admin notifications ───────────────────────────────────────────────────────

export const sendNewTripRequestToAdmins = makeAdminNotifier((c, o, name) =>
	c.newRequest(o, name),
);
export const sendDepartureDetailsUpdatedToAdmins = makeAdminNotifier(
	(c, o, name) => c.departureUpdated(o, name),
);
export const sendQuotationAcceptedToAdmins = makeAdminNotifier((c, o, name) =>
	c.quotationAccepted(o, name),
);
export const sendQuotationRejectedToAdmins = makeAdminNotifier((c, o, name) =>
	c.quotationRejected(o, name),
);

export async function sendRequestReceivedToCustomer(t: CustomerTarget) {
	const o = order(t.orderNumber);
	const companyName =
		(await resolveCompanyName(t.companyId)) ?? `${t.firstName} ${t.lastName}`;
	const c = tr(t.language).requestReceived;
	await sendEmail({
		to: t.customerEmail,
		subject: c.subject(o, companyName),
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

export async function sendTripConfirmedToCustomer(t: CustomerTarget) {
	const o = order(t.orderNumber);
	const companyName =
		(await resolveCompanyName(t.companyId)) ?? `${t.firstName} ${t.lastName}`;
	const c = tr(t.language).tripConfirmed;
	await sendEmail({
		to: t.customerEmail,
		subject: c.subject(o, companyName),
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

export async function sendPickupInfoToCustomer(t: CustomerTarget) {
	const o = order(t.orderNumber);
	const companyName =
		(await resolveCompanyName(t.companyId)) ?? `${t.firstName} ${t.lastName}`;
	const c = tr(t.language).pickupInfoReady;
	await sendEmail({
		to: t.customerEmail,
		subject: c.subject(o, companyName),
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

// ─── Messages ─────────────────────────────────────────────────────────────────

export async function sendAdminMessageToCustomer(t: CustomerTarget) {
	const o = order(t.orderNumber);
	const c = tr(t.language).newMessage;
	await sendEmail({
		to: t.customerEmail,
		subject: c.subject(o),
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

export const sendCustomerMessageToAdmins = makeAdminNotifier((c, o, name) =>
	c.newMessage(o, name),
);

// ─── Quotation ────────────────────────────────────────────────────────────────

export async function sendQuotationToCustomer(t: CustomerTarget) {
	const o = order(t.orderNumber);
	const companyName =
		(await resolveCompanyName(t.companyId)) ?? `${t.firstName} ${t.lastName}`;
	const c = tr(t.language).quotationReady;
	await sendEmail({
		to: t.customerEmail,
		subject: c.subject(o, companyName),
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

export async function sendDepartureDetailsRequestToCustomer(t: CustomerTarget) {
	const o = order(t.orderNumber);
	const companyName =
		(await resolveCompanyName(t.companyId)) ?? `${t.firstName} ${t.lastName}`;
	const c = tr(t.language).departureDetailsRequest;
	await sendEmail({
		to: t.customerEmail,
		subject: c.subject(o, companyName),
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
