import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./email-layout";
import type { EmailData } from "./types";

interface QuotationResponseEmailProps {
	orderNumber: number;
	accepted: boolean;
	customerName: string;
	adminUrl: string;
}

export function QuotationResponseEmail({
	orderNumber,
	accepted,
	customerName,
	adminUrl,
}: QuotationResponseEmailProps) {
	const order = `#${String(orderNumber).padStart(7, "0")}`;
	const action = accepted ? "accepted" : "rejected";
	const emailData: EmailData = {
		subject: `QUOTATION ${action.toUpperCase()} ${order} | ${customerName}`,
		title: `${customerName} ${action} the quotation for request ${order}.`,
		buttonLabel: "View Request",
	};

	return (
		<EmailLayout preview={emailData.subject}>
			<Text style={emailStyles.title}>{emailData.title}</Text>
			<Section style={emailStyles.buttonSection}>
				<Button style={emailStyles.button} href={adminUrl}>
					{emailData.buttonLabel}
				</Button>
			</Section>
		</EmailLayout>
	);
}

export default QuotationResponseEmail;
