import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginPageComponent {
  form: FormGroup;
  loading = false;
  error = '';
  showPassword = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.form = this.fb.group({
      identifier: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const identifier = this.form.get('identifier')?.value as string;
    const password = this.form.get('password')?.value as string;
    this.authService.login(identifier, password).subscribe({
      next: () => { this.loading = false; this.router.navigate(['/home']); },
      error: () => { this.loading = false; this.error = 'Invalid credentials. Please try again.'; }
    });
  }

  goBack(): void { this.router.navigate(['/']); }
  goToRegister(): void { this.router.navigate(['/register']); }
}
