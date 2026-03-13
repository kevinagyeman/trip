import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./email-layout";
import type { EmailData } from "./types";

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
	const emailData: EmailData = {
		subject: `QUOTATION READY ${order}`,
		title: `Dear ${firstName}, your quotation for request ${order} is ready.`,
		subtitle:
			"Review your quotation and let us know if you'd like to accept or decline.",
		buttonLabel: "View Quotation",
	};

	return (
		<EmailLayout preview={emailData.subject}>
			<Text style={emailStyles.title}>{emailData.title}</Text>
			<Text style={emailStyles.subtitle}>{emailData.subtitle}</Text>
			<Section style={emailStyles.buttonSection}>
				<Button style={emailStyles.button} href={dashboardUrl}>
					{emailData.buttonLabel}
				</Button>
			</Section>
		</EmailLayout>
	);
}

export default QuotationSentEmail;
