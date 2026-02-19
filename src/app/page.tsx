import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { Button } from "@/components/ui/button";

export default async function Home() {
	const session = await auth();

	// If user is logged in, redirect to their dashboard
	if (session?.user) {
		if (session.user.role === "ADMIN") {
			redirect("/admin");
		} else {
			redirect("/dashboard");
		}
	}

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
			<div className="text-center space-y-8 p-8">
				<div className="space-y-4">
					<h1 className="text-5xl font-bold text-gray-900">
						Welcome to Trip Manager
					</h1>
					<p className="text-xl text-gray-600 max-w-2xl mx-auto">
						Plan your perfect trip! Request customized travel packages and get
						personalized quotations from our team.
					</p>
				</div>

				<div className="space-y-4">
					<div className="flex gap-4 justify-center">
						<Link href="/auth/register">
							<Button size="lg" className="text-lg px-8">
								Get Started
							</Button>
						</Link>
						<Link href="/auth/signin">
							<Button size="lg" variant="outline" className="text-lg px-8">
								Sign In
							</Button>
						</Link>
					</div>
					<p className="text-sm text-gray-500">
						Create an account to start requesting trips
					</p>
				</div>

				<div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
					<div className="p-6 bg-white rounded-lg shadow-md">
						<div className="text-3xl mb-3">✈️</div>
						<h3 className="font-semibold text-lg mb-2">Request Trips</h3>
						<p className="text-gray-600 text-sm">
							Tell us your destination, dates, and preferences
						</p>
					</div>
					<div className="p-6 bg-white rounded-lg shadow-md">
						<div className="text-3xl mb-3">💰</div>
						<h3 className="font-semibold text-lg mb-2">Get Quotations</h3>
						<p className="text-gray-600 text-sm">
							Receive personalized quotes from our travel experts
						</p>
					</div>
					<div className="p-6 bg-white rounded-lg shadow-md">
						<div className="text-3xl mb-3">🎉</div>
						<h3 className="font-semibold text-lg mb-2">Book & Travel</h3>
						<p className="text-gray-600 text-sm">
							Accept your quote and start your adventure
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
