// Philingo public API client

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';

async function get<T>(path: string, params?: Record<string, string | number>): Promise<T> {
  const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
  const res = await fetch(`${BASE}${path}${qs}`);
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// Public API endpoints

export const schoolsApi = {
  list: (params?: { search?: string; limit?: number; page?: number }) =>
    get<{ data: School[]; total: number }>('/api/schools', { isActive: 'true', ...(params as any) }),
  get: (slug: string) =>
    get<School>(`/api/schools/${slug}`),
};

export const coursesApi = {
  list: () =>
    get<{ data: Course[]; total: number }>('/api/courses', { isActive: 'true', limit: 50 }),
};

export const faqsApi = {
  list: (category?: string) =>
    get<{ data: FAQ[]; total: number }>('/api/faqs', { isActive: 'true', limit: 100, ...(category ? { category } : {}) }),
};

export const testimonialsApi = {
  list: () =>
    get<{ data: Testimonial[]; total: number }>('/api/testimonials', { isActive: 'true', limit: 20 }),
};

export const promotionsApi = {
  list: () =>
    get<{ data: Promotion[]; total: number }>('/api/promotions', { isActive: 'true', limit: 20 }),
};

export const settingsApi = {
  getAll: () => get<Record<string, string>>('/api/settings'),
};

export const contactApi = {
  send: (data: ContactForm) => post<{ success: boolean; message: string }>('/api/contacts/contact', data),
};

export const formApi = {
  submit: (data: FormSubmitData) => post<{ success: boolean; message: string }>('/api/forms/submit', data),
  seminar: (data: SeminarForm) => post<{ success: boolean; message: string }>('/api/forms/seminar', data),
};

// Types
export interface School {
  id: number;
  slug: string;
  nameEn: string;
  nameTh: string | null;
  city: string | null;
  rating: string | null;
  logoUrl: string | null;
  heroImageUrl: string | null;
  description: string | null;
  descriptionTh: string | null;
  highlights: string[] | null;
  facilities: string[] | null;
  programs: string[] | null;
  photos: string[] | null;
  tags: string[] | null;
  isFeatured: boolean;
  isActive: boolean;
}

export interface Course {
  id: number;
  slug: string;
  titleEn: string;
  titleTh: string | null;
  description: string | null;
  descriptionTh: string | null;
  duration: string | null;
  price: string | null;
  badge: string | null;
  colorClass: string | null;
  isActive: boolean;
}

export interface FAQ {
  id: number;
  question: string;
  questionTh: string | null;
  answer: string;
  answerTh: string | null;
  category: string | null;
  sortOrder: number;
}

export interface Testimonial {
  id: number;
  name: string;
  nameTh: string | null;
  school: string | null;
  course: string | null;
  scoreBefore: string | null;
  scoreAfter: string | null;
  rating: number | null;
  review: string | null;
  reviewTh: string | null;
  avatarUrl: string | null;
  initials: string | null;
  isFeatured: boolean;
}

export interface Promotion {
  id: number;
  titleEn: string;
  titleTh: string | null;
  description: string | null;
  descriptionTh: string | null;
  discountText: string | null;
  expiresAt: string | null;
  imageUrl: string | null;
  isFeatured: boolean;
  isActive: boolean;
}

export interface ContactForm {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  source?: string;
}

export interface FormSubmitData {
  type: 'apply' | 'consult' | 'quotation' | 'scholarship';
  name: string;
  email: string;
  phone?: string;
  schoolInterest?: string;
  programInterest?: string;
  startDate?: string;
  duration?: string;
  budget?: string;
  message?: string;
}

export interface SeminarForm {
  name: string;
  email: string;
  phone?: string;
  school?: string;
  lineId?: string;
  message?: string;
}

export interface GalleryImage {
  id: number;
  imageUrl: string;
  titleTh?: string | null;
  title?: string | null;
  category?: string | null;
  isActive: boolean;
  sortOrder: number;
}

export const galleryApi = {
  list: () =>
    get<{ data: GalleryImage[]; total: number }>('/api/gallery', {
      isActive: 'true',
      limit: '30',
    }),
};
