import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Output() newPostClicked = new EventEmitter<void>();
  constructor(private router: Router) {}
  logout() { this.router.navigate(['/']); }
  openNewPost() {
    // If there's a listener (home page), emit to it
    // Otherwise navigate to home
    if (this.newPostClicked.observers.length > 0) {
      this.newPostClicked.emit();
    } else {
      this.router.navigate(['/home']);
    }
  }
}
