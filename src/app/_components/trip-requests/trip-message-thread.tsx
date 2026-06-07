"use client";

import { LoadingButton } from "@/app/_components/ui/loading-button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { formatDateTime } from "@/lib/utils";
import { ArrowRight, MessagesSquare } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { MessageSenderType } from "../../../../generated/prisma";

type Props =
	| {
			mode: "customer";
			token: string;
			prefillMessage?: string;
			prefillTrigger?: number;
			disabled?: boolean;
	  }
	| {
			mode: "admin";
			requestId: string;
			prefillMessage?: string;
			prefillTrigger?: number;
			disabled?: boolean;
	  };

export function TripMessageThread(props: Props) {
	const t = useTranslations("messages");
	const utils = api.useUtils();
	const [body, setBody] = useState("");
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const token = props.mode === "customer" ? props.token : "";
	const requestId = props.mode === "admin" ? props.requestId : "";

	const byToken = api.tripMessage.getByToken.useQuery(
		{ token },
		{ enabled: props.mode === "customer", refetchInterval: 15000 },
	);
	const byRequestId = api.tripMessage.getByRequestId.useQuery(
		{ requestId },
		{ enabled: props.mode === "admin", refetchInterval: 15000 },
	);
	const messages = props.mode === "customer" ? byToken : byRequestId;

	const sendAsCustomer = api.tripMessage.sendAsCustomer.useMutation({
		onSuccess: async () => {
			setBody("");
			if (props.mode === "customer") {
				await utils.tripMessage.getByToken.invalidate({ token: props.token });
			}
		},
	});

	const sendAsAdmin = api.tripMessage.sendAsAdmin.useMutation({
		onSuccess: async () => {
			setBody("");
			if (props.mode === "admin") {
				await utils.tripMessage.getByRequestId.invalidate({
					requestId: props.requestId,
				});
			}
		},
	});

	const isPending = sendAsCustomer.isPending || sendAsAdmin.isPending;
	const disabled = "disabled" in props ? props.disabled : false;

	const handleSend = () => {
		if (!body.trim()) return;
		if (props.mode === "customer") {
			sendAsCustomer.mutate({ token: props.token, body: body.trim() });
		} else {
			sendAsAdmin.mutate({ requestId: props.requestId, body: body.trim() });
		}
	};

	// Prefill textarea when requested
	useEffect(() => {
		if (props.prefillMessage) {
			setBody(props.prefillMessage);
			textareaRef.current?.focus();
		}
	}, [props.prefillTrigger]);

	const data = messages.data ?? [];

	return (
		<div className="space-y-4">
			{/* Message list */}
			<div className="max-h-96 overflow-y-auto space-y-3 rounded-lg border p-4 bg-muted/30">
				{data.length === 0 ? (
					<div className="flex h-full min-h-28 items-center justify-center">
						<MessagesSquare
							className="h-12 w-12       
  text-muted-foreground"
						/>
					</div>
				) : (
					data.map((msg) => {
						const isOwnMessage =
							(props.mode === "customer" &&
								msg.senderType === MessageSenderType.CUSTOMER) ||
							(props.mode === "admin" &&
								msg.senderType === MessageSenderType.ADMIN);

						return (
							<div
								key={msg.id}
								className={cn(
									"flex flex-col max-w-[80%]",
									isOwnMessage ? "ml-auto items-end" : "items-start",
								)}
							>
								<div
									className={cn(
										"rounded-2xl px-4 py-2 text-sm",
										isOwnMessage
											? "bg-primary text-primary-foreground rounded-br-sm"
											: "bg-background border rounded-bl-sm",
									)}
								>
									<p className="whitespace-pre-wrap">{msg.body}</p>
								</div>
								<p className="mt-1 text-xs text-muted-foreground">
									{formatDateTime(msg.createdAt)}
								</p>
							</div>
						);
					})
				)}
			</div>

			{/* Compose */}
			{!disabled && (
				<div className="flex items-end gap-2">
					<Textarea
						ref={textareaRef}
						value={body}
						onChange={(e) => setBody(e.target.value)}
						rows={1}
						className="flex-1 resize-none min-h-9"
						placeholder={t("inputPlaceholder")}
						onKeyDown={(e) => {
							if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
								e.preventDefault();
								handleSend();
							}
						}}
					/>
					<LoadingButton
						onClick={handleSend}
						isLoading={isPending}
						disabled={!body.trim()}
						variant={"default"}
					>
						<ArrowRight className="h-4 w-4" />
					</LoadingButton>
				</div>
			)}
		</div>
	);
}
