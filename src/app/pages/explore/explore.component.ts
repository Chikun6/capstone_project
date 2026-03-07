import { Component } from '@angular/core';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css']
})
export class ExploreComponent {
  searchQuery = '';
  activeFilter = 'top';

  trendingTopics = [
    { rank: 1, title: 'F This Movie Fest', category: 'Entertainment', badge: 'Hot', posts: '12.4k' },
    { rank: 2, title: 'Six Nations', category: 'Sports', badge: 'New', posts: '8.1k' },
    { rank: 3, title: 'Caturday', category: 'Animals', badge: '', posts: '5.6k' },
    { rank: 4, title: 'Arsenal', category: 'Sports', badge: '', posts: '4.9k' },
    { rank: 5, title: 'F1 Qualifying', category: 'Sports', badge: '', posts: '3.2k' },
    { rank: 6, title: 'World Book Day', category: 'Education', badge: 'New', posts: '2.8k' },
    { rank: 7, title: 'Hammer Films', category: 'Entertainment', badge: '', posts: '1.9k' },
    { rank: 8, title: 'Kelsey Plum', category: 'Sports', badge: '', posts: '1.4k' },
  ];

  feeds = [
    { name: 'Science', handle: 'bossett.social', desc: 'Curated feed from professional scientists and science communicators.', likes: '29.2k', icon: '🔬' },
    { name: 'SciArt', handle: 'flyingtrilobite.com', desc: 'The intersection of art and science — illustration, wildlife art, paleoart.', likes: '18.5k', icon: '🎨' },
    { name: 'Tech News', handle: 'technews.bsky', desc: 'Latest in technology, AI, software and startups.', likes: '41.0k', icon: '💻' },
    { name: 'Photography', handle: 'photofeed.social', desc: 'Beautiful photography from around the world.', likes: '22.3k', icon: '📸' },
  ];

  mockResults = [
    { author: 'Nature Lens', handle: 'naturephotos.bsky.social', time: '3h', text: 'Captured this incredible sunrise over the mountains this morning. Nature never stops amazing me 🏔️', likes: 1200, reposts: 456 },
    { author: 'Tech Daily', handle: 'techdaily.bsky.social', time: '1h', text: 'Big news in AI today — new models dropping left and right. The space is moving so fast 🚀 #AI #Tech', likes: 890, reposts: 234 },
    { author: 'Sports Hub', handle: 'sportshub.bsky.social', time: '30m', text: 'Six Nations update: Ireland leading in an absolute thriller of a match! #SixNations', likes: 3400, reposts: 812 },
  ];

  get filteredResults() {
    if (!this.searchQuery) return this.mockResults;
    return this.mockResults.filter(r =>
      r.text.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      r.author.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  setFilter(f: string) { this.activeFilter = f; }
}
