import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./email-layout";

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
	return (
		<EmailLayout
			preview={`NEW TRIP REQUEST ${order} | ${firstName} ${lastName}`}
		>
			<Text style={emailStyles.title}>
				New trip request from {firstName} {lastName} — {order}
			</Text>
			<Text style={emailStyles.subtitle}>
				A new request has been submitted and is awaiting your review.
			</Text>
			<Section style={emailStyles.buttonSection}>
				<Button style={emailStyles.button} href={adminUrl}>
					View Request
				</Button>
			</Section>
		</EmailLayout>
	);
}

export default NewRequestEmail;
