import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./email-layout";
import type { EmailData } from "./types";

interface RequestConfirmationEmailProps {
	firstName: string;
	lastName: string;
	orderNumber: number;
	requestUrl: string;
}

export function RequestConfirmationEmail({
	firstName,
	lastName,
	orderNumber,
	requestUrl,
}: RequestConfirmationEmailProps) {
	const order = `#${String(orderNumber).padStart(7, "0")}`;
	const emailData: EmailData = {
		subject: `REQUEST RECEIVED ${order}`,
		title: `Dear ${firstName} ${lastName}, your request ${order} has been received.`,
		subtitle: "We'll notify you as soon as a quotation is ready.",
		buttonLabel: "View Request",
	};

	return (
		<EmailLayout preview={emailData.subject}>
			<Text style={emailStyles.title}>{emailData.title}</Text>
			<Text style={emailStyles.subtitle}>{emailData.subtitle}</Text>
			<Section style={emailStyles.buttonSection}>
				<Button style={emailStyles.button} href={requestUrl}>
					{emailData.buttonLabel}
				</Button>
			</Section>
		</EmailLayout>
	);
}

export default RequestConfirmationEmail;
