import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, forkJoin, switchMap } from 'rxjs';
import { Post } from '../models/post.model';
import { MediaService } from './media.service';

interface RawTweet {
  id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  likes_count: number;
  retweets_count: number;
  replies_count: number;
  liked: boolean;
  reposted: boolean;
  media_ids: string[];
  scheduled_time: string | null;
  created_at: string;
}

interface RawUser {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  profile_picture_id: string | null;
  profile_picture_url?: string;
}

@Injectable({ providedIn: 'root' })
export class PostService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient, private mediaService: MediaService) {}

  timeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  }

  /** Resolve a tweet's author and media, build Post object */
  private hydrateTweet(tweet: RawTweet): Observable<Post> {
    return forkJoin({
      author: this.http.get<RawUser>(`${this.baseUrl}/users/${tweet.user_id}`).pipe(
        catchError(() => of({ id: tweet.user_id, first_name: 'Unknown', last_name: '', username: 'unknown', profile_picture_id: null } as RawUser))
      ),
      media: tweet.media_ids && tweet.media_ids.length > 0
        ? forkJoin(tweet.media_ids.map(mid => this.mediaService.getMediaById(mid)))
        : of([])
    }).pipe(
      switchMap(({ author, media }) =>
        this.mediaService.getMediaUrl(author.profile_picture_id).pipe(
          map(avatarUrl => {
            const mediaItems = (media as any[]).filter(Boolean);
            return {
              id: tweet.id,
              text: tweet.content,
              hashtags: (tweet.content || '').match(/#\w+/g) || [],
              likes: tweet.likes_count ?? 0,
              reposts: tweet.retweets_count ?? 0,
              replies: tweet.replies_count ?? 0,
              liked: tweet.liked ?? false,
              reposted: tweet.reposted ?? false,
              createdAt: tweet.created_at ? this.timeAgo(tweet.created_at) : 'now',
              createdAtRaw: tweet.created_at,
              parentId: tweet.parent_id,
              mediaUrls: mediaItems.map((m: any) => m?.media_url).filter(Boolean),
              author: {
                id: author.id,
                displayName: `${author.first_name} ${author.last_name}`.trim(),
                handle: author.username,
                avatar: avatarUrl || `https://i.pravatar.cc/40?u=${author.username}`,
                verified: false
              }
            } as Post;
          })
        )
      )
    );
  }

  getAllPosts(): Observable<Post[]> {
    return this.http.get<RawTweet[]>(`${this.baseUrl}/tweets`).pipe(
      switchMap(tweets => {
        const topLevel = tweets.filter(t => !t.parent_id);
        if (!topLevel.length) return of([]);
        return forkJoin(topLevel.map(t => this.hydrateTweet(t)));
      }),
      map(posts => posts.sort((a: any, b: any) =>
        new Date(b.createdAtRaw || 0).getTime() - new Date(a.createdAtRaw || 0).getTime()
      )),
      catchError(() => of([]))
    );
  }

  getPostsByUser(userId: string): Observable<Post[]> {
    return this.http.get<RawTweet[]>(`${this.baseUrl}/tweets?user_id=${userId}`).pipe(
      switchMap(tweets => {
        if (!tweets.length) return of([]);
        return forkJoin(tweets.map(t => this.hydrateTweet(t)));
      }),
      map(posts => posts.sort((a: any, b: any) =>
        new Date(b.createdAtRaw || 0).getTime() - new Date(a.createdAtRaw || 0).getTime()
      )),
      catchError(() => of([]))
    );
  }

  getRepliesByTweet(tweetId: string): Observable<Post[]> {
    return this.http.get<RawTweet[]>(`${this.baseUrl}/tweets?parent_id=${tweetId}`).pipe(
      switchMap(tweets => {
        if (!tweets.length) return of([]);
        return forkJoin(tweets.map(t => this.hydrateTweet(t)));
      }),
      catchError(() => of([]))
    );
  }

  getTweetById(tweetId: string): Observable<Post | null> {
    return this.http.get<RawTweet>(`${this.baseUrl}/tweets/${tweetId}`).pipe(
      switchMap(tweet => this.hydrateTweet(tweet)),
      catchError(() => of(null))
    );
  }

  searchTweets(query: string): Observable<Post[]> {
    return this.getAllPosts().pipe(
      map(posts => {
        const q = query.toLowerCase();
        return posts.filter(p =>
          p.text.toLowerCase().includes(q) ||
          p.author.handle.toLowerCase().includes(q) ||
          p.author.displayName.toLowerCase().includes(q)
        );
      }),
      catchError(() => of([]))
    );
  }

  createPost(text: string, userId: string, mediaIds: string[] = []): Observable<Post> {
    const payload: Partial<RawTweet> = {
      user_id: userId,
      parent_id: null,
      content: text,
      likes_count: 0,
      retweets_count: 0,
      replies_count: 0,
      liked: false,
      reposted: false,
      media_ids: mediaIds,
      scheduled_time: null,
      created_at: new Date().toISOString()
    };
    return this.http.post<RawTweet>(`${this.baseUrl}/tweets`, payload).pipe(
      switchMap(tweet => {
        // Update tweet_id on all uploaded media records so they are linked
        if (mediaIds.length > 0) {
          const updates = mediaIds.map(mid =>
            this.http.patch(`${this.baseUrl}/media/${mid}`, { tweet_id: tweet.id }).pipe(catchError(() => of(null)))
          );
          return forkJoin(updates).pipe(switchMap(() => this.hydrateTweet(tweet)));
        }
        return this.hydrateTweet(tweet);
      }),
      catchError(err => { throw err; })
    );
  }

  likePost(post: Post, userId: string): Observable<Post> {
    const newLiked = !post.liked;
    const newLikes = newLiked ? post.likes + 1 : Math.max(0, post.likes - 1);

    const likeAction$ = newLiked
      ? this.http.post(`${this.baseUrl}/likes`, { user_id: userId, tweet_id: post.id, created_at: new Date().toISOString() })
      : this.http.get<any[]>(`${this.baseUrl}/likes?user_id=${userId}&tweet_id=${post.id}`).pipe(
          switchMap(records => records.length > 0
            ? this.http.delete(`${this.baseUrl}/likes/${records[0].id}`)
            : of(null)
          )
        );

    return forkJoin([
      this.http.patch(`${this.baseUrl}/tweets/${post.id}`, { liked: newLiked, likes_count: newLikes }),
      likeAction$
    ]).pipe(
      map(() => ({ ...post, liked: newLiked, likes: newLikes })),
      catchError(() => of({ ...post, liked: newLiked, likes: newLikes }))
    );
  }

  repostTweet(post: Post, userId: string): Observable<Post> {
    const newReposted = !post.reposted;
    const newReposts = newReposted ? post.reposts + 1 : Math.max(0, post.reposts - 1);

    // Track repost in a retweets table per user
    const repostAction$ = newReposted
      ? this.http.post(`${this.baseUrl}/retweets`, { user_id: userId, tweet_id: post.id, created_at: new Date().toISOString() }).pipe(catchError(() => of(null)))
      : this.http.get<any[]>(`${this.baseUrl}/retweets?user_id=${userId}&tweet_id=${post.id}`).pipe(
          switchMap(records => records.length > 0
            ? this.http.delete(`${this.baseUrl}/retweets/${records[0].id}`).pipe(catchError(() => of(null)))
            : of(null)
          )
        );

    return forkJoin([
      this.http.patch<RawTweet>(`${this.baseUrl}/tweets/${post.id}`, {
        reposted: newReposted,
        retweets_count: newReposts
      }),
      repostAction$
    ]).pipe(
      map(() => ({ ...post, reposted: newReposted, reposts: newReposts })),
      catchError(() => of({ ...post, reposted: newReposted, reposts: newReposts }))
    );
  }

  deletePost(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/tweets/${id}`).pipe(
      catchError(() => of(void 0))
    );
  }

  getUserLikedTweets(userId: string): Observable<Post[]> {
    return this.http.get<any[]>(`${this.baseUrl}/likes?user_id=${userId}`).pipe(
      switchMap(likes => {
        if (!likes.length) return of([]);
        return forkJoin(likes.map((l: any) => this.getTweetById(l.tweet_id)));
      }),
      map(posts => posts.filter(Boolean) as Post[]),
      catchError(() => of([]))
    );
  }

  getUserRetweetedPosts(userId: string): Observable<Post[]> {
    return this.http.get<any[]>(`${this.baseUrl}/retweets?user_id=${userId}`).pipe(
      switchMap(retweets => {
        if (!retweets.length) return of([]);
        return forkJoin(retweets.map((r: any) => this.getTweetById(r.tweet_id)));
      }),
      map(posts => posts.filter(Boolean) as Post[]),
      catchError(() => of([]))
    );
  }
}
