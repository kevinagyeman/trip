import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./email-layout";

interface RequestConfirmationEmailProps {
	orderNumber: number;
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	routes: unknown;
	numberOfAdults: number;
	areThereChildren: boolean;
	numberOfChildren?: number | null;
	ageOfChildren?: string | null;
	numberOfChildSeats?: number | null;
	language: string;
	additionalInfo?: string | null;
	requestUrl: string;
}

export function RequestConfirmationEmail({
	orderNumber,
	firstName,
	lastName,
	requestUrl,
}: RequestConfirmationEmailProps) {
	const order = `#${String(orderNumber).padStart(7, "0")}`;

	return (
		<EmailLayout preview={`REQUEST RECEIVED ${order}`}>
			<Text style={emailStyles.title}>
				Dear {firstName} {lastName}, your request {order} has been received
			</Text>
			<Text style={emailStyles.subtitle}>
				We'll notify you as soon as a quotation is ready.
			</Text>
			<Section style={emailStyles.buttonSection}>
				<Button style={emailStyles.button} href={requestUrl}>
					More details
				</Button>
			</Section>
		</EmailLayout>
	);
}

export default RequestConfirmationEmail;
