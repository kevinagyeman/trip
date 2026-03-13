import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./email-layout";

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
	return (
		<EmailLayout preview={`TRIP CONFIRMED ${order} | ${customerName}`}>
			<Text style={emailStyles.title}>
				{customerName} confirmed their trip — {order}
			</Text>
			<Text style={emailStyles.subtitle}>
				The trip is ready to be finalised.
			</Text>
			<Section style={emailStyles.buttonSection}>
				<Button style={emailStyles.button} href={adminUrl}>
					View Request
				</Button>
			</Section>
		</EmailLayout>
	);
}

export default TripConfirmedEmail;
