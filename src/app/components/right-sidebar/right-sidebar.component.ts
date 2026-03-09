import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserService, User } from '../../services/user.service';
import { FollowService } from '../../services/follow.service';
import { forkJoin, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

interface SuggestedUser extends User {
  followLoading: boolean;
}

@Component({
  selector: 'app-right-sidebar',
  templateUrl: './right-sidebar.component.html',
  styleUrls: ['./right-sidebar.component.css']
})
export class RightSidebarComponent implements OnInit {
  peopleSearch = '';
  // Only people NOT yet followed
  suggestedPeople: SuggestedUser[] = [];
  filteredPeople: SuggestedUser[] = [];
  trendingItems = ['F This Movie Fest', 'Six Nations', 'Caturday', 'Arsenal', 'F1 Qualifying'];
  loading = true;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private followService: FollowService
  ) {}

  ngOnInit() {
    this.loadSuggestedUsers();
  }

  loadSuggestedUsers() {
    const currentUserId = this.authService.currentUserId;
    if (!currentUserId) { this.loading = false; return; }

    this.userService.getAllUsers().pipe(
      switchMap(users => {
        const others = users.filter(u => u.id !== currentUserId);
        if (!others.length) return of([] as SuggestedUser[]);
        return forkJoin(
          others.map(u =>
            this.followService.isFollowing(currentUserId, u.id).pipe(
              switchMap(isFollowing => of({ isFollowing, user: u })),
              catchError(() => of({ isFollowing: false, user: u }))
            )
          )
        );
      }),
      catchError(() => of([]))
    ).subscribe((results: any[]) => {
      this.loading = false;
      // Only keep users NOT already followed, limit to 5
      const notFollowed = results
        .filter(r => !r.isFollowing)
        .slice(0, 5)
        .map(r => ({ ...r.user, followLoading: false } as SuggestedUser));
      this.suggestedPeople = notFollowed;
      this.filteredPeople  = [...notFollowed];
    });
  }

  filterPeople() {
    const q = this.peopleSearch.toLowerCase();
    this.filteredPeople = this.suggestedPeople.filter(p =>
      (p.first_name + ' ' + p.last_name).toLowerCase().includes(q) ||
      p.username.toLowerCase().includes(q)
    );
  }

  followUser(person: SuggestedUser) {
    const currentUserId = this.authService.currentUserId;
    if (!currentUserId || person.followLoading) return;
    person.followLoading = true;
    this.followService.follow(currentUserId, person.id).subscribe({
      next: () => {
        // Remove from suggested list immediately after following
        this.suggestedPeople = this.suggestedPeople.filter(p => p.id !== person.id);
        this.filteredPeople  = this.filteredPeople.filter(p => p.id !== person.id);
      },
      error: () => { person.followLoading = false; }
    });
  }
}
