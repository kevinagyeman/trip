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

interface NewRequestEmailProps {
	requestId: string;
	userName: string;
	userEmail: string;
	serviceType: string;
	firstName: string;
	lastName: string;
	phone: string;
	numberOfAdults: number;
	adminUrl: string;
}

export function NewRequestEmail({
	requestId,
	userName,
	userEmail,
	serviceType,
	firstName,
	lastName,
	phone,
	numberOfAdults,
	adminUrl,
}: NewRequestEmailProps) {
	const serviceLabel =
		serviceType === "both"
			? "Arrival & Departure"
			: serviceType === "arrival"
				? "Arrival only"
				: "Departure only";

	return (
		<Html>
			<Head />
			<Preview>New trip request from {firstName} {lastName}</Preview>
			<Body style={body}>
				<Container style={container}>
					<Heading style={heading}>Trip Manager</Heading>
					<Hr style={hr} />
					<Heading as="h2" style={subheading}>
						New Trip Request
					</Heading>
					<Text style={text}>
						A new trip request has been submitted and is waiting for a quotation.
					</Text>

					<Section style={card}>
						<Row>
							<Column style={label}>Customer</Column>
							<Column style={value}>
								{firstName} {lastName}
							</Column>
						</Row>
						<Row>
							<Column style={label}>Account</Column>
							<Column style={value}>{userEmail}</Column>
						</Row>
						<Row>
							<Column style={label}>Phone</Column>
							<Column style={value}>{phone}</Column>
						</Row>
						<Row>
							<Column style={label}>Service</Column>
							<Column style={value}>{serviceLabel}</Column>
						</Row>
						<Row>
							<Column style={label}>Adults</Column>
							<Column style={value}>{numberOfAdults}</Column>
						</Row>
					</Section>

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
const subheading = { color: "#1a1a1a", fontSize: "20px", margin: "24px 0 8px" };
const text = { color: "#4a4a4a", fontSize: "15px", lineHeight: "24px", margin: "0 0 16px" };
const footer = { color: "#888888", fontSize: "12px", textAlign: "center" as const };
const hr = { borderColor: "#e6ebf1", margin: "24px 0" };
const card = {
	backgroundColor: "#f6f9fc",
	borderRadius: "6px",
	padding: "16px",
	margin: "0 0 24px",
};
const label = { color: "#888888", fontSize: "13px", width: "120px", padding: "4px 0" };
const value = { color: "#1a1a1a", fontSize: "14px", fontWeight: "500", padding: "4px 0" };
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
