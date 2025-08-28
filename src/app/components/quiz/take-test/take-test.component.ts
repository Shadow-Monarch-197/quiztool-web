import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { apiConstants } from 'src/app/Helpers/api-constants';
import { QuizService, SubmitAttemptBody, SubmitAnswer } from 'src/app/services/quiz.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-take-test',
  templateUrl: './take-test.component.html',
  styleUrls: ['./take-test.component.css']
})
export class TakeTestComponent implements OnInit {
  test: any;

  private attemptKey(testId: number, email: string) {
    return `attempt:${testId}:${(email || '').trim().toLowerCase()}`;
  }


  selectedOptions: Record<number, number | undefined> = {};
 
  subjectiveText: Record<number, string> = {};

  email: string = localStorage.getItem('userEmail') || localStorage.getItem('userName') || '';
  result: any;

  readonly fileBase = apiConstants.base_host; 

  assetUrl(u?: string | null): string {
    if (!u) return '';
    return u.startsWith('http') ? u : `${this.fileBase}${u}`;
  }

  showErrors = false;
  answeredCount = 0;
  unansweredCount = 0;
  submitting = false;

  @ViewChild('scorePanel') scorePanel?: ElementRef<HTMLDivElement>;

  constructor(
    private route: ActivatedRoute,
    private quiz: QuizService,
    private cd: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    const key = this.attemptKey(id, this.email || '');
    const prev = localStorage.getItem(key);
    if (prev) {
      this.quiz.getTest(id).subscribe(res => (this.test = res)); 
    
      setTimeout(() => this.quiz && (window.location.href = `#/attempt-submitted/${prev}`), 0);
      return;
    }

    this.quiz.getTest(id).subscribe(res => (this.test = res));
  }

  isSubjective(q: any): boolean {
    const t = (q?.type || 'objective').toString().toLowerCase();
    return t === 'subjective';
  }
  isObjective(q: any): boolean {
    return !this.isSubjective(q);
  }

  selectOption(qId: number, optId: number) {
    this.selectedOptions[qId] = optId;
  }

  isAnswered(q: any): boolean {
    if (this.isSubjective(q)) {
      const v = this.subjectiveText[q.id];
      return !!v && v.trim().length > 0;
    }
    return !!this.selectedOptions[q.id];
  }

  get selectedCount(): number {
    if (!this.test?.questions) return 0;
    return this.test.questions.reduce((acc: number, q: any) => acc + (this.isAnswered(q) ? 1 : 0), 0);
  }

  get canSubmit(): boolean {
    return !!this.email; 
  }

  submit() {
    this.showErrors = true;

    const totalQ = this.test?.questions?.length || 0;
    this.answeredCount = this.selectedCount;
    this.unansweredCount = totalQ - this.answeredCount;

    const answers: SubmitAnswer[] = (this.test?.questions || []).map((q: any) => {
      if (this.isSubjective(q)) {
        return {
          questionId: q.id,
          subjectiveText: this.subjectiveText[q.id] ?? null,
          selectedOptionId: null
        };
      }
      return {
        questionId: q.id,
        selectedOptionId: this.selectedOptions[q.id] ?? null,
        subjectiveText: null
      };
    });

    const body: SubmitAttemptBody = {
      testId: this.test.id,
      userEmail: this.email || 'anonymous@local',
      answers
    };

    this.submitting = true;
    this.quiz.submitAttempt(body).subscribe({
      next: (res) => {
        this.result = res;
        this.submitting = false;

        const key = this.attemptKey(this.test.id, this.email || '');
        localStorage.setItem(key, String(res.attemptId));

        sessionStorage.setItem(
          `attemptsum:${res.attemptId}`,
          JSON.stringify({
            score: res.score,
            total: res.total,
            answered: this.answeredCount,
            unanswered: this.unansweredCount
          })
        );
        this.cd.detectChanges();
        this.router.navigate(
          ['/attempt-submitted', res.attemptId],
          {
            state: {
              score: res.score,
              total: res.total,
              answered: this.answeredCount,
              unanswered: this.unansweredCount
            }
          }
        );
      },
      error: (err) => {
        this.submitting = false;
        if (err?.status === 409 && err?.error?.attemptId) {
          const key = this.attemptKey(this.test.id, this.email || '');
          localStorage.setItem(key, String(err.error.attemptId));
          this.router.navigate(['/attempt-submitted', err.error.attemptId]); 
          return;
        }
        alert(err?.error?.message || 'Submit failed');
      }
    });
  }
}
