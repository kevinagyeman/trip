import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./email-layout";

interface NewRequestEmailProps {
	requestId: string;
	orderNumber: number;
	userName: string;
	userEmail: string;
	serviceType: string;
	firstName: string;
	lastName: string;
	phone: string;
	numberOfAdults: number;
	adminUrl: string;
}

export function NewRequestEmail({
	orderNumber,
	userName,
	serviceType,
	adminUrl,
}: NewRequestEmailProps) {
	const order = `#${String(orderNumber).padStart(7, "0")}`;

	return (
		<EmailLayout preview={`NEW TRIP REQUEST ${order} | ${userName}`}>
			<Text style={emailStyles.title}>
				NEW TRIP REQUEST {order} | {userName}
			</Text>
			<Text style={emailStyles.subtitle}>{serviceType}</Text>
			<Section style={emailStyles.buttonSection}>
				<Button style={emailStyles.button} href={adminUrl}>
					More details
				</Button>
			</Section>
		</EmailLayout>
	);
}

export default NewRequestEmail;
