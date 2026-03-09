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

  get f() { return this.form.controls; }

  onSubmit(): void {
    this.error = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    const identifier = this.f['identifier'].value.trim();
    const password = this.f['password'].value;

    this.authService.login(identifier, password).subscribe({
      next: (user) => {
        this.loading = false;
        // Redirect to profile setup if first time login
        if (!user.profile_setup_done) {
          this.router.navigate(['/setup']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.message || '';
        if (msg === 'USER_NOT_FOUND') this.error = 'No account found with that email or username.';
        else if (msg === 'INVALID_PASSWORD') this.error = 'Incorrect password. Please try again.';
        else this.error = 'Login failed. Please check your credentials.';
      }
    });
  }

  goBack(): void { this.router.navigate(['/']); }
  goToRegister(): void { this.router.navigate(['/register']); }
}
