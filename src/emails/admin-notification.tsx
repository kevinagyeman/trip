import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./email-layout";
import type { EmailData } from "./types";

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
	const emailData: EmailData = {
		subject: preview,
		title,
		subtitle,
		buttonLabel: "View Request",
	};

	return (
		<EmailLayout preview={emailData.subject}>
			<Text style={emailStyles.title}>{emailData.title}</Text>
			{emailData.subtitle && (
				<Text style={emailStyles.subtitle}>{emailData.subtitle}</Text>
			)}
			<Section style={emailStyles.buttonSection}>
				<Button style={emailStyles.button} href={adminUrl}>
					{emailData.buttonLabel}
				</Button>
			</Section>
		</EmailLayout>
	);
}

export default AdminNotificationEmail;
