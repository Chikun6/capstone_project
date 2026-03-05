import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-follow',
  templateUrl: './follow.component.html',
  styleUrls: ['./follow.component.css']
})
export class FollowPageComponent {
  activeTab: 'followers' | 'following' = 'followers';

  followers = [
    { handle: 'alice.bsky.social', displayName: 'Alice Johnson', avatar: 'https://i.pravatar.cc/48?img=5', bio: 'Designer & creator', isFollowing: false },
    { handle: 'bob.bsky.social', displayName: 'Bob Smith', avatar: 'https://i.pravatar.cc/48?img=6', bio: 'Software engineer', isFollowing: true },
    { handle: 'carol.bsky.social', displayName: 'Carol White', avatar: 'https://i.pravatar.cc/48?img=7', bio: 'Photographer', isFollowing: false },
    { handle: 'dave.bsky.social', displayName: 'Dave Brown', avatar: 'https://i.pravatar.cc/48?img=8', bio: 'Tech enthusiast', isFollowing: true },
  ];

  following = [
    { handle: 'techbuzz.bsky.social', displayName: 'Tech Buzz', avatar: 'https://i.pravatar.cc/48?img=9', bio: 'Latest in tech', isFollowing: true },
    { handle: 'naturelens.bsky.social', displayName: 'Nature Lens', avatar: 'https://i.pravatar.cc/48?img=10', bio: 'Nature photography', isFollowing: true },
    { handle: 'forbes.com', displayName: 'Forbes', avatar: 'https://i.pravatar.cc/48?img=11', bio: 'Business & finance news', isFollowing: true },
    { handle: 'digitalprimate.bsky.social', displayName: 'Digital Primate', avatar: 'https://i.pravatar.cc/48?img=12', bio: 'Digital life stories', isFollowing: true },
  ];

  constructor(private router: Router) {}

  setTab(tab: 'followers' | 'following'): void { this.activeTab = tab; }

  toggleFollow(person: any): void { person.isFollowing = !person.isFollowing; }

  goBack(): void { this.router.navigate(['/home']); }
}
