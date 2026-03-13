import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./email-layout";
import type { EmailData } from "./types";

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
	const emailData: EmailData = {
		subject: `YOUR TRIP IS CONFIRMED — ${pickupDate} at ${pickupTime}`,
		title: `Dear ${firstName}, your trip is confirmed!`,
		subtitle: `Your pickup is scheduled for ${pickupDate} at ${pickupTime}.`,
		buttonLabel: "View Details",
	};

	return (
		<EmailLayout preview={emailData.subject}>
			<Text style={emailStyles.title}>{emailData.title}</Text>
			<Text style={emailStyles.subtitle}>{emailData.subtitle}</Text>
			<Section style={emailStyles.buttonSection}>
				<Button style={emailStyles.button} href={requestUrl}>
					{emailData.buttonLabel}
				</Button>
			</Section>
		</EmailLayout>
	);
}

export default BookingConfirmedEmail;
