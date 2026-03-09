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

interface InviteAdminEmailProps {
	companyName: string;
	setPasswordUrl: string;
}

export function InviteAdminEmail({
	companyName,
	setPasswordUrl,
}: InviteAdminEmailProps) {
	return (
		<Html>
			<Head />
			<Preview>You've been invited to manage {companyName}</Preview>
			<Body style={body}>
				<Container style={container}>
					<Heading style={heading}>Trip Manager</Heading>
					<Hr style={hr} />
					<Heading as="h2" style={subheading}>
						You've been invited
					</Heading>
					<Text style={text}>
						You've been added as an admin for <strong>{companyName}</strong> on
						Trip Manager. Click the button below to set your password and get
						started.
					</Text>
					<Section style={buttonSection}>
						<Button style={button} href={setPasswordUrl}>
							Set Password
						</Button>
					</Section>
					<Text style={hint}>
						This link expires in 24 hours. If you weren't expecting this
						invitation, you can safely ignore this email.
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
