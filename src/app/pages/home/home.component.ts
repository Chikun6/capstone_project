import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { MediaService } from '../../services/media.service';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  posts: Post[] = [];
  activeTab = 'for_you';
  showNewPostModal = false;
  newPostText = '';
  postLoading = false;
  currentUser: any = null;
  currentUserAvatarUrl = '';
  charCount = 0;
  maxChars = 280;
  selectedMediaFile: File | null = null;
  selectedMediaPreview = '';
  postError = '';

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private userService: UserService,
    private mediaService: MediaService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }
    const userId = this.authService.currentUserId!;
    this.userService.getUserById(userId).subscribe(user => {
      this.currentUser = user;
      this.currentUserAvatarUrl = user?.profile_picture_url || `https://i.pravatar.cc/40?u=${user?.username}`;
    });
    this.loadPosts();
  }

  loadPosts() {
    this.postService.getAllPosts().subscribe(posts => this.posts = posts);
  }

  setTab(tab: string) {
    this.activeTab = tab;
    this.loadPosts();
  }

  openNewPost() { this.showNewPostModal = true; }
  closeNewPost() {
    this.showNewPostModal = false;
    this.newPostText = '';
    this.charCount = 0;
    this.selectedMediaFile = null;
    this.selectedMediaPreview = '';
    this.postError = '';
  }

  onTextChange() {
    this.charCount = this.newPostText.length;
  }

  onMediaPicked(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('File too large. Max 10MB.'); return; }
    this.selectedMediaFile = file;
    const reader = new FileReader();
    reader.onload = () => { this.selectedMediaPreview = reader.result as string; };
    reader.readAsDataURL(file);
  }

  removeMedia() {
    this.selectedMediaFile = null;
    this.selectedMediaPreview = '';
  }

  submitPost() {
    this.postError = '';
    if (!this.newPostText.trim()) { this.postError = 'Tweet cannot be empty.'; return; }
    if (this.newPostText.length > this.maxChars) { this.postError = 'Tweet exceeds 280 characters.'; return; }
    this.postLoading = true;
    const userId = this.authService.currentUserId!;

    const doCreate = (mediaIds: string[]) => {
      this.postService.createPost(this.newPostText, userId, mediaIds).subscribe({
        next: (post) => {
          this.posts.unshift(post);
          this.postLoading = false;
          this.closeNewPost();
        },
        error: () => {
          this.postLoading = false;
          this.postError = 'Failed to post. Please try again.';
        }
      });
    };

    if (this.selectedMediaFile) {
      const reader = new FileReader();
      reader.onload = () => {
        this.mediaService.uploadMedia({
          user_id: userId,
          tweet_id: null,
          media_name: this.selectedMediaFile!.name,
          media_type: this.selectedMediaFile!.type,
          media_url: reader.result as string,
          purpose: 'tweet_media'
        }).subscribe(media => {
          doCreate(media ? [media.id] : []);
        });
      };
      reader.readAsDataURL(this.selectedMediaFile);
    } else {
      doCreate([]);
    }
  }

  toggleLike(post: Post) {
    const userId = this.authService.currentUserId!;
    this.postService.likePost(post, userId).subscribe(updated => {
      post.liked = updated.liked;
      post.likes = updated.likes;
    });
  }

  toggleRepost(post: Post) {
    const userId = this.authService.currentUserId!;
    this.postService.repostTweet(post, userId).subscribe(updated => {
      post.reposted = updated.reposted;
      post.reposts = updated.reposts;
    });
  }

  deletePost(post: Post) {
    if (!confirm('Delete this tweet?')) return;
    this.postService.deletePost(post.id).subscribe(() => {
      this.posts = this.posts.filter(p => p.id !== post.id);
    });
  }

  goToUserProfile(post: Post) {
    if (post.author.id === this.currentUser?.id) {
      this.router.navigate(['/profile']);
    } else {
      this.router.navigate(['/user', post.author.handle]);
    }
  }

  goToTweet(post: Post) {
    this.router.navigate(['/tweet', post.id]);
  }

  formatCount(n: number): string {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return n?.toString() || '0';
  }

  get charCountColor(): string {
    if (this.charCount > 260) return 'text-danger';
    if (this.charCount > 230) return 'text-warning';
    return 'text-muted';
  }
}
