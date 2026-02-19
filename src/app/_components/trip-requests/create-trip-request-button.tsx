"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { CreateTripRequestForm } from "./create-trip-request-form";

export function CreateTripRequestButton() {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>New Trip Request</Button>
			</DialogTrigger>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Create Trip Request</DialogTitle>
				</DialogHeader>
				<CreateTripRequestForm onSuccess={() => setOpen(false)} />
			</DialogContent>
		</Dialog>
	);
}
