import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./email-layout";

interface BookingConfirmedEmailProps {
	firstName: string;
	pickupDate: string;
	pickupTime: string;
	requestUrl: string;
}

export function BookingConfirmedEmail({
	firstName,
	pickupDate,
	pickupTime,
	requestUrl,
}: BookingConfirmedEmailProps) {
	return (
		<EmailLayout
			preview={`YOUR TRIP IS CONFIRMED — ${pickupDate} at ${pickupTime}`}
		>
			<Text style={emailStyles.title}>
				Dear {firstName}, your trip is confirmed!
			</Text>
			<Text style={emailStyles.subtitle}>
				Your pickup is scheduled for {pickupDate} at {pickupTime}.
			</Text>
			<Section style={emailStyles.buttonSection}>
				<Button style={emailStyles.button} href={requestUrl}>
					View Details
				</Button>
			</Section>
		</EmailLayout>
	);
}

export default BookingConfirmedEmail;
