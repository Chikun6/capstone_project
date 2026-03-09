import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService, User } from '../../services/user.service';
import { PostService } from '../../services/post.service';
import { FollowService } from '../../services/follow.service';
import { AuthService } from '../../services/auth.service';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;
  posts: Post[] = [];
  isFollowing = false;
  activeTab = 'posts';
  loading = true;
  followersCount = 0;
  followingCount = 0;
  mediaUrls: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private postService: PostService,
    private followService: FollowService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.loadUser(params['username']);
    });
  }

  get currentUserId(): string {
    return this.authService.currentUserId || '1';
  }

  get isOwnProfile(): boolean {
    return this.user?.id === this.currentUserId;
  }

  loadUser(username: string) {
    this.loading = true;
    this.userService.getUserByUsername(username).subscribe(user => {
      this.user = user;
      this.loading = false;
      if (user) {
        this.postService.getPostsByUser(user.id).subscribe(posts => {
          this.posts = posts;
          this.mediaUrls = posts.flatMap(p => p.mediaUrls || []);
        });
        this.followService.isFollowing(this.currentUserId, user.id).subscribe(result => {
          this.isFollowing = result;
        });
        this.followService.getFollowers(user.id).subscribe(f => this.followersCount = f.length);
        this.followService.getFollowing(user.id).subscribe(f => this.followingCount = f.length);
      }
    });
  }

  toggleFollow() {
    if (!this.user) return;
    this.followService.toggleFollow(this.currentUserId, this.user.id, this.isFollowing).subscribe(result => {
      this.isFollowing = result;
      if (result) this.followersCount++; else this.followersCount--;
    });
  }

  toggleLike(post: Post) {
    this.postService.likePost(post, this.currentUserId).subscribe(updated => {
      post.liked = updated.liked;
      post.likes = updated.likes;
    });
  }

  goBack() { this.router.navigate(['/home']); }
  setTab(tab: string) { this.activeTab = tab; }
  goToTweet(post: Post) { this.router.navigate(['/tweet', post.id]); }

  formatCount(n: number): string {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return n?.toString() || '0';
  }
}
