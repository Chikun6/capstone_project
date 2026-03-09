import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FollowService } from '../../services/follow.service';
import { UserService, User } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-follow',
  templateUrl: './follow.component.html',
  styleUrls: ['./follow.component.css']
})
export class FollowComponent implements OnInit {
  activeTab = 'followers';
  followers: any[] = [];
  following: any[] = [];
  allUsers: User[] = [];
  suggestedUsers: any[] = [];
  loading = true;

  constructor(
    private followService: FollowService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  get currentUserId(): string {
    return this.authService.currentUserId || '1';
  }

  ngOnInit() {
    this.userService.getAllUsers().subscribe(users => {
      this.allUsers = users.filter(u => u.id !== this.currentUserId);
      this.loadFollowData();
    });
  }

  loadFollowData() {
    this.loading = true;
    forkJoin({
      followers: this.followService.getFollowers(this.currentUserId),
      following: this.followService.getFollowing(this.currentUserId)
    }).subscribe(({ followers, following }) => {
      this.loading = false;
      const followingIds = following.map(f => f.following_id);
      const followerIds = followers.map(f => f.follower_id);

      this.followers = followerIds.map(fid => {
        const user = this.allUsers.find(u => u.id == fid);
        return user ? { ...user, isFollowingBack: followingIds.includes(user.id) } : null;
      }).filter(Boolean);

      this.following = followingIds.map(fid => {
        const user = this.allUsers.find(u => u.id == fid);
        return user ? { ...user } : null;
      }).filter(Boolean);

      // Suggested: users not following and not followed
      const allIds = [...new Set([...followingIds, ...followerIds])];
      this.suggestedUsers = this.allUsers
        .filter(u => !allIds.includes(u.id) && u.id !== this.currentUserId)
        .slice(0, 5)
        .map(u => ({ ...u, isFollowing: false }));
    });
  }

  followBack(user: any) {
    this.followService.follow(this.currentUserId, user.id).subscribe(() => {
      user.isFollowingBack = true;
      const found = this.following.find(u => u.id === user.id);
      if (!found) this.following.push({ ...user });
    });
  }

  unfollow(user: any) {
    if (!confirm(`Unfollow @${user.username}?`)) return;
    this.followService.unfollow(this.currentUserId, user.id).subscribe(() => {
      this.following = this.following.filter(f => f.id !== user.id);
      const follower = this.followers.find(f => f.id === user.id);
      if (follower) follower.isFollowingBack = false;
    });
  }

  followSuggested(user: any) {
    this.followService.follow(this.currentUserId, user.id).subscribe(() => {
      user.isFollowing = true;
      this.following.push({ ...user });
      this.suggestedUsers = this.suggestedUsers.filter(u => u.id !== user.id);
    });
  }

  goToProfile(username: string) {
    this.router.navigate(['/user', username]);
  }

  goBack() { this.router.navigate(['/home']); }
}
