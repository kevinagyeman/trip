import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./email-layout";

interface TripConfirmedEmailProps {
	orderNumber: number;
	customerName: string;
	customerEmail: string;
	serviceType: string;
	arrivalFlightDate?: string;
	arrivalFlightTime?: string;
	arrivalFlightNumber?: string;
	adminUrl: string;
}

export function TripConfirmedEmail({
	orderNumber,
	customerName,
	serviceType,
	arrivalFlightDate,
	arrivalFlightTime,
	adminUrl,
}: TripConfirmedEmailProps) {
	const order = `#${String(orderNumber).padStart(7, "0")}`;
	const detail = [arrivalFlightDate, arrivalFlightTime]
		.filter(Boolean)
		.join(" · ");

	return (
		<EmailLayout preview={`TRIP CONFIRMED ${order} | ${customerName}`}>
			<Text style={emailStyles.title}>
				{customerName} confirmed trip {order}
			</Text>
			<Text style={emailStyles.subtitle}>
				{serviceType}
				{detail ? ` · ${detail}` : ""}
			</Text>
			<Section style={emailStyles.buttonSection}>
				<Button style={emailStyles.button} href={adminUrl}>
					View request
				</Button>
			</Section>
		</EmailLayout>
	);
}

export default TripConfirmedEmail;
