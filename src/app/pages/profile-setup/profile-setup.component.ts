import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { MediaService } from '../../services/media.service';
import { Observable, of, forkJoin, switchMap, map, catchError } from 'rxjs';

@Component({
  selector: 'app-profile-setup',
  templateUrl: './profile-setup.component.html',
  styleUrls: ['./profile-setup.component.css']
})
export class ProfileSetupComponent implements OnInit {
  currentStep = 1;
  totalSteps = 2;
  saving = false;
  error = '';

  form = {
    bio: '',
    location: '',
    website: '',
    avatarUrl: '',
    avatarFile: null as File | null,
    coverUrl: '',
    coverFile: null as File | null
  };

  private baseUrl = 'http://localhost:3000';

  constructor(
    private router: Router,
    private http: HttpClient,
    public authService: AuthService,
    private mediaService: MediaService
  ) {}

  ngOnInit() {
    const user = this.authService.currentUser;
    if (!user) { this.router.navigate(['/login']); return; }
    this.form.bio = user.bio || '';
    this.form.location = user.location || '';
    this.form.website = user.website || '';
  }

  get progress() { return (this.currentStep / this.totalSteps) * 100; }

  goToPreview() {
    if (this.form.website && !this.form.website.startsWith('http')) {
      this.form.website = 'https://' + this.form.website;
    }
    this.currentStep = 2;
  }
  goBack() { this.currentStep = 1; }

  skip() {
    const user = this.authService.currentUser;
    if (!user) return;
    this.saving = true;
    this.http.patch(`${this.baseUrl}/users/${user.id}`, {
      profile_setup_done: true,
      updated_at: new Date().toISOString()
    }).subscribe(() => {
      this.saving = false;
      this.authService.markProfileSetupDone();
      this.router.navigate(['/home']);
    });
  }

  private fileToBase64(file: File): Observable<string> {
    return new Observable(obs => {
      const r = new FileReader();
      r.onload = () => { obs.next(r.result as string); obs.complete(); };
      r.onerror = () => obs.error('read failed');
      r.readAsDataURL(file);
    });
  }

  private uploadFile(file: File, userId: string, purpose: 'profile_picture' | 'cover_photo'): Observable<string | null> {
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

  finish() {
    const user = this.authService.currentUser;
    if (!user) return;
    this.saving = true;
    this.error = '';

    const avatar$ = this.form.avatarFile ? this.uploadFile(this.form.avatarFile, user.id, 'profile_picture') : of(null);
    const cover$  = this.form.coverFile  ? this.uploadFile(this.form.coverFile,  user.id, 'cover_photo')      : of(null);

    forkJoin({ avatarId: avatar$, coverId: cover$ }).pipe(
      switchMap(({ avatarId, coverId }) => {
        const updates: any = {
          bio: this.form.bio,
          location: this.form.location,
          website: this.form.website,
          profile_setup_done: true,
          updated_at: new Date().toISOString()
        };
        if (avatarId) updates['profile_picture_id'] = avatarId;
        if (coverId)  updates['cover_photo_id']     = coverId;
        return this.http.patch<any>(`${this.baseUrl}/users/${user.id}`, updates);
      }),
      // After patch: re-fetch user with resolved media URLs, store in session, THEN navigate
      switchMap(() => this.http.get<any>(`${this.baseUrl}/users/${user.id}`)),
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
          cover_photo_url: cover
        })));
      })
    ).subscribe({
      next: enrichedUser => {
        this.saving = false;
        // Store fully enriched user in session BEFORE navigating
        this.authService.storeEnrichedUser(enrichedUser);
        this.router.navigate(['/home']);
      },
      error: () => {
        this.saving = false;
        this.error = 'Failed to save profile. Please try again.';
      }
    });
  }

  onCoverPicked(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('File too large. Max 5MB.'); return; }
    this.form.coverFile = file;
    const r = new FileReader();
    r.onload = () => { this.form.coverUrl = r.result as string; };
    r.readAsDataURL(file);
  }

  onAvatarPicked(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('File too large. Max 5MB.'); return; }
    this.form.avatarFile = file;
    const r = new FileReader();
    r.onload = () => { this.form.avatarUrl = r.result as string; };
    r.readAsDataURL(file);
  }
}
