import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './services/auth.interceptor';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UserDashboardComponent } from './components/user-dashboard/user-dashboard.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { UserService } from './services/user.service';
import { AdminUploadComponent } from './components/quiz/admin-upload/admin-upload.component';
import { UserTestsComponent } from './components/quiz/user-tests/user-tests.component';
import { TakeTestComponent } from './components/quiz/take-test/take-test.component';
import { AdminCreateQuestionComponent } from './components/quiz/admin-create-question/admin-create-question.component';
import { AdminTestViewComponent } from './components/quiz/admin-test-view/admin-test-view.component';
import { AttemptReviewComponent } from './components/quiz/attempt-review/attempt-review.component';
import { AttemptSubmittedComponent } from './components/quiz/attempt-submitted/attempt-submitted.component';
import { AdminUploadReviewComponent } from './components/quiz/admin-upload-review/admin-upload-review.component';

@NgModule({
  declarations: [
    AppComponent,
    UserDashboardComponent,
    AdminDashboardComponent,
    LoginComponent,
    AdminUploadComponent,
    UserTestsComponent,
    TakeTestComponent,
    AdminCreateQuestionComponent,
    AdminTestViewComponent,
    AttemptReviewComponent,
    AttemptSubmittedComponent,
    AdminUploadReviewComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    CommonModule
  ],
  providers: [
  UserService,
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
],
  bootstrap: [AppComponent]
})
export class AppModule { }
