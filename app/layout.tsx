import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Figtree } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import MobileTabBar from "@/components/MobileTabBar";
import ThemeProvider from "@/components/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { HistoryProvider } from "@/context/HistoryContext";
import { TrackerProvider } from "@/context/TrackerContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { WatchlistProvider } from "@/context/WatchlistContext";
import { RatingsProvider } from "@/context/RatingsContext";
import { ListsProvider } from "@/context/ListsContext";
import { RSSProvider } from "@/context/RSSContext";

const figtree = Figtree({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700", "800"],
	variable: "--font-figtree",
	display: "swap",
});

export const metadata: Metadata = {
	title: "CineScope - Scopri film e serie TV",
	description: "Trova subito cosa guardare, segui le tue serie e scopri dove vedere film e serie TV.",
	appleWebApp: {
		capable: true,
		statusBarStyle: "black-translucent",
		title: "CineScope",
	},
	icons: {
		icon: "/icon",
		apple: "/apple-icon",
	},
};

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#f5f5f3" },
		{ media: "(prefers-color-scheme: dark)", color: "#0e0e10" },
	],
	viewportFit: "cover",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="it" className={figtree.variable} suppressHydrationWarning>
			<body className="antialiased bg-bg text-fg">
				<ThemeProvider>
					<LanguageProvider>
						<AuthProvider>
							<HistoryProvider>
								<TrackerProvider>
									<FavoritesProvider>
										<WatchlistProvider>
											<ListsProvider>
												<RatingsProvider>
													<RSSProvider>
														<Suspense fallback={null}>
															<Navbar />
														</Suspense>
														{children}
														<MobileTabBar />
													</RSSProvider>
												</RatingsProvider>
											</ListsProvider>
										</WatchlistProvider>
									</FavoritesProvider>
								</TrackerProvider>
							</HistoryProvider>
						</AuthProvider>
					</LanguageProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
