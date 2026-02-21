import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Preview,
	Row,
	Column,
	Section,
	Text,
} from "@react-email/components";

interface TripConfirmedEmailProps {
	customerName: string;
	customerEmail: string;
	serviceType: string;
	arrivalFlightDate?: string;
	arrivalFlightTime?: string;
	arrivalFlightNumber?: string;
	departureFlightDate?: string;
	departureFlightTime?: string;
	departureFlightNumber?: string;
	adminUrl: string;
}

export function TripConfirmedEmail({
	customerName,
	customerEmail,
	serviceType,
	arrivalFlightDate,
	arrivalFlightTime,
	arrivalFlightNumber,
	departureFlightDate,
	departureFlightTime,
	departureFlightNumber,
	adminUrl,
}: TripConfirmedEmailProps) {
	const showArrival = serviceType === "both" || serviceType === "arrival";
	const showDeparture = serviceType === "both" || serviceType === "departure";

	return (
		<Html>
			<Head />
			<Preview>
				✈️ {customerName} confirmed their trip with flight details
			</Preview>
			<Body style={body}>
				<Container style={container}>
					<Heading style={heading}>Trip Manager</Heading>
					<Hr style={hr} />
					<Heading as="h2" style={subheading}>
						✈️ Trip Confirmed
					</Heading>
					<Text style={text}>
						<strong>{customerName}</strong> ({customerEmail}) has confirmed
						their booking and submitted flight details.
					</Text>

					{showArrival && (arrivalFlightDate ?? arrivalFlightNumber) && (
						<Section style={card}>
							<Text style={cardTitle}>Arrival Flight</Text>
							{arrivalFlightDate && (
								<Row>
									<Column style={label}>Date</Column>
									<Column style={value}>{arrivalFlightDate}</Column>
								</Row>
							)}
							{arrivalFlightTime && (
								<Row>
									<Column style={label}>Time</Column>
									<Column style={value}>{arrivalFlightTime}</Column>
								</Row>
							)}
							{arrivalFlightNumber && (
								<Row>
									<Column style={label}>Flight No.</Column>
									<Column style={value}>{arrivalFlightNumber}</Column>
								</Row>
							)}
						</Section>
					)}

					{showDeparture && (departureFlightDate ?? departureFlightNumber) && (
						<Section style={card}>
							<Text style={cardTitle}>Departure Flight</Text>
							{departureFlightDate && (
								<Row>
									<Column style={label}>Date</Column>
									<Column style={value}>{departureFlightDate}</Column>
								</Row>
							)}
							{departureFlightTime && (
								<Row>
									<Column style={label}>Time</Column>
									<Column style={value}>{departureFlightTime}</Column>
								</Row>
							)}
							{departureFlightNumber && (
								<Row>
									<Column style={label}>Flight No.</Column>
									<Column style={value}>{departureFlightNumber}</Column>
								</Row>
							)}
						</Section>
					)}

					<Section style={buttonSection}>
						<Button style={button} href={adminUrl}>
							View Full Request
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
const subheading = { color: "#1a1a1a", fontSize: "20px", margin: "24px 0 8px" };
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
const card = {
	backgroundColor: "#f6f9fc",
	borderRadius: "6px",
	padding: "16px",
	margin: "0 0 16px",
};
const cardTitle = {
	color: "#1a1a1a",
	fontSize: "14px",
	fontWeight: "600",
	margin: "0 0 12px",
};
const label = {
	color: "#888888",
	fontSize: "13px",
	width: "100px",
	padding: "3px 0",
};
const value = {
	color: "#1a1a1a",
	fontSize: "14px",
	fontWeight: "500",
	padding: "3px 0",
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
