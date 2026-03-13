import { Button, Heading, Section, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./email-layout";

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
		<EmailLayout preview="YOUR QUOTATION IS READY">
			<Heading as="h2" style={emailStyles.subheading}>
				Your quotation is ready
			</Heading>
			<Text style={emailStyles.text}>Dear {firstName},</Text>
			<Text style={emailStyles.text}>
				We have prepared a quotation for your trip request. Please review it and
				let us know if you'd like to accept or decline.
			</Text>
			<Section style={priceBox}>
				<Text style={priceLabel}>Quoted price</Text>
				<Text style={priceValue}>
					{currency} {price}
				</Text>
				{isPriceEachWay && (
					<Text style={priceMeta}>Price is per direction (each way)</Text>
				)}
				{areCarSeatsIncluded && (
					<Text style={priceMeta}>Child car seats included</Text>
				)}
			</Section>
			{additionalInfo && (
				<>
					<Text style={sectionTitle}>Additional information</Text>
					<Text style={infoText}>{additionalInfo}</Text>
				</>
			)}
			<Section style={emailStyles.buttonSection}>
				<Button style={emailStyles.button} href={dashboardUrl}>
					View &amp; Respond to Quotation
				</Button>
			</Section>
		</EmailLayout>
	);
}

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

export default QuotationSentEmail;
