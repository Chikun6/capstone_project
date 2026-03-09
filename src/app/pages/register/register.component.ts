import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const pw = control.get('password');
  const cpw = control.get('confirmPassword');
  if (pw && cpw && pw.value !== cpw.value) return { passwordMismatch: true };
  return null;
}

function strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value || '';
  if (!value) return null;
  const hasUpper = /[A-Z]/.test(value);
  const hasLower = /[a-z]/.test(value);
  const hasDigit = /\d/.test(value);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
  if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
    return { weakPassword: true };
  }
  return null;
}

function capitalizedNameValidator(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value || '';
  if (!value) return null;
  if (!/^[A-Z][a-zA-Z]*(?: [A-Z][a-zA-Z]*)*$/.test(value)) {
    return { notCapitalized: true };
  }
  return null;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterPageComponent {
  form: FormGroup;
  loading = false;
  error = '';
  showPassword = false;
  showConfirm = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.form = this.fb.group({
      firstName: ['', [
        Validators.required,
        capitalizedNameValidator
      ]],
      lastName: ['', [
        Validators.required,
        capitalizedNameValidator
      ]],
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern(/^[a-zA-Z0-9_]+$/)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[^@]+@[^@]+\.(com|org|in|net|edu)$/)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(16),
        strongPasswordValidator
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: passwordMatchValidator });
  }

  get f() { return this.form.controls; }

  onSubmit(): void {
    this.error = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.authService.register({
      first_name: this.f['firstName'].value,
      last_name: this.f['lastName'].value,
      username: this.f['username'].value,
      email: this.f['email'].value,
      password: this.f['password'].value
    }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.message || '';
        if (msg === 'EMAIL_TAKEN') this.error = 'This email is already registered.';
        else if (msg === 'USERNAME_TAKEN') this.error = 'This username is already taken.';
        else this.error = 'Registration failed. Please try again.';
      }
    });
  }

  goBack(): void { this.router.navigate(['/']); }
  goToLogin(): void { this.router.navigate(['/login']); }
}
