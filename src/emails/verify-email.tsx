import { Button, Heading, Section, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./email-layout";

interface VerifyEmailProps {
	verificationUrl: string;
	userName?: string;
}

export function VerifyEmailTemplate({
	verificationUrl,
	userName,
}: VerifyEmailProps) {
	return (
		<EmailLayout preview="Verify your dantrip.com account">
			<Heading as="h2" style={emailStyles.subheading}>
				Verify your email address
			</Heading>
			<Text style={emailStyles.text}>Hi{userName ? ` ${userName}` : ""},</Text>
			<Text style={emailStyles.text}>
				Thanks for signing up! Please verify your email address by clicking the
				button below. The link is valid for 24 hours.
			</Text>
			<Section style={emailStyles.buttonSection}>
				<Button style={emailStyles.button} href={verificationUrl}>
					Verify Email Address
				</Button>
			</Section>
			<Text style={hint}>
				If you didn't create an account, you can safely ignore this email.
			</Text>
		</EmailLayout>
	);
}

const hint = { color: "#888888", fontSize: "13px", lineHeight: "20px" };

export default VerifyEmailTemplate;
