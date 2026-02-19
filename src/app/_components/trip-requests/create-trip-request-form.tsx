"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateTripRequestFormProps {
	onSuccess?: () => void;
}

export function CreateTripRequestForm({
	onSuccess,
}: CreateTripRequestFormProps) {
	const router = useRouter();
	const [destination, setDestination] = useState("");
	const [startDate, setStartDate] = useState<Date>();
	const [endDate, setEndDate] = useState<Date>();
	const [passengerCount, setPassengerCount] = useState(1);
	const [description, setDescription] = useState("");

	const createRequest = api.tripRequest.create.useMutation({
		onSuccess: (data) => {
			router.push(`/dashboard/requests/${data.id}`);
			onSuccess?.();
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!startDate || !endDate) return;

		createRequest.mutate({
			destination,
			startDate,
			endDate,
			passengerCount,
			description: description || undefined,
		});
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<Label htmlFor="destination">Destination</Label>
				<Input
					id="destination"
					value={destination}
					onChange={(e) => setDestination(e.target.value)}
					placeholder="e.g., Paris, France"
					required
				/>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div>
					<Label>Start Date</Label>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								className={cn(
									"w-full justify-start text-left font-normal",
									!startDate && "text-muted-foreground",
								)}
							>
								<CalendarIcon className="mr-2 h-4 w-4" />
								{startDate ? format(startDate, "PPP") : "Pick a date"}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0">
							<Calendar
								mode="single"
								selected={startDate}
								onSelect={setStartDate}
								disabled={(date) => date < new Date()}
							/>
						</PopoverContent>
					</Popover>
				</div>

				<div>
					<Label>End Date</Label>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								className={cn(
									"w-full justify-start text-left font-normal",
									!endDate && "text-muted-foreground",
								)}
							>
								<CalendarIcon className="mr-2 h-4 w-4" />
								{endDate ? format(endDate, "PPP") : "Pick a date"}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0">
							<Calendar
								mode="single"
								selected={endDate}
								onSelect={setEndDate}
								disabled={(date) => !startDate || date < startDate}
							/>
						</PopoverContent>
					</Popover>
				</div>
			</div>

			<div>
				<Label htmlFor="passengerCount">Number of Passengers</Label>
				<Input
					id="passengerCount"
					type="number"
					min={1}
					max={100}
					value={passengerCount}
					onChange={(e) => setPassengerCount(parseInt(e.target.value))}
					required
				/>
			</div>

			<div>
				<Label htmlFor="description">Additional Details (Optional)</Label>
				<Textarea
					id="description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Any special requirements or preferences..."
					rows={4}
				/>
			</div>

			<Button
				type="submit"
				disabled={createRequest.isPending}
				className="w-full"
			>
				{createRequest.isPending ? "Creating..." : "Submit Request"}
			</Button>

			{createRequest.error && (
				<p className="text-sm text-destructive">
					{createRequest.error.message}
				</p>
			)}
		</form>
	);
}
