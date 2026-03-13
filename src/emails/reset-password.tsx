import { Button, Heading, Section, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./email-layout";

interface ResetPasswordEmailProps {
	resetUrl: string;
}

export function ResetPasswordEmail({ resetUrl }: ResetPasswordEmailProps) {
	return (
		<EmailLayout preview="Reset your dantrip.com password">
			<Heading as="h2" style={emailStyles.subheading}>
				Reset your password
			</Heading>
			<Text style={emailStyles.text}>
				You requested a password reset. Click the button below to choose a new
				password. The link expires in 1 hour.
			</Text>
			<Section style={emailStyles.buttonSection}>
				<Button style={emailStyles.button} href={resetUrl}>
					Reset Password
				</Button>
			</Section>
			<Text style={hint}>
				If you didn't request this, you can safely ignore this email.
			</Text>
		</EmailLayout>
	);
}

const hint = { color: "#888888", fontSize: "13px", lineHeight: "20px" };

export default ResetPasswordEmail;
