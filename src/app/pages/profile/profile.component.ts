import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { PostService } from '../../services/post.service';
import { FollowService } from '../../services/follow.service';
import { AuthService } from '../../services/auth.service';
import { MediaService } from '../../services/media.service';
import { HttpClient } from '@angular/common/http';
import { Post } from '../../models/post.model';
import { Observable, of, forkJoin } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  activeTab: 'posts' | 'replies' | 'media' | 'likes' = 'posts';
  showEditModal = false;
  editFirstName = '';
  editLastName = '';
  editBio = '';
  editLocation = '';
  editWebsite = '';
  followersCount = 0;
  followingCount = 0;
  saving = false;
  error = '';

  editProfilePicFile: File | null = null;
  editProfilePicPreview = '';
  editCoverPicFile: File | null = null;
  editCoverPicPreview = '';

  profile: any = null;
  posts: Post[] = [];
  likedPosts: Post[] = [];
  mediaPosts: Post[] = [];
  retweetedPosts: Post[] = [];

  private baseUrl = 'http://localhost:3000';

  constructor(
    private router: Router,
    private userService: UserService,
    private postService: PostService,
    private followService: FollowService,
    private authService: AuthService,
    private mediaService: MediaService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn) { this.router.navigate(['/login']); return; }
    this.loadProfile(this.authService.currentUserId!);
  }

  loadProfile(userId: string) {
    this.userService.getUserById(userId).subscribe(u => { this.profile = u; });
    this.postService.getPostsByUser(userId).subscribe(p => {
      this.posts = p;
      this.mediaPosts = p.filter(x => x.mediaUrls?.length > 0);
    });
    this.followService.getFollowers(userId).subscribe(f => this.followersCount = f.length);
    this.followService.getFollowing(userId).subscribe(f => this.followingCount = f.length);
    this.postService.getUserLikedTweets(userId).subscribe(p => this.likedPosts = p);
    this.postService.getUserRetweetedPosts(userId).subscribe(p => this.retweetedPosts = p);
  }

  setTab(tab: 'posts' | 'replies' | 'media' | 'likes') { this.activeTab = tab; }

  get activePosts(): Post[] {
    if (this.activeTab === 'likes') return this.likedPosts;
    if (this.activeTab === 'media') return this.mediaPosts;
    return this.posts;
  }

  openEdit() {
    this.editFirstName       = this.profile?.first_name || '';
    this.editLastName        = this.profile?.last_name  || '';
    this.editBio             = this.profile?.bio        || '';
    this.editLocation        = this.profile?.location   || '';
    this.editWebsite         = this.profile?.website    || '';
    this.editProfilePicFile  = null;
    this.editProfilePicPreview = this.profile?.profile_picture_url || '';
    this.editCoverPicFile    = null;
    this.editCoverPicPreview = this.profile?.cover_photo_url || '';
    this.error = '';
    this.showEditModal = true;
  }

  onEditProfilePicPicked(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Max 5MB'); return; }
    this.editProfilePicFile = file;
    const r = new FileReader();
    r.onload = () => { this.editProfilePicPreview = r.result as string; };
    r.readAsDataURL(file);
  }

  onEditCoverPicPicked(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Max 5MB'); return; }
    this.editCoverPicFile = file;
    const r = new FileReader();
    r.onload = () => { this.editCoverPicPreview = r.result as string; };
    r.readAsDataURL(file);
  }

  private fileToBase64(file: File): Observable<string> {
    return new Observable(obs => {
      const r = new FileReader();
      r.onload = () => { obs.next(r.result as string); obs.complete(); };
      r.onerror = () => obs.error('read failed');
      r.readAsDataURL(file);
    });
  }

  private uploadFile(file: File, purpose: 'profile_picture' | 'cover_photo'): Observable<string | null> {
    const userId = this.profile.id;
    return this.fileToBase64(file).pipe(
      switchMap(dataUrl => this.mediaService.uploadMedia({
        user_id: userId,
        tweet_id: null,
        media_name: file.name,
        media_type: file.type,
        media_url: dataUrl,
        purpose
      })),
      map(m => m?.id ?? null),
      catchError(() => of(null))
    );
  }

  saveEdit() {
    if (!this.editFirstName.trim()) { this.error = 'First name is required.'; return; }
    this.saving = true;
    this.error = '';
    const userId = this.profile.id;

    const avatar$ = this.editProfilePicFile ? this.uploadFile(this.editProfilePicFile, 'profile_picture') : of(null as string | null);
    const cover$  = this.editCoverPicFile   ? this.uploadFile(this.editCoverPicFile,   'cover_photo')     : of(null as string | null);

    forkJoin({ avatarId: avatar$, coverId: cover$ }).pipe(
      switchMap(({ avatarId, coverId }) => {
        const updates: any = {
          first_name: this.editFirstName.trim(),
          last_name:  this.editLastName.trim(),
          bio:        this.editBio,
          location:   this.editLocation,
          website:    this.editWebsite,
          updated_at: new Date().toISOString()
        };
        if (avatarId) updates['profile_picture_id'] = avatarId;
        if (coverId)  updates['cover_photo_id']     = coverId;
        return this.http.patch<any>(`${this.baseUrl}/users/${userId}`, updates);
      }),
      // Re-fetch fresh user from DB to get updated IDs, then resolve media URLs
      switchMap(() => this.http.get<any>(`${this.baseUrl}/users/${userId}`)),
      switchMap(freshUser => {
        const resolveUrl = (id: string | null) => id
          ? this.http.get<any>(`${this.baseUrl}/media/${id}`).pipe(map(m => m?.media_url ?? ''), catchError(() => of('')))
          : of('');
        return forkJoin({
          avatar: resolveUrl(freshUser.profile_picture_id),
          cover:  resolveUrl(freshUser.cover_photo_id)
        }).pipe(map(({ avatar, cover }) => ({
          ...freshUser,
          profile_picture_url: avatar,
          cover_photo_url:     cover
        })));
      })
    ).subscribe({
      next: enrichedUser => {
        this.saving = false;
        // Update local profile view immediately
        this.profile = enrichedUser;
        // Update session storage so sidebar/header also refresh
        this.authService.storeEnrichedUser(enrichedUser);
        this.showEditModal = false;
      },
      error: () => {
        this.saving = false;
        this.error = 'Failed to save. Please try again.';
      }
    });
  }

  toggleLike(post: Post) {
    const userId = this.authService.currentUserId!;
    this.postService.likePost(post, userId).subscribe(updated => {
      this.updatePostInAllLists(post.id, updated);
    });
  }

  toggleRepost(post: Post) {
    const userId = this.authService.currentUserId!;
    this.postService.repostTweet(post, userId).subscribe(updated => {
      this.updatePostInAllLists(post.id, updated);
      this.postService.getUserRetweetedPosts(userId).subscribe(p => this.retweetedPosts = p);
    });
  }

  private updatePostInAllLists(postId: string, updated: Post) {
    [this.posts, this.likedPosts, this.mediaPosts, this.retweetedPosts].forEach(list => {
      const idx = list.findIndex(p => p.id === postId);
      if (idx !== -1) list[idx] = { ...list[idx], ...updated };
    });
  }

  deletePost(post: Post) {
    if (!confirm('Delete this tweet?')) return;
    this.postService.deletePost(post.id).subscribe(() => {
      this.posts      = this.posts.filter(p => p.id !== post.id);
      this.likedPosts = this.likedPosts.filter(p => p.id !== post.id);
      this.mediaPosts = this.mediaPosts.filter(p => p.id !== post.id);
    });
  }

  goBack()              { this.router.navigate(['/home']); }
  goToTweet(post: Post) { this.router.navigate(['/tweet', post.id]); }

  formatCount(n: number): string {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return n?.toString() || '0';
  }
}
