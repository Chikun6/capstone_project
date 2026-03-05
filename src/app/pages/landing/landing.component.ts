import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingPageComponent {
  constructor(private router: Router) {}

  goToRegister() { this.router.navigate(['/register']); }
  goToLogin() { this.router.navigate(['/login']); }
}
