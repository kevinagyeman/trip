import {
	Body,
	Button,
	Container,
	Head,
	Html,
	Preview,
	Section,
	Text,
} from "@react-email/components";

interface AdminNotificationEmailProps {
	preview: string;
	title: string;
	subtitle?: string;
	adminUrl: string;
}

export function AdminNotificationEmail({
	preview,
	title,
	subtitle,
	adminUrl,
}: AdminNotificationEmailProps) {
	return (
		<Html>
			<Head />
			<Preview>{preview}</Preview>
			<Body style={body}>
				<Container style={container}>
					<Text style={label}>dantrip.com</Text>
					<Text style={titleStyle}>{title}</Text>
					{subtitle && <Text style={subtitleStyle}>{subtitle}</Text>}
					<Section style={buttonSection}>
						<Button style={button} href={adminUrl}>
							More details
						</Button>
					</Section>
				</Container>
			</Body>
		</Html>
	);
}

const body = { backgroundColor: "#f6f9fc", fontFamily: "sans-serif" };
const container = {
	backgroundColor: "#ffffff",
	margin: "40px auto",
	padding: "40px",
	borderRadius: "8px",
	maxWidth: "480px",
};
const label = { color: "#888888", fontSize: "12px", margin: "0 0 16px" };
const titleStyle = {
	color: "#1a1a1a",
	fontSize: "18px",
	fontWeight: "600",
	margin: "0 0 4px",
	lineHeight: "1.4",
};
const subtitleStyle = {
	color: "#555555",
	fontSize: "14px",
	margin: "0 0 24px",
};
const buttonSection = { margin: "0" };
const button = {
	backgroundColor: "#000000",
	borderRadius: "6px",
	color: "#ffffff",
	fontSize: "14px",
	fontWeight: "600",
	padding: "10px 20px",
	textDecoration: "none",
	display: "inline-block",
};
