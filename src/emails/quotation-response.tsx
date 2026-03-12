import {
	Body,
	Button,
	Container,
	Head,
	Html,
	Preview,
	Section,
	Text,
} from "@react-email/components";

interface QuotationResponseEmailProps {
	orderNumber: number;
	accepted: boolean;
	customerName: string;
	customerEmail: string;
	price: string;
	currency: string;
	adminUrl: string;
}

export function QuotationResponseEmail({
	orderNumber,
	accepted,
	customerName,
	price,
	currency,
	adminUrl,
}: QuotationResponseEmailProps) {
	const order = `#${String(orderNumber).padStart(7, "0")}`;
	const action = accepted ? "accepted" : "rejected";

	return (
		<Html>
			<Head />
			<Preview>
				QUOTATION {action.toUpperCase()} {order} | {customerName}
			</Preview>
			<Body style={body}>
				<Container style={container}>
					<Text style={label}>dantrip.com</Text>
					<Text style={title}>
						{customerName} {action} quotation {order}
					</Text>
					<Text style={subtitle}>
						{currency} {price}
					</Text>
					<Section style={buttonSection}>
						<Button style={button} href={adminUrl}>
							View request
						</Button>
					</Section>
				</Container>
			</Body>
		</Html>
	);
}

const body = { backgroundColor: "#f6f9fc", fontFamily: "sans-serif" };
const container = {
	backgroundColor: "#ffffff",
	margin: "40px auto",
	padding: "40px",
	borderRadius: "8px",
	maxWidth: "480px",
};
const label = { color: "#888888", fontSize: "12px", margin: "0 0 16px" };
const title = {
	color: "#1a1a1a",
	fontSize: "18px",
	fontWeight: "600",
	margin: "0 0 4px",
	lineHeight: "1.4",
};
const subtitle = { color: "#555555", fontSize: "14px", margin: "0 0 24px" };
const buttonSection = { margin: "0" };
const button = {
	backgroundColor: "#000000",
	borderRadius: "6px",
	color: "#ffffff",
	fontSize: "14px",
	fontWeight: "600",
	padding: "10px 20px",
	textDecoration: "none",
	display: "inline-block",
};
