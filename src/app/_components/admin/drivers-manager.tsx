"use client";

import { LoadingButton } from "@/app/_components/ui/loading-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { COUNTRY_CODES } from "@/lib/phone";
import { api } from "@/trpc/react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

type DriverForm = {
	name: string;
	surname: string;
	phoneCountryCode: string;
	phoneNumber: string;
	email: string;
};

type FormErrors = Partial<Record<keyof DriverForm, string>>;

const empty: DriverForm = {
	name: "",
	surname: "",
	phoneCountryCode: "+39",
	phoneNumber: "",
	email: "",
};

export function DriversManager() {
	const utils = api.useUtils();
	const { data: drivers = [], isLoading } = api.driver.getAll.useQuery();

	const [open, setOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [form, setForm] = useState<DriverForm>(empty);
	const [errors, setErrors] = useState<FormErrors>({});

	const createDriver = api.driver.create.useMutation({
		onSuccess: async () => {
			await utils.driver.getAll.invalidate();
			handleClose();
		},
	});

	const updateDriver = api.driver.update.useMutation({
		onSuccess: async () => {
			await utils.driver.getAll.invalidate();
			handleClose();
		},
	});

	const deleteDriver = api.driver.delete.useMutation({
		onSuccess: async () => {
			await utils.driver.getAll.invalidate();
		},
	});

	function handleClose() {
		setOpen(false);
		setEditingId(null);
		setForm(empty);
		setErrors({});
	}

	function openCreate() {
		setForm(empty);
		setEditingId(null);
		setOpen(true);
	}

	function openEdit(d: (typeof drivers)[0]) {
		// Split stored phone back into code + number if possible
		const match = d.phone.match(/^(\+\d+)\s(.+)$/);
		setForm({
			name: d.name,
			surname: d.surname,
			phoneCountryCode: match?.[1] ?? "+39",
			phoneNumber: match?.[2] ?? d.phone,
			email: d.email,
		});
		setEditingId(d.id);
		setOpen(true);
	}

	function validate(): boolean {
		const e: FormErrors = {};
		if (!form.name.trim()) e.name = "Required";
		if (!form.surname.trim()) e.surname = "Required";
		if (!form.phoneNumber.trim()) e.phoneNumber = "Required";
		if (!form.email.trim()) e.email = "Required";
		setErrors(e);
		return Object.keys(e).length === 0;
	}

	function handleSubmit() {
		if (!validate()) return;
		const phone = `${form.phoneCountryCode} ${form.phoneNumber}`;
		const payload = {
			name: form.name,
			surname: form.surname,
			phone,
			email: form.email,
		};
		if (editingId) {
			updateDriver.mutate({ id: editingId, ...payload });
		} else {
			createDriver.mutate(payload);
		}
	}

	const isSaving = createDriver.isPending || updateDriver.isPending;

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Drivers</h1>
				<Button onClick={openCreate} size="sm">
					<Plus className="mr-1.5 h-4 w-4" />
					Add driver
				</Button>
			</div>

			{isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}

			{!isLoading && drivers.length === 0 && (
				<Card>
					<CardContent className="py-8 text-center text-sm text-muted-foreground">
						No drivers yet. Add your first driver to pre-fill pickup info.
					</CardContent>
				</Card>
			)}

			<div className="space-y-2">
				{drivers.map((d) => (
					<Card key={d.id}>
						<CardHeader className="pb-1 pt-4">
							<div className="flex items-start justify-between">
								<CardTitle className="text-base">
									{d.name} {d.surname}
								</CardTitle>
								<div className="flex gap-1">
									<Button
										size="icon"
										variant="ghost"
										className="h-7 w-7"
										onClick={() => openEdit(d)}
									>
										<Pencil className="h-3.5 w-3.5" />
									</Button>
									<Button
										size="icon"
										variant="ghost"
										className="h-7 w-7 text-destructive hover:text-destructive"
										onClick={() => deleteDriver.mutate({ id: d.id })}
									>
										<Trash2 className="h-3.5 w-3.5" />
									</Button>
								</div>
							</div>
						</CardHeader>
						<CardContent className="pb-4 text-sm text-muted-foreground">
							<p>{d.phone}</p>
							<p>{d.email}</p>
						</CardContent>
					</Card>
				))}
			</div>

			<Dialog
				open={open}
				onOpenChange={(v) => {
					if (!v) handleClose();
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{editingId ? "Edit driver" : "Add driver"}
						</DialogTitle>
					</DialogHeader>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<div className="space-y-1">
							<Label className="text-xs">Name *</Label>
							<Input
								value={form.name}
								onChange={(e) =>
									setForm((p) => ({ ...p, name: e.target.value }))
								}
								className={errors.name ? "border-destructive" : ""}
							/>
							{errors.name && (
								<p className="text-xs text-destructive">{errors.name}</p>
							)}
						</div>
						<div className="space-y-1">
							<Label className="text-xs">Surname *</Label>
							<Input
								value={form.surname}
								onChange={(e) =>
									setForm((p) => ({ ...p, surname: e.target.value }))
								}
								className={errors.surname ? "border-destructive" : ""}
							/>
							{errors.surname && (
								<p className="text-xs text-destructive">{errors.surname}</p>
							)}
						</div>
						<div className="col-span-full space-y-1">
							<Label className="text-xs">Phone *</Label>
							<div className="flex gap-2">
								<Select
									value={form.phoneCountryCode}
									onValueChange={(v) =>
										setForm((p) => ({ ...p, phoneCountryCode: v }))
									}
								>
									<SelectTrigger className="w-[110px] shrink-0">
										<SelectValue>
											{(() => {
												const country = COUNTRY_CODES.find(
													(c) => c.value === form.phoneCountryCode,
												);
												const flag = country?.label.split(" ")[0] ?? "";
												return `${flag} ${form.phoneCountryCode}`;
											})()}
										</SelectValue>
									</SelectTrigger>
									<SelectContent className="max-h-72">
										{COUNTRY_CODES.map((c) => (
											<SelectItem key={c.value} value={c.value}>
												{c.label} ({c.value})
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<Input
									type="tel"
									inputMode="numeric"
									placeholder="1234567890"
									className={`flex-1 ${errors.phoneNumber ? "border-destructive" : ""}`}
									value={form.phoneNumber}
									onChange={(e) =>
										setForm((p) => ({
											...p,
											phoneNumber: e.target.value.replace(/\D/g, ""),
										}))
									}
								/>
							</div>
							{errors.phoneNumber && (
								<p className="text-xs text-destructive">{errors.phoneNumber}</p>
							)}
						</div>
						<div className="col-span-full space-y-1">
							<Label className="text-xs">Email *</Label>
							<Input
								type="email"
								value={form.email}
								onChange={(e) =>
									setForm((p) => ({ ...p, email: e.target.value }))
								}
								className={errors.email ? "border-destructive" : ""}
							/>
							{errors.email && (
								<p className="text-xs text-destructive">{errors.email}</p>
							)}
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={handleClose}>
							Cancel
						</Button>
						<LoadingButton isLoading={isSaving} onClick={handleSubmit}>
							{editingId ? "Save" : "Add"}
						</LoadingButton>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
