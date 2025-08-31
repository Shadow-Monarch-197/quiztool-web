// NEW
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { QuizService } from 'src/app/services/quiz.service';

type QType = 'objective' | 'subjective';

interface PreviewOption {
  text: string;
  isCorrect: boolean;
}
interface PreviewQuestion {
  text: string;
  type: QType;
  imageUrl?: string | null;
  modelAnswer?: string | null;
  options: PreviewOption[];
}

@Component({
  selector: 'app-admin-upload-review',
  templateUrl: './admin-upload-review.component.html',
  styleUrls: ['./admin-upload-review.component.css']
})
export class AdminUploadReviewComponent implements OnInit {
  title = '';
  // NEW: time limit minutes for the test
  timeLimitMinutes: number | null = null; // NEW
  questions: PreviewQuestion[] = [];
  activeTab: 'edit' | 'preview' = 'edit';
  saving = false;

  constructor(private router: Router, private quiz: QuizService) {}

  ngOnInit(): void {
    const draft = (history.state && history.state.draft) || null;
    if (!draft || !draft.questions) {
      alert('Nothing to review. Please upload again.');
      this.router.navigate(['/admin-upload']);
      return;
    }
    this.title = draft.title || '';
     // NEW: receive possible time limit from parse-upload
    this.timeLimitMinutes = draft.timeLimitMinutes ?? null; // NEW
    // normalize types to union
    this.questions = (draft.questions || []).map((q: any) => ({
      text: q.text || '',
      type: (q.type === 1 || q.type === 'subjective') ? 'subjective' : 'objective',
      imageUrl: q.imageUrl || null,
      modelAnswer: q.modelAnswer || null,
      options: (q.options || []).map((o: any) => ({ text: o.text || '', isCorrect: !!o.isCorrect }))
    }));
  }

   // FIX: move inline error handler into TS to avoid parser errors
  onImgError(ev: Event) { // FIX
    const img = ev.target as HTMLImageElement;
    if (img) img.style.display = 'none';
  }

  // FIX: avoid inline object literal in template
  getPreview() {
    return { title: this.title, timeLimitMinutes: this.timeLimitMinutes, questions: this.questions }; // CHANGED
  }

  addQuestion() {
    this.questions.push({ text: '', type: 'objective', options: [{ text: '', isCorrect: true }] });
  }

  removeQuestion(i: number) {
    this.questions.splice(i, 1);
  }

  addOption(i: number) {
    const q = this.questions[i];
    if (q.type !== 'objective') return;
    q.options.push({ text: '', isCorrect: false });
  }

  removeOption(i: number, j: number) {
    const q = this.questions[i];
    if (q.type !== 'objective') return;
    q.options.splice(j, 1);
    if (!q.options.some(o => o.isCorrect) && q.options.length > 0) {
      q.options[0].isCorrect = true;
    }
  }

  markCorrect(i: number, j: number) {
    const q = this.questions[i];
    if (q.type !== 'objective') return;
    q.options.forEach((o, idx) => (o.isCorrect = idx === j));
  }

  onTypeChange(i: number, newType: QType) {
    const q = this.questions[i];
    q.type = newType;
    if (newType === 'objective' && (!q.options || q.options.length === 0)) {
      q.options = [{ text: '', isCorrect: true }];
      q.modelAnswer = null;
    }
    if (newType === 'subjective') {
      q.options = [];
    }
  }

  save() {
    // build body in AdminQuestionDto shape the API expects
    if (!this.title.trim()) {
      alert('Title is required.');
      return;
    }
    const questions = this.questions
      .map(q => ({
        id: 0,
        text: (q.text || '').trim(),
        type: q.type === 'subjective' ? 1 : 0,
        imageUrl: q.imageUrl || null,
        modelAnswer: q.type === 'subjective' ? (q.modelAnswer || '').trim() : null,
        options: q.type === 'objective'
          ? (q.options || []).filter(o => (o.text || '').trim().length > 0)
            .map(o => ({ id: 0, text: (o.text || '').trim(), isCorrect: !!o.isCorrect }))
          : []
      }))
      .filter(q => q.text.length > 0);

    if (questions.length === 0) {
      alert('Add at least one question.');
      return;
    }
    // ensure objective questions have at least one option
    for (const q of questions) {
      if (q.type === 0) {
        if (!q.options || q.options.length === 0) {
          alert('Every objective question must have at least one option.');
          return;
        }
        if (!q.options.some(o => o.isCorrect)) q.options[0].isCorrect = true;
      }
    }

    this.saving = true;
    this.quiz.saveParsedTest({
      title: this.title.trim(),
      timeLimitMinutes: (this.timeLimitMinutes ?? null), // NEW
      questions
    }).subscribe({
      next: (res) => {
        alert('Test saved and locked.');
        this.saving = false;
        this.router.navigate(['/admin-test', res.testId]); // optional: navigate somewhere; adjust route if needed
      },
      error: (err) => {
        this.saving = false;
        console.error(err);
        alert(err?.error?.message || 'Failed to save test.');
      }
    });
  }

  cancel() {
    if (confirm('Discard this upload?')) {
      this.router.navigate(['/admin-upload']);
    }
  }
}
