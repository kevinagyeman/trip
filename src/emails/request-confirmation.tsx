import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./email-layout";

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
	return (
		<EmailLayout preview={`REQUEST RECEIVED ${order}`}>
			<Text style={emailStyles.title}>
				Dear {firstName} {lastName}, your request {order} has been received.
			</Text>
			<Text style={emailStyles.subtitle}>
				We'll notify you as soon as a quotation is ready.
			</Text>
			<Section style={emailStyles.buttonSection}>
				<Button style={emailStyles.button} href={requestUrl}>
					View Request
				</Button>
			</Section>
		</EmailLayout>
	);
}

export default RequestConfirmationEmail;
