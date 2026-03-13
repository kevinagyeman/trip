import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./email-layout";

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
	return (
		<EmailLayout
			preview={`QUOTATION ${action.toUpperCase()} ${order} | ${customerName}`}
		>
			<Text style={emailStyles.title}>
				{customerName} {action} the quotation for request {order}.
			</Text>
			<Section style={emailStyles.buttonSection}>
				<Button style={emailStyles.button} href={adminUrl}>
					View Request
				</Button>
			</Section>
		</EmailLayout>
	);
}

export default QuotationResponseEmail;
