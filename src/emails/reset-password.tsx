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

interface ResetPasswordEmailProps {
	resetUrl: string;
}

export function ResetPasswordEmail({ resetUrl }: ResetPasswordEmailProps) {
	return (
		<Html>
			<Head />
			<Preview>Reset your Trip Manager password</Preview>
			<Body style={body}>
				<Container style={container}>
					<Heading style={heading}>Trip Manager</Heading>
					<Hr style={hr} />
					<Heading as="h2" style={subheading}>
						Reset your password
					</Heading>
					<Text style={text}>
						You requested a password reset. Click the button below to choose a
						new password. The link expires in 1 hour.
					</Text>
					<Section style={buttonSection}>
						<Button style={button} href={resetUrl}>
							Reset Password
						</Button>
					</Section>
					<Text style={hint}>
						If you didn't request this, you can safely ignore this email.
					</Text>
					<Hr style={hr} />
					<Text style={footer}>
						Trip Manager · Secure travel transfer service
					</Text>
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
	maxWidth: "560px",
};
const heading = { color: "#1a1a1a", fontSize: "24px", margin: "0 0 8px" };
const subheading = { color: "#1a1a1a", fontSize: "20px", margin: "24px 0 8px" };
const text = {
	color: "#4a4a4a",
	fontSize: "15px",
	lineHeight: "24px",
	margin: "0 0 16px",
};
const hint = { color: "#888888", fontSize: "13px", lineHeight: "20px" };
const footer = {
	color: "#888888",
	fontSize: "12px",
	textAlign: "center" as const,
};
const hr = { borderColor: "#e6ebf1", margin: "24px 0" };
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
