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

interface RequestConfirmationEmailProps {
	orderNumber: number;
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	routes: unknown;
	numberOfAdults: number;
	areThereChildren: boolean;
	numberOfChildren?: number | null;
	ageOfChildren?: string | null;
	numberOfChildSeats?: number | null;
	language: string;
	additionalInfo?: string | null;
	requestUrl: string;
}

export function RequestConfirmationEmail({
	orderNumber,
	firstName,
	lastName,
	requestUrl,
}: RequestConfirmationEmailProps) {
	const order = `#${String(orderNumber).padStart(7, "0")}`;

	return (
		<Html>
			<Head />
			<Preview>REQUEST RECEIVED {order}</Preview>
			<Body style={body}>
				<Container style={container}>
					<Text style={label}>dantrip.com</Text>
					<Text style={title}>
						Dear {firstName} {lastName}, your request {order} has been received
					</Text>
					<Text style={subtitle}>
						We'll notify you as soon as a quotation is ready.
					</Text>
					<Section style={buttonSection}>
						<Button style={button} href={requestUrl}>
							More details
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
