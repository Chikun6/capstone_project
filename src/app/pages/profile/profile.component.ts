import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfilePageComponent {
  activeTab: 'posts' | 'replies' | 'media' | 'likes' = 'posts';

  profile = {
    displayName: 'Your Name',
    handle: 'yourhandle.bsky.social',
    bio: 'This is your bio. Tell people about yourself.',
    followersCount: 128,
    followingCount: 64,
    postsCount: 3
  };

  posts = [
    { id: '1', text: 'This is my first post on Bluesky! 🎉', likes: 12, reposts: 3, replies: 2, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { id: '2', text: 'Loving the decentralized web. The future is open! 🌐', likes: 45, reposts: 18, replies: 7, createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    { id: '3', text: 'Just shipped a new feature at work. Feels great! 🚀', likes: 89, reposts: 22, replies: 14, createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000) },
  ];

  showEditModal = false;
  editName = '';
  editBio = '';

  constructor(private router: Router) {}

  setTab(tab: 'posts' | 'replies' | 'media' | 'likes'): void { this.activeTab = tab; }

  openEdit(): void {
    this.editName = this.profile.displayName;
    this.editBio = this.profile.bio;
    this.showEditModal = true;
  }

  saveEdit(): void {
    this.profile.displayName = this.editName;
    this.profile.bio = this.editBio;
    this.showEditModal = false;
  }

  goBack(): void { this.router.navigate(['/home']); }

  getTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  }
}
