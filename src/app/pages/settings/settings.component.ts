import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  settingsItems = [
    { icon: '🔐', label: 'Account' },
    { icon: '🔒', label: 'Privacy and security' },
    { icon: '🤝', label: 'Moderation' },
    { icon: '🔔', label: 'Notifications' },
    { icon: '🖼️', label: 'Content and media' },
    { icon: '🎨', label: 'Appearance' },
    { icon: '♿', label: 'Accessibility' },
    { icon: '🌐', label: 'Languages' },
    { icon: '❓', label: 'Help' },
    { icon: 'ℹ️', label: 'About' },
  ];

  constructor(private router: Router) {}
  goBack() { this.router.navigate(['/home']); }
  logout() { this.router.navigate(['/']); }
}
