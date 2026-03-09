import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-tweet-detail',
  templateUrl: './tweet.component.html',
  styleUrls: ['./tweet.component.css']
})
export class TweetComponent implements OnInit {
  tweetId = '';
  tweet: Post | null = null;
  replies: Post[] = [];
  replyText = '';
  replyLoading = false;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    private authService: AuthService
  ) {}

  get currentUserId(): string { return this.authService.currentUserId || '1'; }

  ngOnInit() {
    this.tweetId = this.route.snapshot.params['id'];
    this.loadTweet();
  }

  loadTweet() {
    this.loading = true;
    this.postService.getTweetById(this.tweetId).subscribe(tweet => {
      this.tweet = tweet;
      this.loading = false;
      this.loadReplies();
    });
  }

  loadReplies() {
    this.postService.getRepliesByTweet(this.tweetId).subscribe(replies => {
      this.replies = replies;
    });
  }

  goBack() { this.router.navigate(['/home']); }

  toggleLike() {
    if (!this.tweet) return;
    this.postService.likePost(this.tweet, this.currentUserId).subscribe(updated => {
      this.tweet!.liked = updated.liked;
      this.tweet!.likes = updated.likes;
    });
  }

  toggleRepost() {
    if (!this.tweet) return;
    const uid = this.authService.currentUserId!;
    this.postService.repostTweet(this.tweet, uid).subscribe(updated => {
      this.tweet!.reposted = updated.reposted;
      this.tweet!.reposts = updated.reposts;
    });
  }

  toggleReplyLike(reply: Post) {
    this.postService.likePost(reply, this.currentUserId).subscribe(updated => {
      reply.liked = updated.liked;
      reply.likes = updated.likes;
    });
  }

  submitReply() {
    if (!this.replyText.trim()) return;
    this.replyLoading = true;
    // Create reply tweet with parent_id set
    const payload = {
      user_id: this.currentUserId,
      parent_id: this.tweetId,
      content: this.replyText,
      likes_count: 0,
      retweets_count: 0,
      replies_count: 0,
      liked: false,
      reposted: false,
      media_ids: [],
      scheduled_time: null,
      created_at: new Date().toISOString()
    };
    // Post to json-server then reload replies
    const http = (this as any).http;
    import('@angular/common/http').then(() => {
      // Use PostService createPost (which sets parent_id null) - so we manually patch
      // We need to use http directly via a workaround through postService
    });

    // Actually use the service internal method via HTTP
    fetch('http://localhost:3000/tweets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(() => {
      this.replyLoading = false;
      this.replyText = '';
      if (this.tweet) this.tweet.replies++;
      this.loadReplies();
    }).catch(() => {
      this.replyLoading = false;
    });
  }

  formatCount(n: number): string {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return n?.toString() || '0';
  }
}
