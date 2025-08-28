import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginModel } from '../models/login-model';
import { apiConstants } from '../Helpers/api-constants';
import { Observable } from 'rxjs';
import { RegisterModel } from '../models/register-model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private http :HttpClient
  ) { }

  loginuser(loginUserObj: LoginModel): Observable<any>{

    return this.http.post<any>(apiConstants.login_user_path, loginUserObj)
  }

  registeruser(registerUserObj: RegisterModel): Observable<any>{

    return this.http.post<any>(apiConstants.register_user_path, registerUserObj)
  }

  getallusers() : Observable<any> { 
    return this.http.get<any>(apiConstants.get_all_users);
  }

  loginStep1(body: { email: string; password: string }) {
    return this.http.post<{ challengeId: number; message: string }>(apiConstants.login_step1_path, body);
  }
  loginStep2(body: { challengeId: number; email: string; otp: string }) {
    return this.http.post<any>(apiConstants.login_step2_path, body);
  }

  forgotPassword(body: { email: string }) {
    return this.http.post<{ requestId: number; message: string }>(apiConstants.forgot_password_path, body);
  }
  resetPassword(body: { email: string; otp: string; newPassword: string }) {
    return this.http.post<any>(apiConstants.reset_password_path, body);
  }


}
