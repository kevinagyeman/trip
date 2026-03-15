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
};

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
	await sendEmail({
		to: t.customerEmail,
		subject: `${o} - REQUEST RECEIVED | ${name}`,
		react: createElement(GenericEmail, {
			data: {
				preview: "View your request",
				title: `Dear ${t.firstName} ${t.lastName}, your request ${o} has been received.`,
				subtitle: "We'll notify you as soon as a quotation is ready.",
				buttonLabel: "View Request",
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
	await sendEmail({
		to: t.customerEmail,
		subject: `${o} - TRIP CONFIRMED | ${name}`,
		react: createElement(GenericEmail, {
			data: {
				preview: "Your trip is confirmed",
				title: `Dear ${t.firstName}, your trip is confirmed!`,
				subtitle: "The operator has confirmed your booking.",
				buttonLabel: "View Details",
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
	await sendEmail({
		to: t.customerEmail,
		subject: `${o} - ACTION REQUIRED | ${name}`,
		react: createElement(GenericEmail, {
			data: {
				preview: "Complete your trip details",
				title: `Dear ${t.firstName}, please complete your departure details.`,
				subtitle:
					"Your quotation has been accepted. To finalise your booking, please fill in the departure date, time.",
				buttonLabel: "Complete Details",
			},
			href: `${APP_URL}/request/${t.token}`,
		}),
	});
}

// ─── Quotation ────────────────────────────────────────────────────────────────

export async function sendQuotationToCustomer(t: CustomerTarget) {
	const o = order(t.orderNumber);
	const name = `${t.firstName} ${t.lastName}`;
	await sendEmail({
		to: t.customerEmail,
		subject: `${o} - QUOTATION READY | ${name}`,
		react: createElement(GenericEmail, {
			data: {
				preview: "View quotation",
				title: `Dear ${t.firstName}, your quotation for request ${o} is ready.`,
				subtitle: "Review your quotation and accept it when you're ready.",
				buttonLabel: "View Quotation",
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
