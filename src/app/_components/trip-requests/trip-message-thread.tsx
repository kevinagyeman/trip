"use client";

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { enUS, it as itLocale } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { MessageSenderType } from "../../../../generated/prisma";

type Props =
	| { mode: "customer"; token: string }
	| { mode: "admin"; requestId: string };

export function TripMessageThread(props: Props) {
	const t = useTranslations("messages");
	const locale = useLocale();
	const dateFnsLocale = locale === "it" ? itLocale : enUS;
	const utils = api.useUtils();
	const [body, setBody] = useState("");
	const bottomRef = useRef<HTMLDivElement>(null);

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

	const handleSend = () => {
		if (!body.trim()) return;
		if (props.mode === "customer") {
			sendAsCustomer.mutate({ token: props.token, body: body.trim() });
		} else {
			sendAsAdmin.mutate({ requestId: props.requestId, body: body.trim() });
		}
	};

	// Scroll to bottom when messages change
	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages.data?.length]);

	const data = messages.data ?? [];

	return (
		<div className="space-y-4">
			<h3 className="text-lg font-semibold">{t("title")}</h3>

			{/* Message list */}
			<div className="max-h-96 overflow-y-auto space-y-3 rounded-lg border p-4 bg-muted/30">
				{data.length === 0 ? (
					<p className="text-center text-sm text-muted-foreground py-8">
						{t("noMessages")}
					</p>
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
									{isOwnMessage ? t("you") : msg.senderName} ·{" "}
									{format(new Date(msg.createdAt), "MMM d, HH:mm", {
										locale: dateFnsLocale,
									})}
								</p>
							</div>
						);
					})
				)}
				<div ref={bottomRef} />
			</div>

			{/* Compose */}
			<div className="flex gap-2">
				<Textarea
					value={body}
					onChange={(e) => setBody(e.target.value)}
					placeholder={t("placeholder")}
					rows={2}
					className="flex-1 resize-none"
					onKeyDown={(e) => {
						if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
							e.preventDefault();
							handleSend();
						}
					}}
				/>
				<Button
					onClick={handleSend}
					disabled={isPending || !body.trim()}
					className="self-end"
				>
					{isPending ? t("sending") : t("send")}
				</Button>
			</div>
		</div>
	);
}
