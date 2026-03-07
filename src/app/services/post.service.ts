import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Post } from '../models/post.model';

@Injectable({ providedIn: 'root' })
export class PostService {
  private mockPosts: Post[] = [
    {
      id: '1', text: 'Captured this incredible sunrise over the mountains this morning. Nature never stops amazing me 🏔️',
      hashtags: ['#NaturePhotography'],
      likes: 1200, reposts: 456, replies: 89, liked: false, reposted: false,
      createdAt: '3h',
      author: { displayName: 'Nature Lens', handle: 'naturephotos.bsky.social', verified: true }
    },
    {
      id: '2', text: 'Good morning from Haarlem. Beautiful day in the city! 🌞',
      hashtags: ['#GoodMorningFromHaarlem'],
      likes: 245, reposts: 11, replies: 5, liked: false, reposted: false,
      createdAt: '56m',
      author: { displayName: 'Digital Primate', handle: 'digitalprimate.bsky.social' }
    },
    {
      id: '3', text: 'Big news in AI today — new models dropping left and right. The space is moving so fast 🚀',
      hashtags: ['#AI', '#Tech'],
      likes: 890, reposts: 234, replies: 67, liked: false, reposted: false,
      createdAt: '1h',
      author: { displayName: 'Tech Daily', handle: 'techdaily.bsky.social', verified: true }
    },
    {
      id: '4', text: 'Six Nations update: Ireland leading in an absolute thriller of a match! 🏉',
      hashtags: ['#SixNations', '#Rugby'],
      likes: 3400, reposts: 812, replies: 204, liked: false, reposted: false,
      createdAt: '30m',
      author: { displayName: 'Sports Hub', handle: 'sportshub.bsky.social' }
    },
  ];

  getPosts(): Observable<Post[]> {
    return of(this.mockPosts);
  }

  createPost(text: string): Observable<Post> {
    const newPost: Post = {
      id: Date.now().toString(),
      text,
      likes: 0, reposts: 0, replies: 0,
      liked: false, reposted: false,
      createdAt: 'Just now',
      author: { displayName: 'You', handle: 'yourhandle.bsky.social' }
    };
    this.mockPosts.unshift(newPost);
    return of(newPost);
  }
}
