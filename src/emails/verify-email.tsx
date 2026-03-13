import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./email-layout";
import type { EmailData } from "./types";

interface VerifyEmailProps {
	verificationUrl: string;
	userName?: string;
}

export function VerifyEmailTemplate({
	verificationUrl,
	userName,
}: VerifyEmailProps) {
	const emailData: EmailData = {
		subject: "VERIFY YOUR dantrip.com ACCOUNT",
		title: `Hi${userName ? ` ${userName}` : ""}, verify your email address`,
		subtitle:
			"Thanks for signing up! Please verify your email address by clicking the button below. The link is valid for 24 hours.",
		buttonLabel: "Verify Email Address",
		secondaryText:
			"If you didn't create an account, you can safely ignore this email.",
	};

	return (
		<EmailLayout preview={emailData.subject}>
			<Text style={emailStyles.title}>{emailData.title}</Text>
			<Text style={emailStyles.subtitle}>{emailData.subtitle}</Text>
			<Section style={emailStyles.buttonSection}>
				<Button style={emailStyles.button} href={verificationUrl}>
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

export default VerifyEmailTemplate;
