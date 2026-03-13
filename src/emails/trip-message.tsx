import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./email-layout";

interface TripMessageEmailProps {
	senderName: string;
	requestUrl: string;
}

export function TripMessageEmail({
	senderName,
	requestUrl,
}: TripMessageEmailProps) {
	return (
		<EmailLayout preview={`NEW MESSAGE FROM ${senderName}`}>
			<Text style={emailStyles.title}>New message from {senderName}</Text>
			<Text style={emailStyles.subtitle}>
				You have a new message regarding your trip request.
			</Text>
			<Section style={emailStyles.buttonSection}>
				<Button style={emailStyles.button} href={requestUrl}>
					View Conversation
				</Button>
			</Section>
		</EmailLayout>
	);
}

export default TripMessageEmail;
