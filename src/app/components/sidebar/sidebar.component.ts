import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @Output() newPostClicked = new EventEmitter<void>();
  currentUser: any = null;
  avatarUrl = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    const userId = this.authService.currentUserId;
    if (userId) {
      this.userService.getUserById(userId).subscribe(user => {
        this.currentUser = user;
        this.avatarUrl = user?.profile_picture_url || `https://i.pravatar.cc/36?u=${user?.username}`;
      });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openNewPost() {
    if (this.newPostClicked.observers.length > 0) {
      this.newPostClicked.emit();
    } else {
      this.router.navigate(['/home']);
    }
  }
}
