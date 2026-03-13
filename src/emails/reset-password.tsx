import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./email-layout";
import type { EmailData } from "./types";

interface ResetPasswordEmailProps {
	resetUrl: string;
}

export function ResetPasswordEmail({ resetUrl }: ResetPasswordEmailProps) {
	const emailData: EmailData = {
		subject: "RESET YOUR dantrip.com PASSWORD",
		title: "Reset your password",
		subtitle:
			"You requested a password reset. Click the button below to choose a new password. The link expires in 1 hour.",
		buttonLabel: "Reset Password",
		secondaryText:
			"If you didn't request this, you can safely ignore this email.",
	};

	return (
		<EmailLayout preview={emailData.subject}>
			<Text style={emailStyles.title}>{emailData.title}</Text>
			<Text style={emailStyles.subtitle}>{emailData.subtitle}</Text>
			<Section style={emailStyles.buttonSection}>
				<Button style={emailStyles.button} href={resetUrl}>
					{emailData.buttonLabel}
				</Button>
			</Section>
			{emailData.secondaryText && (
				<Text style={hint}>{emailData.secondaryText}</Text>
			)}
		</EmailLayout>
	);
}

const hint = { color: "#888888", fontSize: "13px", lineHeight: "20px" };

export default ResetPasswordEmail;
