import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./email-layout";
import type { EmailData } from "./types";

interface TripMessageEmailProps {
	senderName: string;
	requestUrl: string;
}

export function TripMessageEmail({
	senderName,
	requestUrl,
}: TripMessageEmailProps) {
	const emailData: EmailData = {
		subject: `NEW MESSAGE FROM ${senderName}`,
		title: `New message from ${senderName}`,
		subtitle: "You have a new message regarding your trip request.",
		buttonLabel: "View Conversation",
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

export default TripMessageEmail;
