// NEW
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from 'src/app/services/quiz.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-admin-assign-test',
  templateUrl: './admin-assign-test.component.html',
  styleUrls: ['./admin-assign-test.component.css']
})
export class AdminAssignTestComponent implements OnInit {
  testId!: number;
  testTitle = '';
  loading = true;

  users: { userid: number; name: string; email: string }[] = [];
  assignees = new Set<string>(); // emails
  selected = new Set<string>();  // emails (checkbox UI)

  // *** CHANGED: rename from `search` to `searchText` to avoid type collisions ***
  searchText: string = '';

  saving = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quiz: QuizService,
    private usersApi: UserService
  ) {}

  ngOnInit(): void {
    this.testId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.testId) { this.router.navigate(['/admin-dashboard']); return; }

    // load test title
    this.quiz.getAdminTest(this.testId).subscribe({
      next: (res) => { this.testTitle = res?.title || `Test #${this.testId}`; },
      error: () => {}
    });

    // load users + existing assignees in parallel
    this.usersApi.getallusers().subscribe({
      next: (arr) => {
        this.users = (arr || []).map((u: any) => ({ userid: u.userid, name: u.name, email: (u.email || '').toLowerCase() }));
        this.quiz.getAssignees(this.testId).subscribe({
          next: (as) => {
            (as || []).forEach(a => this.assignees.add((a.email || '').toLowerCase()));
            // pre-check assigned users
            this.selected = new Set(this.assignees);
            this.loading = false;
          },
          error: () => { this.loading = false; }
        });
      },
      error: () => { this.loading = false; }
    });
  }

  // *** CHANGED: filter uses `searchText` ***
  filteredUsers() {
    const q = (this.searchText || '').trim().toLowerCase();
    if (!q) return this.users;
    return this.users.filter(u =>
      (u.email || '').toLowerCase().includes(q) || (u.name || '').toLowerCase().includes(q)
    );
  }

  isChecked(email: string) {
    return this.selected.has((email || '').toLowerCase());
  }

  toggle(email: string, checked: boolean) {
    const e = (email || '').toLowerCase();
    if (checked) this.selected.add(e); else this.selected.delete(e);
  }

  selectAllVisible() {
    this.filteredUsers().forEach(u => this.selected.add((u.email || '').toLowerCase()));
  }
  clearAll() { this.selected.clear(); }

  save() {
    const emails = Array.from(this.selected);
    if (emails.length === 0 && !confirm('This will remove all assignees. Continue?')) return;

    this.saving = true;
    this.quiz.assignUsersToTest(this.testId, emails).subscribe({
      next: (res: any) => {
        alert(`Assignments saved. Added: ${res.assignedAdded}, Already: ${res.alreadyAssigned}`);
        this.saving = false;
        this.router.navigate(['/admin-test', this.testId]); // or admin-dashboard
      },
      error: (err) => {
        this.saving = false;
        alert(err?.error?.message || 'Failed to assign.');
      }
    });
  }

  cancel() { this.router.navigate(['/admin-test', this.testId]); }
}
