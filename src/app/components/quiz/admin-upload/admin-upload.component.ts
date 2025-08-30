import { Component } from '@angular/core';
import { Router } from '@angular/router'; // NEW
import { QuizService } from 'src/app/services/quiz.service';

@Component({
  selector: 'app-admin-upload',
  templateUrl: './admin-upload.component.html',
  styleUrls: ['./admin-upload.component.css']
})
export class AdminUploadComponent {
  file?: File;
  title = '';
  result: any;
  tests: any[] = [];

constructor(private quiz: QuizService, private router: Router) { this.load(); }

  onFile(ev: any) {
    const f: File = ev.target.files?.[0];
    this.file = f;
  }


// 30 Aug 
  // CHANGED: go through parse → review instead of direct save
  onUpload() {
    if (!this.file) return;
    this.quiz.parseUpload(this.file, this.title).subscribe({ // CHANGED
      next: (res) => {
        // navigate to review page with state
        this.router.navigate(['/admin-upload-review'], { state: { draft: res } }); // NEW
      },
      error: (err) => alert(err.error?.message || 'Upload parse failed') // CHANGED
    });
  }

  load() {
    this.quiz.listTests().subscribe({
      next: (res) => this.tests = res,
      error: () => {}
    });
  }


  confirmDelete(t: any) {
  const ok = confirm(`Delete test "${t.title}"? This will remove its questions and attempts.`);
  if (!ok) return;

  this.quiz.deleteTest(t.id).subscribe({
    next: () => {

      this.tests = this.tests.filter(x => x.id !== t.id);

    },
    error: (err) => {
      console.error(err);
      alert(err?.error?.message || 'Failed to delete test.');
    }
  });
}
}