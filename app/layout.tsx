import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { HistoryProvider } from "@/context/HistoryContext";
import { TrackerProvider } from "@/context/TrackerContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { WatchlistProvider } from "@/context/WatchlistContext";
import { RatingsProvider } from "@/context/RatingsContext";
import { ListsProvider } from "@/context/ListsContext";
import { RSSProvider } from "@/context/RSSContext";

const inter = Inter({
	subsets: ["latin"],
	weight: ["300", "400", "500", "600"],
	variable: "--font-inter",
	display: "swap",
});

const spaceGrotesk = Space_Grotesk({
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700"],
	variable: "--font-space-grotesk",
	display: "swap",
});

export const metadata: Metadata = {
	title: "MyMovies - Scopri film e serie TV",
	description: "Esplora migliaia di film e serie TV. Trova il contenuto perfetto per te.",
	appleWebApp: {
		capable: true,
		statusBarStyle: "black-translucent",
		title: "MyMovies",
	},
	icons: {
		icon: "/icon",
		apple: "/apple-icon",
	},
};

export const viewport: Viewport = {
	themeColor: "#050505",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="it" className={`${inter.variable} ${spaceGrotesk.variable} bg-black`}>
			<body className="antialiased bg-black text-white selection:bg-primary/30">
				<LanguageProvider>
					<AuthProvider>
						<HistoryProvider>
							<TrackerProvider>
								<FavoritesProvider>
									<WatchlistProvider>
										<ListsProvider>
											<RatingsProvider>
												<RSSProvider>
													<Navbar />
													{children}
												</RSSProvider>
											</RatingsProvider>
										</ListsProvider>
									</WatchlistProvider>
								</FavoritesProvider>
							</TrackerProvider>
						</HistoryProvider>
					</AuthProvider>
				</LanguageProvider>
			</body>
		</html>
	);
}
