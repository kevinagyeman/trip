import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Preview,
	Section,
	Text,
} from "@react-email/components";

interface QuotationResponseEmailProps {
	accepted: boolean;
	customerName: string;
	customerEmail: string;
	price: string;
	currency: string;
	adminUrl: string;
}

export function QuotationResponseEmail({
	accepted,
	customerName,
	customerEmail,
	price,
	currency,
	adminUrl,
}: QuotationResponseEmailProps) {
	const action = accepted ? "accepted" : "rejected";
	const emoji = accepted ? "✅" : "❌";

	return (
		<Html>
			<Head />
			<Preview>
				{emoji} {customerName} {action} the quotation
			</Preview>
			<Body style={body}>
				<Container style={container}>
					<Heading style={heading}>Trip Manager</Heading>
					<Hr style={hr} />
					<Heading as="h2" style={accepted ? subheadingGreen : subheadingRed}>
						{emoji} Quotation {accepted ? "Accepted" : "Rejected"}
					</Heading>
					<Text style={text}>
						<strong>{customerName}</strong> ({customerEmail}) has{" "}
						<strong>{action}</strong> the quotation of{" "}
						<strong>
							{currency} {price}
						</strong>
						.
					</Text>

					{accepted && (
						<Text style={text}>
							The customer will now be able to confirm their booking with flight
							details. You may want to proceed with the reservation.
						</Text>
					)}

					{!accepted && (
						<Text style={text}>
							You may want to follow up with the customer or create a revised
							quotation.
						</Text>
					)}

					<Section style={buttonSection}>
						<Button style={button} href={adminUrl}>
							View Request
						</Button>
					</Section>

					<Hr style={hr} />
					<Text style={footer}>Trip Manager · Admin notification</Text>
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
	maxWidth: "560px",
};
const heading = { color: "#1a1a1a", fontSize: "24px", margin: "0 0 8px" };
const subheadingGreen = {
	color: "#166534",
	fontSize: "20px",
	margin: "24px 0 8px",
};
const subheadingRed = {
	color: "#991b1b",
	fontSize: "20px",
	margin: "24px 0 8px",
};
const text = {
	color: "#4a4a4a",
	fontSize: "15px",
	lineHeight: "24px",
	margin: "0 0 16px",
};
const footer = {
	color: "#888888",
	fontSize: "12px",
	textAlign: "center" as const,
};
const hr = { borderColor: "#e6ebf1", margin: "24px 0" };
const buttonSection = { textAlign: "center" as const, margin: "32px 0" };
const button = {
	backgroundColor: "#000000",
	borderRadius: "6px",
	color: "#ffffff",
	fontSize: "15px",
	fontWeight: "600",
	padding: "12px 24px",
	textDecoration: "none",
	display: "inline-block",
};
