import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./email-layout";

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
		<EmailLayout preview={preview}>
			<Text style={emailStyles.title}>{title}</Text>
			{subtitle && <Text style={emailStyles.subtitle}>{subtitle}</Text>}
			<Section style={emailStyles.buttonSection}>
				<Button style={emailStyles.button} href={adminUrl}>
					More details
				</Button>
			</Section>
		</EmailLayout>
	);
}

export default AdminNotificationEmail;
