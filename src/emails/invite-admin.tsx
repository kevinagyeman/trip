import { Button, Heading, Section, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./email-layout";

interface InviteAdminEmailProps {
	companyName: string;
	setPasswordUrl: string;
}

export function InviteAdminEmail({
	companyName,
	setPasswordUrl,
}: InviteAdminEmailProps) {
	return (
		<EmailLayout preview={`You've been invited to manage ${companyName}`}>
			<Heading as="h2" style={emailStyles.subheading}>
				You've been invited
			</Heading>
			<Text style={emailStyles.text}>
				You've been added as an admin for <strong>{companyName}</strong> on
				dantrip.com. Click the button below to set your password and get
				started.
			</Text>
			<Section style={emailStyles.buttonSection}>
				<Button style={emailStyles.button} href={setPasswordUrl}>
					Set Password
				</Button>
			</Section>
			<Text style={hint}>
				This link expires in 24 hours. If you weren't expecting this invitation,
				you can safely ignore this email.
			</Text>
		</EmailLayout>
	);
}

const hint = { color: "#888888", fontSize: "13px", lineHeight: "20px" };

export default InviteAdminEmail;
