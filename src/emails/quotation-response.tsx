import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./email-layout";

interface QuotationResponseEmailProps {
	orderNumber: number;
	accepted: boolean;
	customerName: string;
	customerEmail: string;
	price: string;
	currency: string;
	adminUrl: string;
}

export function QuotationResponseEmail({
	orderNumber,
	accepted,
	customerName,
	price,
	currency,
	adminUrl,
}: QuotationResponseEmailProps) {
	const order = `#${String(orderNumber).padStart(7, "0")}`;
	const action = accepted ? "accepted" : "rejected";

	return (
		<EmailLayout
			preview={`QUOTATION ${action.toUpperCase()} ${order} | ${customerName}`}
		>
			<Text style={emailStyles.title}>
				{customerName} {action} quotation {order}
			</Text>
			<Text style={emailStyles.subtitle}>
				{currency} {price}
			</Text>
			<Section style={emailStyles.buttonSection}>
				<Button style={emailStyles.button} href={adminUrl}>
					View request
				</Button>
			</Section>
		</EmailLayout>
	);
}

export default QuotationResponseEmail;
