import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { Post } from '../../models/post.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomePageComponent implements OnInit {
  posts: Post[] = [];
  currentUser: User | null = null;
  activeTab: 'discover' | 'following' | 'video' = 'discover';
  showNewPostModal = false;
  newPostText = '';
  postLoading = false;

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.currentUser;
    this.loadPosts();
  }

  loadPosts() {
    this.postService.getPosts().subscribe(posts => this.posts = posts);
  }

  setTab(tab: 'discover' | 'following' | 'video') { this.activeTab = tab; }

  toggleLike(post: Post) { this.postService.toggleLike(post.id); }
  toggleRepost(post: Post) { this.postService.toggleRepost(post.id); }

  openNewPost() { this.showNewPostModal = true; }
  closeNewPost() { this.showNewPostModal = false; this.newPostText = ''; }

  submitPost() {
    if (!this.newPostText.trim()) return;
    this.postLoading = true;
    this.postService.createPost(this.newPostText).subscribe(post => {
      this.posts.unshift(post);
      this.postLoading = false;
      this.closeNewPost();
    });
  }

  getTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  }

  formatCount(n: number): string {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return n.toString();
  }
}
