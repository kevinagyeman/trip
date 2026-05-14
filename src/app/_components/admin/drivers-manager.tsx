"use client";

import { LoadingButton } from "@/app/_components/ui/loading-button";
import { SectionCard } from "@/app/_components/ui/section-card";
import { Button } from "@/components/ui/button";
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
import { driverSchema, type DriverFormValues } from "@/lib/schemas/driver";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

const defaultValues: DriverFormValues = {
	name: "",
	surname: "",
	phoneCountryCode: "+39",
	phoneNumber: "",
	email: "",
};

export function DriversManager() {
	const t = useTranslations("drivers");
	const utils = api.useUtils();
	const { data: drivers = [], isLoading } = api.driver.getAll.useQuery();

	const [open, setOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		control,
		reset,
		formState: { errors },
	} = useForm<DriverFormValues>({
		resolver: zodResolver(driverSchema),
		defaultValues,
	});

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
		reset(defaultValues);
	}

	function openCreate() {
		reset(defaultValues);
		setEditingId(null);
		setOpen(true);
	}

	function openEdit(d: (typeof drivers)[0]) {
		const match = d.phone.match(/^(\+\d+)\s(.+)$/);
		reset({
			name: d.name,
			surname: d.surname,
			phoneCountryCode: match?.[1] ?? "+39",
			phoneNumber: match?.[2] ?? d.phone,
			email: d.email,
		});
		setEditingId(d.id);
		setOpen(true);
	}

	function onSubmit(values: DriverFormValues) {
		const phone = `${values.phoneCountryCode} ${values.phoneNumber}`;
		const payload = {
			name: values.name,
			surname: values.surname,
			phone,
			email: values.email,
		};
		if (editingId) {
			updateDriver.mutate({ id: editingId, ...payload });
		} else {
			createDriver.mutate(payload);
		}
	}

	const isSaving = createDriver.isPending || updateDriver.isPending;

	return (
		<SectionCard title={t("title")} subtitle={t("subtitle")}>
			<Button onClick={openCreate} size="sm" className="mb-4">
				<Plus className="h-4 w-4" />
				{t("addDriver")}
			</Button>

			{isLoading && (
				<div className="flex justify-center py-4">
					<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
				</div>
			)}

			{!isLoading && drivers.length === 0 && (
				<SectionCard contentClassName="py-8 text-center text-sm text-muted-foreground">
					{t("noDrivers")}
				</SectionCard>
			)}

			<div className="space-y-2">
				{drivers.map((d) => (
					<div
						className="border rounded-lg p-4 flex items-center justify-between gap-4"
						key={d.id}
					>
						<div>
							<p className="font-semibold">{`${d.name} ${d.surname}`}</p>
							<p className="text-muted-foreground text-sm">{d.phone}</p>
							<p className="text-muted-foreground text-sm">{d.email}</p>
						</div>
						<div className="mt-2 flex gap-1">
							<Button size="icon" variant="ghost" onClick={() => openEdit(d)}>
								<Pencil className="h-4 w-4" />
							</Button>
							<Button
								size="icon"
								variant="ghost"
								className="text-destructive hover:text-destructive"
								onClick={() => deleteDriver.mutate({ id: d.id })}
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>
					</div>
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
							{editingId ? t("editDriver") : t("addDriver")}
						</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleSubmit(onSubmit)}>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
							<div className="space-y-1">
								<Label className="text-xs">{t("name")}</Label>
								<Input
									{...register("name")}
									className={errors.name ? "border-destructive" : ""}
								/>
								{errors.name && (
									<p className="text-xs text-destructive">
										{errors.name.message}
									</p>
								)}
							</div>
							<div className="space-y-1">
								<Label className="text-xs">{t("surname")}</Label>
								<Input
									{...register("surname")}
									className={errors.surname ? "border-destructive" : ""}
								/>
								{errors.surname && (
									<p className="text-xs text-destructive">
										{errors.surname.message}
									</p>
								)}
							</div>
							<div className="col-span-full space-y-1">
								<Label className="text-xs">{t("phone")}</Label>
								<div className="flex gap-2">
									<Controller
										name="phoneCountryCode"
										control={control}
										render={({ field }) => (
											<Select
												value={field.value}
												onValueChange={field.onChange}
											>
												<SelectTrigger className="w-[110px] shrink-0">
													<SelectValue>
														{(() => {
															const country = COUNTRY_CODES.find(
																(c) => c.value === field.value,
															);
															const flag = country?.label.split(" ")[0] ?? "";
															return `${flag} ${field.value}`;
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
										)}
									/>
									<Input
										type="tel"
										inputMode="numeric"
										placeholder="1234567890"
										className={`flex-1 ${errors.phoneNumber ? "border-destructive" : ""}`}
										{...register("phoneNumber", {
											onChange: (e) => {
												e.target.value = e.target.value.replace(/\D/g, "");
											},
										})}
									/>
								</div>
								{errors.phoneNumber && (
									<p className="text-xs text-destructive">
										{errors.phoneNumber.message}
									</p>
								)}
							</div>
							<div className="col-span-full space-y-1">
								<Label className="text-xs">{t("email")}</Label>
								<Input
									type="email"
									{...register("email")}
									className={errors.email ? "border-destructive" : ""}
								/>
								{errors.email && (
									<p className="text-xs text-destructive">
										{errors.email.message}
									</p>
								)}
							</div>
						</div>
						<DialogFooter className="mt-4">
							<Button type="button" variant="outline" onClick={handleClose}>
								{t("cancel")}
							</Button>
							<LoadingButton type="submit" isLoading={isSaving}>
								{editingId ? t("save") : t("add")}
							</LoadingButton>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</SectionCard>
	);
}
