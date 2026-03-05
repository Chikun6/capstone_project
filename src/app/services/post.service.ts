import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Post } from '../models/post.model';

@Injectable({ providedIn: 'root' })
export class PostService {
  private mockPosts: Post[] = [
    {
      id: '1',
      author: { handle: 'digitalprimate.bsky.social', displayName: 'Digital Primate', avatar: 'https://i.pravatar.cc/40?img=1' },
      text: 'Good morning from Haarlem. Beautiful day in the city! ☀️',
      hashtags: ['#GoodMorningFromHaarlem'],
      image: 'https://picsum.photos/seed/haarlem/600/300',
      likes: 245,
      reposts: 11,
      replies: 5,
      createdAt: new Date(Date.now() - 56 * 60 * 1000),
      liked: false,
      reposted: false
    },
    {
      id: '2',
      author: { handle: 'forbes.com', displayName: 'Forbes', avatar: 'https://i.pravatar.cc/40?img=2', verified: true },
      text: 'Philippine Tycoon Tony Tan Caktiong\'s Jollibee-Backed Highlands Coffee Mulls Vietnam IPO',
      image: 'https://picsum.photos/seed/forbes/600/300',
      likes: 89,
      reposts: 34,
      replies: 12,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      liked: false,
      reposted: false
    },
    {
      id: '3',
      author: { handle: 'techbuzz.bsky.social', displayName: 'Tech Buzz', avatar: 'https://i.pravatar.cc/40?img=3' },
      text: 'The future of decentralized social media is here. The AT Protocol is changing everything we know about how online communities work. 🦋',
      likes: 512,
      reposts: 203,
      replies: 47,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      liked: false,
      reposted: false
    },
    {
      id: '4',
      author: { handle: 'naturephotos.bsky.social', displayName: 'Nature Lens', avatar: 'https://i.pravatar.cc/40?img=4' },
      text: 'Captured this incredible sunrise over the mountains this morning. Nature never stops amazing me 🏔️',
      image: 'https://picsum.photos/seed/nature/600/300',
      likes: 1204,
      reposts: 456,
      replies: 89,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      liked: false,
      reposted: false
    }
  ];

  constructor(private http: HttpClient) {}

  getPosts(): Observable<Post[]> {
    return of(this.mockPosts);
  }

  createPost(text: string): Observable<Post> {
    const newPost: Post = {
      id: Date.now().toString(),
      author: { handle: 'you.bsky.social', displayName: 'You', avatar: '' },
      text,
      likes: 0,
      reposts: 0,
      replies: 0,
      createdAt: new Date(),
      liked: false,
      reposted: false
    };
    this.mockPosts.unshift(newPost);
    return of(newPost);
  }

  toggleLike(postId: string): void {
    const post = this.mockPosts.find(p => p.id === postId);
    if (post) {
      post.liked = !post.liked;
      post.likes += post.liked ? 1 : -1;
    }
  }

  toggleRepost(postId: string): void {
    const post = this.mockPosts.find(p => p.id === postId);
    if (post) {
      post.reposted = !post.reposted;
      post.reposts += post.reposted ? 1 : -1;
    }
  }
}
