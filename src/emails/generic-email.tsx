import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./email-layout";
import type { EmailData } from "./types";

interface GenericEmailProps {
	data: EmailData;
	href: string;
}

export function GenericEmail({ data, href }: GenericEmailProps) {
	return (
		<EmailLayout preview={data.preview}>
			<Text style={emailStyles.title}>{data.title}</Text>
			{data.subtitle && (
				<Text style={emailStyles.subtitle}>{data.subtitle}</Text>
			)}
			<Section style={emailStyles.buttonSection}>
				<Button style={emailStyles.button} href={href}>
					{data.buttonLabel}
				</Button>
			</Section>
			{data.secondaryText && <Text style={hint}>{data.secondaryText}</Text>}
		</EmailLayout>
	);
}

const hint = { color: "#888888", fontSize: "13px", lineHeight: "20px" };

export default GenericEmail;
