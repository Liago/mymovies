import type { Metadata } from "next";
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

export const metadata: Metadata = {
	title: "MyMovies - Scopri film e serie TV",
	description: "Esplora migliaia di film e serie TV. Trova il contenuto perfetto per te.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="it">
			<body className="antialiased font-inter bg-black text-white selection:bg-primary/30">
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
