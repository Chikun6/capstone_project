import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

// Custom validator to check passwords match
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { passwordMismatch: true };
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
  profileForm: FormGroup;
  loading = false;
  error = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.form = this.fb.group({
      firstName:       ['', [Validators.required]],
      lastName:        ['', [Validators.required]],
      username:        ['', [Validators.required]],
      email:           ['', [Validators.required, Validators.email]],
      password:        ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: passwordMatchValidator });

    this.profileForm = this.fb.group({
      displayName: [''],
      description: ['']
    });
  }

  nextStep(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    
  }

  onSubmit(): void {
    this.loading = true;
    const email    = this.form.get('email')?.value as string;
    const password = this.form.get('password')?.value as string;
    const username = this.form.get('username')?.value as string;
    this.authService.register(email, password, username).subscribe({
      next: () => { this.loading = false; this.router.navigate(['/home']); },
      error: () => { this.loading = false; this.error = 'Registration failed. Please try again.'; }
    });
  }

  goBack(): void {
     this.router.navigate(['/']); 
  }
}