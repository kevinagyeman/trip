import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./email-layout";
import type { EmailData } from "./types";

interface TripConfirmedEmailProps {
	orderNumber: number;
	customerName: string;
	adminUrl: string;
}

export function TripConfirmedEmail({
	orderNumber,
	customerName,
	adminUrl,
}: TripConfirmedEmailProps) {
	const order = `#${String(orderNumber).padStart(7, "0")}`;
	const emailData: EmailData = {
		subject: `TRIP CONFIRMED ${order} | ${customerName}`,
		title: `${customerName} confirmed their trip — ${order}`,
		subtitle: "The trip is ready to be finalised.",
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

export default TripConfirmedEmail;
