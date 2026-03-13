import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./email-layout";
import type { EmailData } from "./types";

interface InviteAdminEmailProps {
	companyName: string;
	setPasswordUrl: string;
}

export function InviteAdminEmail({
	companyName,
	setPasswordUrl,
}: InviteAdminEmailProps) {
	const emailData: EmailData = {
		subject: `YOU'VE BEEN INVITED TO MANAGE ${companyName}`,
		title: `You've been invited`,
		subtitle: `You've been added as an admin for ${companyName} on dantrip.com. Click the button below to set your password and get started.`,
		buttonLabel: "Set Password",
		secondaryText:
			"This link expires in 24 hours. If you weren't expecting this invitation, you can safely ignore this email.",
	};

	return (
		<EmailLayout preview={emailData.subject}>
			<Text style={emailStyles.title}>{emailData.title}</Text>
			<Text style={emailStyles.subtitle}>{emailData.subtitle}</Text>
			<Section style={emailStyles.buttonSection}>
				<Button style={emailStyles.button} href={setPasswordUrl}>
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

export default InviteAdminEmail;
