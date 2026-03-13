import {
	Body,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Preview,
	Text,
} from "@react-email/components";
import type React from "react";

interface EmailLayoutProps {
	preview: string;
	children: React.ReactNode;
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
	return (
		<Html>
			<Head />
			<Preview>{preview}</Preview>
			<Body style={body}>
				<Container style={container}>
					<Heading style={heading}>dantrip.com</Heading>
					<Hr style={hr} />
					{children}
					<Hr style={hr} />
					<Text style={footer}>
						dantrip.com · Secure travel transfer service
					</Text>
				</Container>
			</Body>
		</Html>
	);
}

export const emailStyles = {
	body: { backgroundColor: "#f6f9fc", fontFamily: "sans-serif" },
	container: {
		backgroundColor: "#ffffff",
		margin: "40px auto",
		padding: "40px",
		borderRadius: "8px",
		maxWidth: "560px",
	},
	label: { color: "#888888", fontSize: "12px", margin: "0 0 16px" },
	heading: { color: "#1a1a1a", fontSize: "24px", margin: "0 0 8px" },
	subheading: { color: "#1a1a1a", fontSize: "20px", margin: "24px 0 8px" },
	title: {
		color: "#1a1a1a",
		fontSize: "18px",
		fontWeight: "600",
		margin: "0 0 4px",
		lineHeight: "1.4",
	},
	subtitle: { color: "#555555", fontSize: "14px", margin: "0 0 24px" },
	text: {
		color: "#4a4a4a",
		fontSize: "15px",
		lineHeight: "24px",
		margin: "0 0 16px",
	},
	footer: {
		color: "#888888",
		fontSize: "12px",
		textAlign: "center" as const,
	},
	hr: { borderColor: "#e6ebf1", margin: "24px 0" },
	buttonSection: { textAlign: "center" as const, margin: "32px 0" },
	button: {
		backgroundColor: "#000000",
		borderRadius: "6px",
		color: "#ffffff",
		fontSize: "14px",
		fontWeight: "600",
		padding: "10px 20px",
		textDecoration: "none",
		display: "inline-block",
	},
};

const { body, container, heading, hr, footer } = emailStyles;
