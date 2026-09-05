// API Types based on backend analysis

// Student Types
export interface StudentCreate {
  full_name: string;
  matricule: string;
  class_id: number;
  date_of_birth: string;
  gender: 'MALE' | 'FEMALE';
}

export interface StudentResponse extends StudentCreate {
  id: number;
  user_id: number;
}

export interface SubjectSummary {
  subject_name: string;
  coefficient: number;
  average: number;
}

export interface StudentReportCard {
  student_name: string;
  matricule: string;
  average: number;
  subjects: SubjectSummary[];
  promotion_status: 'PROMOTED' | 'REPEAT';
}

// Assessment Types
export interface AssessmentCreateRequest {
  title: string;
  description?: string;
  class_subject_id: number;
  term: number;
  sequence: number;
  max_score: number;
  date: string;
}

export interface AssessmentCreateResponse extends AssessmentCreateRequest {
  id: number;
}

export interface StudentScoreRow {
  student_id: number;
  student_name: string;
  score?: number;
}

export interface AssessmentScoresResponse {
  assessment_id: number;
  assessment_title: string;
  max_score: number;
  students: StudentScoreRow[];
}

// Score Types
export interface ScoreCreate {
  student_id: number;
  score: number;
}

export interface ScoreBulkCreate {
  scores: ScoreCreate[];
}

export interface ScoreBulkCreateResponse {
  message: string;
  count: number;
}

// Class Types
export interface ClassCreateRequest {
  name: string;
  level: 'PRIMARY' | 'SECONDARY';
  stream: 'SCIENTIFIC' | 'LITERARY' | 'TECHNICAL';
}

export interface ClassCreateResponse extends ClassCreateRequest {
  id: number;
}

// Subject Types
export interface SubjectCreateRequest {
  name: string;
}

export interface SubjectCreateResponse {
  id: number;
  name: string;
}

// Teacher Types
export interface TeacherResponse {
  id: number;
  user_id: number;
  full_name: string;
  loginid: string;
}

// Class-Subject Types
export interface ClassSubjectCreateRequest {
  class_id: number;
  subject_id: number;
  teacher_id: number;
  coefficient: number;
}

export interface ClassSubjectCreateResponse extends ClassSubjectCreateRequest {
  id: number;
}
