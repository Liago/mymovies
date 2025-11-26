import SearchBar from '@/components/SearchBar';

export default function Home() {
	return (
		<main className="main-container">
			<div className="content-wrapper">
				<div className="header-section">
					<h1 className="main-title">
						<span className="gradient-text">Movie</span> Search
					</h1>
					<p className="subtitle">
						Discover your next favorite movie or TV series
					</p>
				</div>

				<SearchBar />

				<div className="features-grid">
					<div className="feature-card">
						<div className="feature-icon">🎬</div>
						<h3>Movies</h3>
						<p>Search through thousands of movies</p>
					</div>
					<div className="feature-card">
						<div className="feature-icon">📺</div>
						<h3>TV Series</h3>
						<p>Find your favorite shows</p>
					</div>
					<div className="feature-card">
						<div className="feature-icon">⚡</div>
						<h3>Fast Results</h3>
						<p>Instant search with relevance scores</p>
					</div>
				</div>
			</div>

			<div className="background-decoration">
				<div className="gradient-orb orb-1" />
				<div className="gradient-orb orb-2" />
				<div className="gradient-orb orb-3" />
			</div>
		</main>
	);
}
