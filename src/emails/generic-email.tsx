import { Button, Link, Section, Text } from "@react-email/components";
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
				{data.secondaryLinkLabel && data.secondaryLinkHref && (
					<Text style={secondaryLink}>
						<Link href={data.secondaryLinkHref} style={secondaryLinkAnchor}>
							{data.secondaryLinkLabel}
						</Link>
					</Text>
				)}
				<Text style={fallbackHint}>
					Button not working? Copy and paste this link into your browser:
					<br />
					<Link href={href} style={fallbackLinkAnchor}>
						{href}
					</Link>
				</Text>
			</Section>
			{data.secondaryText && <Text style={hint}>{data.secondaryText}</Text>}
		</EmailLayout>
	);
}

const hint = { color: "#888888", fontSize: "13px", lineHeight: "20px" };
const secondaryLink = { textAlign: "center" as const, margin: "12px 0 0" };
const secondaryLinkAnchor = { fontSize: "13px" };
const fallbackHint = {
	color: "#888888",
	fontSize: "14px",
	lineHeight: "20px",
	textAlign: "center" as const,
	margin: "16px 0 0",
};
const fallbackLinkAnchor = {
	color: "#888888",
	fontSize: "14px",
	wordBreak: "break-all" as const,
};

const previewData: EmailData = {
	preview: "Your trip request has been confirmed",
	title: "Your booking is confirmed",
	subtitle: "We look forward to seeing you on your trip.",
	buttonLabel: "View your trip",
	secondaryText: "If you have any questions, reply to this email.",
	secondaryLinkLabel: "Visit dantrip.com",
	secondaryLinkHref: "https://dantrip.com",
};

export default function GenericEmailPreview() {
	return (
		<GenericEmail data={previewData} href="https://dantrip.com/trip/123" />
	);
}
