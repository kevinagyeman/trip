import Link from "next/link";

export default function RootNotFound() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
			<p className="text-9xl font-black tracking-tighter">404</p>
			<div className="space-y-2">
				<h1 className="text-3xl font-bold">Page Not Found</h1>
				<p className="text-muted-foreground">
					Oops! The page you&apos;re looking for has gone on a different trip.
				</p>
			</div>
			<Link
				href="/"
				className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
			>
				Back to Home
			</Link>
		</div>
	);
}
