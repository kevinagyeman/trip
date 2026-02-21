"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AIRPORTS, SERVICE_TYPES, LANGUAGES } from "@/lib/airports";

export function CreateTripRequestForm() {
	const router = useRouter();

	// Service Type
	const [serviceType, setServiceType] = useState<
		"both" | "arrival" | "departure"
	>("both");

	// Arrival Information
	const [arrivalAirport, setArrivalAirport] = useState("");
	const [destinationAddress, setDestinationAddress] = useState("");

	// Departure Information
	const [pickupAddress, setPickupAddress] = useState("");
	const [departureAirport, setDepartureAirport] = useState("");

	// Travel Information
	const [language, setLanguage] = useState<"English" | "Italian">("English");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [phone, setPhone] = useState("");
	const [numberOfAdults, setNumberOfAdults] = useState(1);

	// Children Information
	const [areThereChildren, setAreThereChildren] = useState(false);
	const [numberOfChildren, setNumberOfChildren] = useState(0);
	const [ageOfChildren, setAgeOfChildren] = useState("");
	const [numberOfChildSeats, setNumberOfChildSeats] = useState(0);

	// Additional Information
	const [additionalInfo, setAdditionalInfo] = useState("");

	const createRequest = api.tripRequest.create.useMutation({
		onSuccess: (data) => {
			router.push(`/dashboard/requests/${data.id}`);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		createRequest.mutate({
			serviceType,
			arrivalAirport: arrivalAirport || undefined,
			destinationAddress: destinationAddress || undefined,
			pickupAddress: pickupAddress || undefined,
			departureAirport: departureAirport || undefined,
			language,
			firstName,
			lastName,
			phone,
			numberOfAdults,
			areThereChildren,
			numberOfChildren: areThereChildren ? numberOfChildren : undefined,
			ageOfChildren: areThereChildren && ageOfChildren ? ageOfChildren : undefined,
			numberOfChildSeats: areThereChildren ? numberOfChildSeats : undefined,
			additionalInfo: additionalInfo || undefined,
		});
	};

	const showArrivalFields =
		serviceType === "both" || serviceType === "arrival";
	const showDepartureFields =
		serviceType === "both" || serviceType === "departure";

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* Service Type Section */}
			<div className="space-y-4">
				<h3 className="text-lg font-semibold">Service Type</h3>
				<div>
					<Label htmlFor="serviceType">What service do you need?</Label>
					<Select
						value={serviceType}
						onValueChange={(value) =>
							setServiceType(value as "both" | "arrival" | "departure")
						}
					>
						<SelectTrigger id="serviceType">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{SERVICE_TYPES.map((type) => (
								<SelectItem key={type.value} value={type.value}>
									{type.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Arrival Information Section */}
			{showArrivalFields && (
				<div className="space-y-4 rounded-lg border p-4">
					<h3 className="text-lg font-semibold">Arrival Information</h3>
					<div>
						<Label htmlFor="arrivalAirport">Arrival Airport *</Label>
						<Select value={arrivalAirport} onValueChange={setArrivalAirport}>
							<SelectTrigger id="arrivalAirport">
								<SelectValue placeholder="Select arrival airport" />
							</SelectTrigger>
							<SelectContent>
								{AIRPORTS.map((airport) => (
									<SelectItem key={airport.value} value={airport.value}>
										{airport.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label htmlFor="destinationAddress">Destination Address *</Label>
						<Input
							id="destinationAddress"
							value={destinationAddress}
							onChange={(e) => setDestinationAddress(e.target.value)}
							placeholder="Enter your destination address"
						/>
					</div>
				</div>
			)}

			{/* Departure Information Section */}
			{showDepartureFields && (
				<div className="space-y-4 rounded-lg border p-4">
					<h3 className="text-lg font-semibold">Departure Information</h3>
					<div>
						<Label htmlFor="pickupAddress">Pickup Address *</Label>
						<Input
							id="pickupAddress"
							value={pickupAddress}
							onChange={(e) => setPickupAddress(e.target.value)}
							placeholder="Enter pickup address"
						/>
					</div>

					<div>
						<Label htmlFor="departureAirport">Departure Airport *</Label>
						<Select
							value={departureAirport}
							onValueChange={setDepartureAirport}
						>
							<SelectTrigger id="departureAirport">
								<SelectValue placeholder="Select departure airport" />
							</SelectTrigger>
							<SelectContent>
								{AIRPORTS.map((airport) => (
									<SelectItem key={airport.value} value={airport.value}>
										{airport.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			)}

			{/* Travel Information Section */}
			<div className="space-y-4 rounded-lg border p-4">
				<h3 className="text-lg font-semibold">Travel Information</h3>

				<div>
					<Label htmlFor="language">Preferred Language</Label>
					<Select
						value={language}
						onValueChange={(value) =>
							setLanguage(value as "English" | "Italian")
						}
					>
						<SelectTrigger id="language">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{LANGUAGES.map((lang) => (
								<SelectItem key={lang.value} value={lang.value}>
									{lang.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<Label htmlFor="firstName">First Name *</Label>
						<Input
							id="firstName"
							value={firstName}
							onChange={(e) => setFirstName(e.target.value)}
							placeholder="First name"
							required
						/>
					</div>
					<div>
						<Label htmlFor="lastName">Last Name *</Label>
						<Input
							id="lastName"
							value={lastName}
							onChange={(e) => setLastName(e.target.value)}
							placeholder="Last name"
							required
						/>
					</div>
				</div>

				<div>
					<Label htmlFor="phone">Phone Number (with country code) *</Label>
					<Input
						id="phone"
						value={phone}
						onChange={(e) => setPhone(e.target.value)}
						placeholder="+39 123 456 7890"
						required
					/>
				</div>

				<div>
					<Label htmlFor="numberOfAdults">Number of Adults *</Label>
					<Input
						id="numberOfAdults"
						type="number"
						min={1}
						max={100}
						value={numberOfAdults}
						onChange={(e) => setNumberOfAdults(parseInt(e.target.value) || 1)}
						required
					/>
				</div>
			</div>

			{/* Children Information Section */}
			<div className="space-y-4 rounded-lg border p-4">
				<h3 className="text-lg font-semibold">Children Information</h3>

				<div>
					<Label>Are there children traveling? *</Label>
					<RadioGroup
						value={areThereChildren ? "yes" : "no"}
						onValueChange={(value) => setAreThereChildren(value === "yes")}
					>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="yes" id="children-yes" />
							<Label htmlFor="children-yes" className="font-normal">
								Yes
							</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="no" id="children-no" />
							<Label htmlFor="children-no" className="font-normal">
								No
							</Label>
						</div>
					</RadioGroup>
				</div>

				{areThereChildren && (
					<>
						<div>
							<Label htmlFor="numberOfChildren">
								Number of Children (0-10 years)
							</Label>
							<Input
								id="numberOfChildren"
								type="number"
								min={0}
								max={20}
								value={numberOfChildren}
								onChange={(e) =>
									setNumberOfChildren(parseInt(e.target.value) || 0)
								}
							/>
						</div>

						<div>
							<Label htmlFor="ageOfChildren">Age of Children</Label>
							<Input
								id="ageOfChildren"
								value={ageOfChildren}
								onChange={(e) => setAgeOfChildren(e.target.value)}
								placeholder="e.g., 3 years, 7 years"
							/>
						</div>

						<div>
							<Label htmlFor="numberOfChildSeats">Number of Child Seats</Label>
							<Input
								id="numberOfChildSeats"
								type="number"
								min={0}
								max={20}
								value={numberOfChildSeats}
								onChange={(e) =>
									setNumberOfChildSeats(parseInt(e.target.value) || 0)
								}
							/>
						</div>
					</>
				)}
			</div>

			{/* Additional Information Section */}
			<div className="space-y-4">
				<h3 className="text-lg font-semibold">Additional Information</h3>
				<div>
					<Label htmlFor="additionalInfo">
						Special Requests (Optional)
					</Label>
					<Textarea
						id="additionalInfo"
						value={additionalInfo}
						onChange={(e) => setAdditionalInfo(e.target.value)}
						placeholder="Any special requests or additional information..."
						rows={4}
					/>
				</div>
			</div>

			<div className="rounded-lg bg-muted p-4 text-sm">
				<p>
					* Flight details (dates, times, numbers) can be added later after you
					receive and accept a quotation.
				</p>
			</div>

			<Button
				type="submit"
				disabled={createRequest.isPending}
				className="w-full"
			>
				{createRequest.isPending ? "Submitting..." : "Submit Quotation Request"}
			</Button>

			{createRequest.error && (
				<p className="text-sm text-destructive">
					{createRequest.error.message}
				</p>
			)}
		</form>
	);
}
