import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-attempt-submitted',
  templateUrl: './attempt-submitted.component.html'
})
export class AttemptSubmittedComponent implements OnInit {
  attemptId!: number;

  score?: number;       
  total?: number;       
  answered?: number;    
  unanswered?: number;  
  hasSummary = false;   

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.attemptId = Number(this.route.snapshot.paramMap.get('id'));


    const s: any = history.state || {};
    this.score = s?.score;
    this.total = s?.total;
    this.answered = s?.answered;
    this.unanswered = s?.unanswered;

    if (this.score == null || this.total == null) {
      const raw = sessionStorage.getItem(`attemptsum:${this.attemptId}`);
      if (raw) {
        try {
          const obj = JSON.parse(raw);
          this.score = obj.score;
          this.total = obj.total;
          this.answered = obj.answered;
          this.unanswered = obj.unanswered;
        } catch {  }
      }
    }

    this.hasSummary = typeof this.score === 'number' && typeof this.total === 'number';
   
  }

  goToTests() {
    this.router.navigate(['/tests']);
  }
}
