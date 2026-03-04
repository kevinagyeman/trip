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

interface BookingConfirmedEmailProps {
	firstName: string;
	pickupDate: string;
	pickupTime: string;
	flightNumber?: string;
	routeSummary: string;
	requestUrl: string;
}

export function BookingConfirmedEmail({
	firstName,
	pickupDate,
	pickupTime,
	flightNumber,
	routeSummary,
	requestUrl,
}: BookingConfirmedEmailProps) {
	return (
		<Html>
			<Head />
			<Preview>
				Your trip is confirmed — {pickupDate} at {pickupTime}
			</Preview>
			<Body style={bodyStyle}>
				<Container style={container}>
					<Heading style={heading}>Trip Manager</Heading>
					<Hr style={hr} />
					<Heading as="h2" style={subheading}>
						Your trip is confirmed! 🚗
					</Heading>
					<Text style={text}>Hi {firstName},</Text>
					<Text style={text}>
						Great news — your trip has been confirmed. Here are your pickup
						details:
					</Text>
					<Section style={detailsBox}>
						<Text style={detailRow}>
							<strong>Route:</strong> {routeSummary}
						</Text>
						<Text style={detailRow}>
							<strong>Pickup date:</strong> {pickupDate}
						</Text>
						<Text style={detailRow}>
							<strong>Pickup time:</strong> {pickupTime}
						</Text>
						{flightNumber && (
							<Text style={detailRow}>
								<strong>Flight number:</strong> {flightNumber}
							</Text>
						)}
					</Section>
					<Section style={buttonSection}>
						<Button style={button} href={requestUrl}>
							View Your Booking
						</Button>
					</Section>
					<Hr style={hr} />
					<Text style={footer}>
						Trip Manager · Secure travel transfer service
					</Text>
				</Container>
			</Body>
		</Html>
	);
}

const bodyStyle = { backgroundColor: "#f6f9fc", fontFamily: "sans-serif" };
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
const hr = { borderColor: "#e6ebf1", margin: "24px 0" };
const detailsBox = {
	backgroundColor: "#f0fdf4",
	border: "1px solid #bbf7d0",
	borderRadius: "8px",
	padding: "20px",
	margin: "0 0 24px",
};
const detailRow = { color: "#166534", fontSize: "15px", margin: "0 0 8px" };
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
const footer = {
	color: "#888888",
	fontSize: "12px",
	textAlign: "center" as const,
};
