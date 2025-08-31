import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, OnDestroy } from '@angular/core'; // CHANGED
import { ActivatedRoute } from '@angular/router';
import { apiConstants } from 'src/app/Helpers/api-constants';
import { QuizService, SubmitAttemptBody, SubmitAnswer } from 'src/app/services/quiz.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-take-test',
  templateUrl: './take-test.component.html',
  styleUrls: ['./take-test.component.css']
})
export class TakeTestComponent implements OnInit, OnDestroy { // CHANGED
  test: any;

  private attemptKey(testId: number, email: string) {
    return `attempt:${testId}:${(email || '').trim().toLowerCase()}`;
  }

  // NEW: timer related
  timeLimitMinutes: number | null = null; // NEW
  private timerId: any = null; // NEW
  private endAtMs: number | null = null; // NEW
  timeLeftText: string = ''; // NEW
  autoSubmitted = false; // NEW

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

    this.quiz.getTest(id).subscribe(res => {
      this.test = res;
      // NEW: get time limit if present
      this.timeLimitMinutes = (res?.timeLimitMinutes ?? null) as number | null; // NEW
      if (this.timeLimitMinutes && this.timeLimitMinutes > 0) { // NEW
        this.initTimer(id, this.email || ''); // NEW
      } // NEW
    });
  }

  ngOnDestroy(): void { // NEW
    if (this.timerId) clearInterval(this.timerId); // NEW
  } // NEW

  private timerKey(testId: number, email: string) { // NEW
    return `testStart:${testId}:${(email || '').trim().toLowerCase()}`; // NEW
  } // NEW

  private initTimer(testId: number, email: string) { // NEW
    const key = this.timerKey(testId, email);
    let start = Number(localStorage.getItem(key) || 0);
    if (!start) {
      start = Date.now();
      localStorage.setItem(key, String(start));
    }
    const durationMs = (this.timeLimitMinutes as number) * 60_000;
    this.endAtMs = start + durationMs;

    const tick = () => {
      const left = Math.max(0, (this.endAtMs as number) - Date.now());
      this.timeLeftText = this.formatMs(left);
      if (left <= 0 && !this.autoSubmitted) {
        this.autoSubmitted = true;
        this.showErrors = true; // highlight unanswered
        this.submit(); // auto-submit
      }
      this.cd.detectChanges();
    };

    tick();
    this.timerId = setInterval(tick, 1000);
  } // NEW

  private formatMs(ms: number): string { // NEW
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    const mm = String(m).padStart(2, '0');
    const ss = String(sec).padStart(2, '0');
    return `${mm}:${ss}`;
  } // NEW

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

  // NEW: review helper—show red borders and scroll to first unanswered
  reviewUnanswered() { // NEW
    this.showErrors = true;
    const first = (this.test?.questions || []).find((q: any) => !this.isAnswered(q));
    if (first) {
      const el = document.getElementById(`q-${first.id}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } // NEW

  submit() {
    if (this.submitting) return; // NEW: guard double submit
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

        // clear timer start on success
        const tkey = this.timerKey(this.test.id, this.email || ''); // NEW
        localStorage.removeItem(tkey); // NEW

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
          // clear timer start on conflict
          const tkey = this.timerKey(this.test.id, this.email || ''); // NEW
          localStorage.removeItem(tkey); // NEW
          this.router.navigate(['/attempt-submitted', err.error.attemptId]); 
          return;
        }
        alert(err?.error?.message || 'Submit failed');
      }
    });
  }
}
