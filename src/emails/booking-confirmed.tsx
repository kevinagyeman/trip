import { Button, Heading, Section, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./email-layout";

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
		<EmailLayout
			preview={`Your trip is confirmed — ${pickupDate} at ${pickupTime}`}
		>
			<Heading as="h2" style={emailStyles.subheading}>
				Your trip is confirmed!
			</Heading>
			<Text style={emailStyles.text}>Hi {firstName},</Text>
			<Text style={emailStyles.text}>
				Your trip has been confirmed. Here are your pickup details:
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
			<Section style={emailStyles.buttonSection}>
				<Button style={emailStyles.button} href={requestUrl}>
					View Your Booking
				</Button>
			</Section>
		</EmailLayout>
	);
}

const detailsBox = {
	backgroundColor: "#f0fdf4",
	border: "1px solid #bbf7d0",
	borderRadius: "8px",
	padding: "20px",
	margin: "0 0 24px",
};
const detailRow = { color: "#166534", fontSize: "15px", margin: "0 0 8px" };

export default BookingConfirmedEmail;
