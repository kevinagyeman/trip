import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./email-layout";
import type { EmailData } from "./types";

interface NewRequestEmailProps {
	firstName: string;
	lastName: string;
	orderNumber: number;
	adminUrl: string;
}

export function NewRequestEmail({
	firstName,
	lastName,
	orderNumber,
	adminUrl,
}: NewRequestEmailProps) {
	const order = `#${String(orderNumber).padStart(7, "0")}`;
	const emailData: EmailData = {
		subject: `NEW TRIP REQUEST ${order} | ${firstName} ${lastName}`,
		title: `New trip request from ${firstName} ${lastName} — ${order}`,
		subtitle: "A new request has been submitted and is awaiting your review.",
		buttonLabel: "View Request",
	};

	return (
		<EmailLayout preview={emailData.subject}>
			<Text style={emailStyles.title}>{emailData.title}</Text>
			<Text style={emailStyles.subtitle}>{emailData.subtitle}</Text>
			<Section style={emailStyles.buttonSection}>
				<Button style={emailStyles.button} href={adminUrl}>
					{emailData.buttonLabel}
				</Button>
			</Section>
		</EmailLayout>
	);
}

export default NewRequestEmail;
