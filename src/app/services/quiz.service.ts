import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { apiConstants } from '../Helpers/api-constants';
import { Observable } from 'rxjs';


export interface AttemptListItem {
  id: number;
  testId: number;
  testTitle: string;
  userEmail: string;
  score: number;
  total: number;
  percent: number;
  attemptedAt: string; 
}

export interface TestSummary {
  id: number;
  title: string;
  questionCount: number;
  createdAt: string;
  // NEW: optional time limit info
  timeLimitMinutes?: number | null; // NEW
}

export interface SubmitAnswer {
  questionId: number;
  selectedOptionId?: number | null;  
  subjectiveText?: string | null;    
}


export interface SubmitAttemptBody {
  testId: number;
  userEmail: string;
  answers: SubmitAnswer[];
}


export type QuestionTypeStr = 'objective' | 'subjective';

export interface AddQuestionPayload {
  type: QuestionTypeStr;
  text: string;

  options?: string[];
  correctIndex?: number; 
  modelAnswer?: string;
  image?: File;
}


@Injectable({ providedIn: 'root' })
export class QuizService {

  
  private base = apiConstants.base_api; 
  constructor(private http: HttpClient) {
  
}

  //30 Aug
  // CHANGED: upload flow now can use parse-upload + review
   uploadExcel(file: File, title?: string): Observable<any> {
    const form = new FormData();
    form.append('file', file);
    if (title) form.append('title', title);
    return this.http.post(`${this.base}/Tests/upload`, form);
  }

  // 30 Aug
  // NEW: parse for preview without saving
   parseUpload(file: File, title?: string, timeLimitMinutes?: number | null): Observable<{ title: string; questions: any[]; timeLimitMinutes?: number | null }> { // NEW
    const form = new FormData(); // NEW
    form.append('file', file); // NEW
    if (title) form.append('title', title); // NEW
    if (timeLimitMinutes != null) form.append('timeLimitMinutes', String(timeLimitMinutes)); // NEW
    return this.http.post<{ title: string; questions: any[]; timeLimitMinutes?: number | null }>(`${this.base}/Tests/parse-upload`, form); // NEW
  }

  // 30 Aug
  // NEW: persist edited preview as locked test
   saveParsedTest(body: { title: string; questions: any[]; timeLimitMinutes?: number | null }): Observable<any> { // NEW
    return this.http.post(`${this.base}/Tests/save-parsed`, body); // NEW
  }

  listTests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/Tests`);
  }

  getTest(id: number): Observable<any> {
    return this.http.get(`${this.base}/Tests/${id}`);
  }

   submitAttempt(body: SubmitAttemptBody): Observable<any> {
    return this.http.post(`${this.base}/Tests/submit`, body);
  }


  deleteTest(id: number) {
    return this.http.delete(`${this.base}/Tests/${id}`);
  }


getAttempts(testId?: number) {
  const qs = typeof testId === 'number' ? `?testId=${testId}` : '';
  return this.http.get<AttemptListItem[]>(`${this.base}/Tests/attempts${qs}`);
}

getTests() {
  return this.http.get<TestSummary[]>(`${this.base}/Tests`);
}

//30 Aug
 // CHANGED: admin view also returns isLocked
   getAdminTest(id: number) {
    return this.http.get<any>(`${this.base}/Tests/${id}/admin`);
  }

deleteQuestion(questionId: number) {
  return this.http.delete(`${this.base}/Tests/questions/${questionId}`);
}

getAttemptDetail(attemptId: number) {
  return this.http.get<any>(`${this.base}/Tests/attempts/${attemptId}`);
}

updateAttemptScore(attemptId: number, score: number) {
  return this.http.patch<any>(`${this.base}/Tests/attempts/${attemptId}/score`, { score });
}



    // CHANGED: allow optional timeLimitMinutes when creating a test
  createTest(title: string, timeLimitMinutes?: number | null): Observable<TestSummary> { // CHANGED
    const body: any = { title };
    if (timeLimitMinutes != null) body.timeLimitMinutes = timeLimitMinutes; // NEW
    return this.http.post<TestSummary>(`${this.base}/Tests`, body);
  }

  
  addQuestionToTest(testId: number, payload: AddQuestionPayload): Observable<{ questionId: number }> {
    const fd = new FormData();
    fd.append('type', payload.type);
    fd.append('text', payload.text);

    if (payload.type === 'objective') {
      (payload.options ?? []).forEach(o => fd.append('options', o));
      if (payload.correctIndex !== undefined && payload.correctIndex !== null) {
        fd.append('correctIndex', String(payload.correctIndex));
      }
    } else {
      if (payload.modelAnswer) fd.append('modelAnswer', payload.modelAnswer);
    }

    if (payload.image) {
      fd.append('image', payload.image, payload.image.name);
    }

    return this.http.post<{ questionId: number }>(`${this.base}/Tests/${testId}/questions`, fd);
  }

  // NEW: list assignees for a test (admin)
  getAssignees(testId: number) { // NEW
    return this.http.get<{ email: string; userId?: number; name?: string; assignedAt: string; }[]>(
      `${this.base}/Tests/${testId}/assignees`
    );
  }

  // NEW: assign a test to emails (admin)
  assignUsersToTest(testId: number, emails: string[]) { // NEW
    return this.http.post(`${this.base}/Tests/${testId}/assign`, { emails });
  }

}