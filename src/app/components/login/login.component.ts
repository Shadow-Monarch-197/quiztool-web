import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginModel } from 'src/app/models/login-model';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  loginUserObj!: LoginModel;
  toggleForm = true;


  awaitingOtp = false;
  challengeId: number | null = null;
  otpForm!: FormGroup;

  showForgot = false;
  forgotForm!: FormGroup;
  resetForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });

    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      mobileno: [''],
      password: ['', [Validators.required]]
    });

    this.otpForm = this.formBuilder.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
    this.forgotForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
    this.resetForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      newPassword: ['', [Validators.required, Validators.minLength(4)]],
    });

    const token = localStorage.getItem('token');
    const role  = (localStorage.getItem('role') || '').toLowerCase();
    if (token) {
      this.router.navigate([role === 'admin' ? '/admin-dashboard' : '/user-dashboard']);
    }
  }


  onLogin() {
    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const { email, password } = this.loginForm.value;

    this.userService.loginStep1({ email, password }).subscribe({
      next: (res) => {
        this.awaitingOtp = true;
        this.challengeId = res.challengeId;
   
        this.resetForm.patchValue({ email });
        alert('OTP sent to your email.');
      },
      error: (err) => {
        console.log(err);
        alert(err.error?.message || 'An error occurred during login.');
      }
    });
  }

  onVerifyOtp() {
    if (!this.awaitingOtp || this.challengeId == null) return;
    if (!this.otpForm.valid) { this.otpForm.markAllAsTouched(); return; }

    const body = {
      challengeId: this.challengeId,
      email: this.loginForm.value.email,
      otp: this.otpForm.value.otp
    };

    this.userService.loginStep2(body).subscribe({
      next: (res) => {
        localStorage.setItem('userRole', res.role);
        localStorage.setItem('userName', res.name);
        localStorage.setItem('token', res.token ?? '');
        localStorage.setItem('role', (res.role ?? '').toLowerCase());

        if ((res.role ?? '').toLowerCase() === 'admin') {
          this.router.navigate(['/admin-dashboard']);
        } else {
          this.router.navigate(['/user-dashboard']);
        }
      },
      error: (err) => {
        console.log(err);
        alert(err.error?.message || 'OTP verification failed.');
      }
    });
  }

  onRegister() {
    if (this.registerForm.valid) {
      const registerUserObj = {
        name: this.registerForm.value.name,
        email: this.registerForm.value.email,
        mobileno: this.registerForm.value.mobileno,
        password: this.registerForm.value.password,
      };

      this.userService.registeruser(registerUserObj).subscribe({
        next: () => {
          alert('Registration successful!');
          this.toggleForm = true;
          this.registerForm.reset();
        },
        error: (err) => {
          console.log(err);
          alert(err.error?.message || 'An error occurred during registration.');
        }
      });
    } else {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
    }
  }


  openForgot() {
    this.showForgot = true;
    this.awaitingOtp = false;      
    this.challengeId = null;
    this.forgotForm.reset();
    this.resetForm.reset();
  }

  sendForgotOtp() {
    if (!this.forgotForm.valid) { this.forgotForm.markAllAsTouched(); return; }
    this.userService.forgotPassword({ email: this.forgotForm.value.email }).subscribe({
      next: () => {
        alert('If the email exists, an OTP has been sent.');
        this.resetForm.patchValue({ email: this.forgotForm.value.email });
      },
      error: () => alert('Failed to start password reset.')
    });
  }

  doResetPassword() {
    if (!this.resetForm.valid) { this.resetForm.markAllAsTouched(); return; }
    const { email, otp, newPassword } = this.resetForm.value;
    this.userService.resetPassword({ email, otp, newPassword }).subscribe({
      next: () => {
        alert('Password updated. Please sign in.');
        this.showForgot = false;
        this.toggleForm = true;
        this.loginForm.patchValue({ email });
      },
      error: (err) => alert(err.error?.message || 'Failed to reset password.')
    });
  }
}
