import { Button, Heading, Section, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./email-layout";

interface TripMessageEmailProps {
	senderName: string;
	body: string;
	requestUrl: string;
}

export function TripMessageEmail({
	senderName,
	body,
	requestUrl,
}: TripMessageEmailProps) {
	return (
		<EmailLayout preview={`NEW MESSAGE FROM ${senderName}`}>
			<Heading as="h2" style={emailStyles.subheading}>
				New message from {senderName}
			</Heading>
			<Section style={messageBox}>
				<Text style={messageText}>{body}</Text>
			</Section>
			<Section style={emailStyles.buttonSection}>
				<Button style={emailStyles.button} href={requestUrl}>
					View Conversation
				</Button>
			</Section>
		</EmailLayout>
	);
}

const messageBox = {
	backgroundColor: "#f6f9fc",
	borderRadius: "8px",
	padding: "16px",
	margin: "0 0 24px",
};
const messageText = {
	color: "#4a4a4a",
	fontSize: "15px",
	lineHeight: "24px",
	margin: 0,
	whiteSpace: "pre-wrap" as const,
};

export default TripMessageEmail;
