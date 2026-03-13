import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./email-layout";

interface QuotationSentEmailProps {
	firstName: string;
	orderNumber: number;
	dashboardUrl: string;
}

export function QuotationSentEmail({
	firstName,
	orderNumber,
	dashboardUrl,
}: QuotationSentEmailProps) {
	const order = `#${String(orderNumber).padStart(7, "0")}`;
	return (
		<EmailLayout preview={`QUOTATION READY ${order}`}>
			<Text style={emailStyles.title}>
				Dear {firstName}, your quotation for request {order} is ready.
			</Text>
			<Text style={emailStyles.subtitle}>
				Review your quotation and let us know if you'd like to accept or
				decline.
			</Text>
			<Section style={emailStyles.buttonSection}>
				<Button style={emailStyles.button} href={dashboardUrl}>
					View Quotation
				</Button>
			</Section>
		</EmailLayout>
	);
}

export default QuotationSentEmail;
