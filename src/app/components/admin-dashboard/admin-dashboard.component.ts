
import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { AuthService } from 'src/app/services/auth.service';    

import { QuizService } from 'src/app/services/quiz.service';
import { AttemptListItem, TestSummary } from 'src/app/services/quiz.service'; // adjust path if you keep types elsewhere
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  alluserlist: any[] = [];


  tests: TestSummary[] = [];
  attempts: AttemptListItem[] = [];
  selectedTestId: number | null = null;
  loadingAttempts = false;

showAttempts = false;
attemptsLoaded = false;

  constructor(
    private userService: UserService,
 
    private quiz: QuizService,
    private auth: AuthService,
     private router: Router     

  ) {}

  ngOnInit(): void {

    this.loadTests();
    this.loadAttempts();
  }


  logout() {                               
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  getAllUsers(){
    this.userService.getallusers().subscribe({
      next:(res) => {
        this.alluserlist = res;
      },
      error: (err) => {
        console.log(err);
        alert(err.error?.message || 'An error occurred during registration.');
      }
    })
  }


  loadTests() {
    this.quiz.getTests().subscribe({
      next: (res) => this.tests = res || [],
      error: (err) => console.error(err)
    });
  }

  toggleAttempts(): void {                 
    this.showAttempts = !this.showAttempts;
    if (this.showAttempts && !this.attemptsLoaded) {
      this.loadTests();
      this.loadAttempts();
      this.attemptsLoaded = true;
    }
  }

  loadAttempts(testId?: number) {
    this.loadingAttempts = true;
    this.quiz.getAttempts(testId).subscribe({
      next: (res) => {
        this.attempts = res || [];
        this.loadingAttempts = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingAttempts = false;
        alert(err?.error?.message || 'Failed to load attempts.');
      }
    });
  }


  onFilterChange(id: number | null) {
  this.selectedTestId = id;
  this.loadAttempts(this.selectedTestId ?? undefined);
}


  trackByAttempt = (_: number, a: AttemptListItem) => a.id;
}


