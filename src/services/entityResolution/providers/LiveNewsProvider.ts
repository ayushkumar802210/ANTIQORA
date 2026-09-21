import { PersonNewsItem } from '../types';

export class LiveNewsProvider {
  name = 'Real-time Live News Provider';

  /**
   * Fetches real-time news articles regarding the specified person
   */
  async getPersonNews(personName: string): Promise<PersonNewsItem[]> {
    const newsItems: PersonNewsItem[] = [];

    try {
      // 1. Fetch Google News RSS directly (Absolute URL, works in Node and Browser)
      const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(personName)}&hl=en-IN&gl=IN&ceid=IN:en`;
      const rssRes = await fetch(rssUrl);
      if (rssRes.ok) {
        const xmlText = await rssRes.text();
        const itemMatches = xmlText.matchAll(/<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<pubDate>(.*?)<\/pubDate>[\s\S]*?<\/item>/g);
        
        let count = 0;
        for (const match of itemMatches) {
          if (count >= 5) break;
          const rawTitle = match[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')?.replace(/&amp;/g, '&')?.trim();
          const rawLink = match[2]?.trim();
          const rawDate = match[3]?.trim();

          if (rawTitle && rawLink) {
            const parts = rawTitle.split(' - ');
            const publisher = parts.length > 1 ? parts.pop()! : 'News Outlet';
            const headline = parts.join(' - ');

            newsItems.push({
              id: `news-rss-${count}`,
              headline,
              publisher,
              date: rawDate ? new Date(rawDate).toLocaleDateString() : 'Today',
              snippet: `Verified news report regarding ${personName}.`,
              url: rawLink,
              categoryTag: 'news'
            });
            count++;
          }
        }

        if (newsItems.length > 0) {
          return newsItems;
        }
      }

      // 2. Fallback to API Endpoint with absolute URL check for Node
      const newsEndpoint = typeof window !== 'undefined'
        ? `/api/news?category=all&q=${encodeURIComponent(personName)}`
        : `http://localhost:3000/api/news?category=all&q=${encodeURIComponent(personName)}`;

      const res = await fetch(newsEndpoint);
      if (res.ok) {
        const data = await res.json();
        if (data?.results && Array.isArray(data.results) && data.results.length > 0) {
          data.results.slice(0, 6).forEach((item: any, idx: number) => {
            newsItems.push({
              id: `news-p-${idx}-${Date.now()}`,
              headline: item.title,
              publisher: item.source || 'Verified Publisher',
              date: item.date || 'Just now',
              snippet: item.summary || item.snippet || `Latest developments regarding ${personName}.`,
              url: item.url,
              categoryTag: 'news'
            });
          });
        }
      }

    } catch (err) {
      console.warn("LiveNewsProvider error:", err);
    }

    return newsItems;
  }
}
