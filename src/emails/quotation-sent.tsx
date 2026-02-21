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

interface QuotationSentEmailProps {
	firstName: string;
	price: string;
	currency: string;
	isPriceEachWay: boolean;
	areCarSeatsIncluded: boolean;
	additionalInfo?: string;
	dashboardUrl: string;
}

export function QuotationSentEmail({
	firstName,
	price,
	currency,
	isPriceEachWay,
	areCarSeatsIncluded,
	additionalInfo,
	dashboardUrl,
}: QuotationSentEmailProps) {
	return (
		<Html>
			<Head />
			<Preview>
				Your quotation is ready — {currency} {price}
			</Preview>
			<Body style={body}>
				<Container style={container}>
					<Heading style={heading}>Trip Manager</Heading>
					<Hr style={hr} />
					<Heading as="h2" style={subheading}>
						Your quotation is ready
					</Heading>
					<Text style={text}>Hi {firstName},</Text>
					<Text style={text}>
						We have prepared a quotation for your trip request. Please review it
						and let us know if you'd like to accept or decline.
					</Text>

					<Section style={priceBox}>
						<Text style={priceLabel}>Quoted Price</Text>
						<Text style={priceValue}>
							{currency} {price}
						</Text>
						{isPriceEachWay && (
							<Text style={priceMeta}>
								Price applies to each direction separately
							</Text>
						)}
						{areCarSeatsIncluded && (
							<Text style={priceMeta}>Child car seats included</Text>
						)}
					</Section>

					{additionalInfo && (
						<>
							<Text style={sectionTitle}>Additional Information</Text>
							<Text style={infoText}>{additionalInfo}</Text>
						</>
					)}

					<Section style={buttonSection}>
						<Button style={button} href={dashboardUrl}>
							View &amp; Respond to Quotation
						</Button>
					</Section>

					<Text style={hint}>
						This quotation was sent by our team. If you have questions, please
						reply to this email.
					</Text>
					<Hr style={hr} />
					<Text style={footer}>
						Trip Manager · Secure travel transfer service
					</Text>
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
const subheading = { color: "#1a1a1a", fontSize: "20px", margin: "24px 0 8px" };
const text = {
	color: "#4a4a4a",
	fontSize: "15px",
	lineHeight: "24px",
	margin: "0 0 16px",
};
const hint = { color: "#888888", fontSize: "13px", lineHeight: "20px" };
const footer = {
	color: "#888888",
	fontSize: "12px",
	textAlign: "center" as const,
};
const hr = { borderColor: "#e6ebf1", margin: "24px 0" };
const priceBox = {
	backgroundColor: "#f0fdf4",
	border: "1px solid #bbf7d0",
	borderRadius: "8px",
	padding: "24px",
	textAlign: "center" as const,
	margin: "0 0 24px",
};
const priceLabel = {
	color: "#166534",
	fontSize: "13px",
	margin: "0 0 8px",
	fontWeight: "600",
};
const priceValue = {
	color: "#14532d",
	fontSize: "36px",
	fontWeight: "700",
	margin: "0 0 8px",
};
const priceMeta = { color: "#166534", fontSize: "13px", margin: "4px 0 0" };
const sectionTitle = {
	color: "#1a1a1a",
	fontSize: "15px",
	fontWeight: "600",
	margin: "0 0 8px",
};
const infoText = {
	color: "#4a4a4a",
	fontSize: "14px",
	lineHeight: "22px",
	whiteSpace: "pre-wrap" as const,
	backgroundColor: "#f6f9fc",
	borderRadius: "6px",
	padding: "12px",
	margin: "0 0 24px",
};
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
