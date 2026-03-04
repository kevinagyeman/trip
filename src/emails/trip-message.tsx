import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Preview,
	Section,
	Text,
} from "@react-email/components";

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
		<Html>
			<Head />
			<Preview>New message from {senderName}</Preview>
			<Body style={bodyStyle}>
				<Container style={container}>
					<Heading style={heading}>Trip Manager</Heading>
					<Hr style={hr} />
					<Heading as="h2" style={subheading}>
						New message from {senderName}
					</Heading>
					<Section style={messageBox}>
						<Text style={messageText}>{body}</Text>
					</Section>
					<Section style={buttonSection}>
						<Button style={button} href={requestUrl}>
							View Conversation
						</Button>
					</Section>
					<Hr style={hr} />
					<Text style={footer}>
						Trip Manager · Secure travel transfer service
					</Text>
				</Container>
			</Body>
		</Html>
	);
}

const bodyStyle = { backgroundColor: "#f6f9fc", fontFamily: "sans-serif" };
const container = {
	backgroundColor: "#ffffff",
	margin: "40px auto",
	padding: "40px",
	borderRadius: "8px",
	maxWidth: "560px",
};
const heading = { color: "#1a1a1a", fontSize: "24px", margin: "0 0 8px" };
const subheading = { color: "#1a1a1a", fontSize: "20px", margin: "24px 0 8px" };
const hr = { borderColor: "#e6ebf1", margin: "24px 0" };
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
const buttonSection = { textAlign: "center" as const, margin: "32px 0" };
const button = {
	backgroundColor: "#000000",
	borderRadius: "6px",
	color: "#ffffff",
	fontSize: "15px",
	fontWeight: "600",
	padding: "12px 24px",
	textDecoration: "none",
	display: "inline-block",
};
const footer = {
	color: "#888888",
	fontSize: "12px",
	textAlign: "center" as const,
};
