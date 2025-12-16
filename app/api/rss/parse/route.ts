import { NextRequest, NextResponse } from 'next/server';

export interface RSSArticle {
	title: string;
	link: string;
	description: string;
	pubDate: string;
	author?: string;
	thumbnail?: string;
	content?: string;
}

/**
 * Parse RSS feed XML to JSON
 */
function parseRSSFeed(xml: string): RSSArticle[] {
	const articles: RSSArticle[] = [];

	try {
		// Parse items from RSS feed
		const itemRegex = /<item>([\s\S]*?)<\/item>/g;
		const items = xml.match(itemRegex);

		if (!items) return [];

		for (const item of items) {
			// Extract title
			const titleMatch = item.match(/<title>([\s\S]*?)<\/title>/);
			const title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/, '$1').trim() : '';

			// Extract link
			const linkMatch = item.match(/<link>([\s\S]*?)<\/link>/);
			const link = linkMatch ? linkMatch[1].trim() : '';

			// Extract description
			const descriptionMatch = item.match(/<description>([\s\S]*?)<\/description>/);
			let description = descriptionMatch ? descriptionMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/, '$1').trim() : '';

			// Remove HTML tags from description
			description = description.replace(/<[^>]*>/g, '').substring(0, 300);

			// Extract pubDate
			const pubDateMatch = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
			const pubDate = pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString();

			// Extract author (dc:creator or author tag)
			const creatorMatch = item.match(/<dc:creator>([\s\S]*?)<\/dc:creator>/) || item.match(/<author>([\s\S]*?)<\/author>/);
			const author = creatorMatch ? creatorMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/, '$1').trim() : undefined;

			// Extract thumbnail (media:thumbnail or enclosure)
			const thumbnailMatch = item.match(/<media:thumbnail url="([^"]+)"/) ||
			                       item.match(/<enclosure[^>]*url="([^"]+)"[^>]*type="image/);
			const thumbnail = thumbnailMatch ? thumbnailMatch[1] : undefined;

			// Extract content:encoded if available
			const contentMatch = item.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/);
			let content = contentMatch ? contentMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/, '$1').trim() : undefined;
			if (content) {
				content = content.replace(/<[^>]*>/g, '').substring(0, 500);
			}

			if (title && link) {
				articles.push({
					title,
					link,
					description: description || content || '',
					pubDate,
					author,
					thumbnail
				});
			}
		}
	} catch (error) {
		console.error('Error parsing RSS feed:', error);
	}

	return articles;
}

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const feedUrl = searchParams.get('url');

	if (!feedUrl) {
		return NextResponse.json(
			{ error: 'Feed URL is required' },
			{ status: 400 }
		);
	}

	try {
		// Fetch the RSS feed
		const response = await fetch(feedUrl, {
			headers: {
				'User-Agent': 'CineScope/1.0'
			},
			next: { revalidate: 300 } // Cache for 5 minutes
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);
		}

		const xml = await response.text();
		const articles = parseRSSFeed(xml);

		return NextResponse.json({
			success: true,
			articles,
			count: articles.length
		});
	} catch (error) {
		console.error('Error fetching RSS feed:', error);
		return NextResponse.json(
			{
				error: 'Failed to fetch or parse RSS feed',
				message: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
}
