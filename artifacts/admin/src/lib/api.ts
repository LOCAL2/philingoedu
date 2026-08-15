const API_URL = '';

function getToken(): string | null {
  return localStorage.getItem('philingo_admin_token');
}

function clearToken() {
  localStorage.removeItem('philingo_admin_token');
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    clearToken();
    window.location.href = import.meta.env.BASE_URL || '/admin/';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || err.message || `HTTP ${res.status}`);
  }

  // Handle 204 no content
  if (res.status === 204) return undefined as T;

  return res.json();
}

// Generic API helper (for pages that need ad-hoc calls)
export const api = {
  get: <T>(path: string) => request<T>(`/api${path}`),
  post: <T>(path: string, body: unknown) => request<T>(`/api${path}`, { method: 'POST', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(`/api${path}`, { method: 'DELETE' }),
  patch: <T>(path: string, body: unknown) => request<T>(`/api${path}`, { method: 'PATCH', body: JSON.stringify(body) }),
};

// Newsletter
export interface PhilingoEvent {
  id: number;
  titleTh: string; title: string | null;
  descriptionTh: string | null; description: string | null;
  eventDate: string | null; eventTime: string | null;
  venueTh: string | null; venue: string | null;
  meetUrl: string | null; imageUrl: string | null;
  eventType: string | null;
  ctaTextTh: string | null; ctaUrl: string | null;
  seatsTotal: number | null; seatsRemaining: number | null;
  isFeatured: boolean; isActive: boolean; sortOrder: number;
  createdAt: string; updatedAt: string;
}
export const eventsApi = crudApi<PhilingoEvent>('events');

export interface EventRegistration {
  id: number; eventId: number;
  name: string; email: string | null; phone: string | null; lineId: string | null; note: string | null;
  emailSent: boolean; registeredAt: string;
}
export const eventRegistrationsApi = {
  list: (eventId: number) => request<{ data: EventRegistration[]; total: number }>(`/api/events/${eventId}/registrations`),
  delete: (eventId: number, id: number) => request<void>(`/api/events/${eventId}/registrations/${id}`, { method: 'DELETE' }),
};

export const newsletterApi = {
  getSubscribers: (params?: { page?: number }) =>
    request<{ data: NewsletterSubscriber[]; total: number }>(`/api/newsletter/subscribers?page=${params?.page ?? 1}`),
  addSubscriber: (data: { email: string; name?: string; phone?: string; lineId?: string }) =>
    request(`/api/newsletter/subscribers`, { method: 'POST', body: JSON.stringify(data) }),
  deleteSubscriber: (id: number) =>
    request(`/api/newsletter/subscribers/${id}`, { method: 'DELETE' }),
  importSubscribers: () =>
    request<{ imported: number; total: number }>(`/api/newsletter/import`, { method: 'POST', body: '{}' }),
  getCampaigns: () => request<any[]>(`/api/newsletter/campaigns`),
  send: (data: { subject: string; body: string }) =>
    request<{ sent: number; failed: number; campaignId: number }>(`/api/newsletter/send`, { method: 'POST', body: JSON.stringify(data) }),
  sendLine: (data: { message: string }) =>
    request<{ success: boolean; broadcastSent: boolean; lineCount: number; lineIds: { name: string | null; lineId: string | null }[] }>(
      `/api/newsletter/send-line`, { method: 'POST', body: JSON.stringify(data) }
    ),
};

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    request<{ token: string; user: AdminUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<AdminUser>('/api/auth/me'),
  logout: () => request<void>('/api/auth/logout', { method: 'POST' }),
};

// Dashboard
export const dashboardApi = {
  stats: () => request<DashboardStats>('/api/dashboard/stats'),
  recent: () => request<DashboardRecent>('/api/dashboard/recent'),
};

// Generic CRUD factory
function crudApi<T>(resource: string) {
  return {
    list: (params?: Record<string, string | number>) => {
      const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
      return request<{ data: T[]; total: number }>(`/api/${resource}${qs}`);
    },
    get: (id: number | string) => request<T>(`/api/${resource}/${id}`),
    create: (data: unknown) =>
      request<T>(`/api/${resource}`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number | string, data: unknown) =>
      request<T>(`/api/${resource}/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: number | string) =>
      request<void>(`/api/${resource}/${id}`, { method: 'DELETE' }),
  };
}

export const schoolsApi = crudApi<School>('schools');
export const coursesApi = crudApi<Course>('courses');
export const blogApi = crudApi<BlogPost>('blog');
export const faqsApi = crudApi<FAQ>('faqs');
export const testimonialsApi = crudApi<Testimonial>('testimonials');
export const promotionsApi = crudApi<Promotion>('promotions');
export const bannersApi = crudApi<Banner>('banners');
export const partnersApi = crudApi<Partner>('partners');
export const galleryApi = crudApi<GalleryItem>('gallery');
export const teamApi = crudApi<TeamMember>('team');

export const contactsApi = {
  list: (params?: Record<string, string | number>) => {
    const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return request<{ data: Contact[]; total: number }>(`/api/contacts${qs}`);
  },
  get: (id: number) => request<Contact>(`/api/contacts/${id}`),
  updateStatus: (id: number, status: string, adminNotes?: string) =>
    request<Contact>(`/api/contacts/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, adminNotes }),
    }),
};

export interface SeminarRegistration {
  id: number;
  eventName: string;
  name: string;
  email: string;
  phone: string;
  schoolInterest: string | null;
  programInterest: string | null;
  numParticipants: string | null;
  specialRequests: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: string;
}

export const formsApi = {
  list: (params?: Record<string, string | number>) => {
    const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return request<{ data: FormSubmission[]; total: number }>(`/api/forms${qs}`);
  },
  get: (id: number) => request<FormSubmission>(`/api/forms/${id}`),
  updateStatus: (id: number, status: string) =>
    request<FormSubmission>(`/api/forms/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  listSeminars: (params?: Record<string, string | number>) => {
    const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return request<{ data: SeminarRegistration[]; total: number }>(`/api/forms/seminars${qs}`);
  },
};

export const settingsApi = {
  get: () => request<Record<string, string>>('/api/settings'),
  saveBatch: (settings: Record<string, string>) =>
    request<void>('/api/settings/batch', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),
};

// Types
export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface DashboardStats {
  totalSchools: number;
  totalCourses: number;
  blogPosts: number;
  newContacts7d: number;
  newForms7d: number;
}

export interface DashboardRecent {
  contacts: Contact[];
  forms: FormSubmission[];
  submissionsPerDay: { date: string; count: number }[];
}

export interface PricingCourseOption { id: string; name: string; nameTh: string; pricePerFourWeeks: number; }
export interface PricingRoomOption {
  id: string; name: string; nameTh: string; pricePerFourWeeks: number;
  /** Photo URLs (one per line in admin editor) */
  photos?: string[];
  capacity?: number;
  bedConfig?: string;
  size?: string;
  bathroom?: 'private' | 'shared';
  amenities?: string[];
  description?: string;
}
export interface PricingFacilityItem {
  id: string; labelTh: string; label: string; emoji: string;
  photoUrl: string; descriptionTh?: string;
}
export interface PromoRule {
  id: string;
  label: string;
  enabled: boolean;
  /** Empty = applies to ALL courses */
  courseIds: string[];
  /** Empty = applies to ALL rooms */
  roomIds: string[];
  minWeeks: number;
  discountType: 'percent' | 'fixedThb' | 'perFourWeeksUsd';
  discountValue: number;
  promoCode?: string;
  /** ISO date "YYYY-MM-DD" — promotion valid from this date (inclusive) */
  validFrom?: string;
  /** ISO date "YYYY-MM-DD" — promotion expires after this date; not applied if today > validUntil */
  validUntil?: string;
}

export interface PricingConfig {
  enrollmentFee: number;
  courses: PricingCourseOption[];
  rooms: PricingRoomOption[];
  localFeesByWeek: Record<string, number>;
  promoDiscount: { enabled: boolean; discountPerFourWeeks: number; minWeeks: number; label: string; };
  /** Per-course / per-room / per-duration promotion rules (uploaded via file or set manually) */
  promoRules?: PromoRule[];
  durationOptions: number[];
  exchangeRateUsdThb?: number;
  exchangeRatePhpThb?: number;
  /** Facility photo URLs editable from admin */
  facilityPhotos?: PricingFacilityItem[];
}

export interface School {
  id: number;
  slug: string;
  name: string;
  nameEn: string;
  nameTh: string;
  city: string;
  rating: number;
  logoUrl: string | null;
  tagline: string | null;
  taglineTh: string | null;
  websiteUrl: string | null;
  youtubeId: string | null;
  mapUrl: string | null;
  descriptionTh: string | null;
  highlights: string[];
  tags: string[];
  featured: boolean;
  isFeatured: boolean;
  isActive: boolean;
  pricingConfig: PricingConfig | null;
  timetableConfig: Record<string, unknown> | null;
  // SEO fields (per-school)
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  seoH1Override: string | null;
  seoMarketingMeta: string | null;
  createdAt: string;
}

export interface Course {
  id: number;
  slug: string;
  title: string;
  titleTh: string;
  titleEn?: string;
  descriptionTh: string | null;
  duration: string | null;
  durationTh: string | null;
  suitableFor: string | null;
  suitableForTh: string | null;
  priceDisplay: string | null;
  priceDisplayTh: string | null;
  colorClass: string | null;
  iconName: string | null;
  badge: string | null;
  badgeTh: string | null;
  price: number | null;
  features: string[] | null;
  schoolSlug: string | null;
  timetableConfig: {
    tag?: string;
    slots?: Array<{ time: string; activity: string; type: string }>;
    rules?: string[];
    note?: string;
  } | null;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface BlogPost {
  id: number;
  title: string;
  titleTh: string;
  slug: string;
  category: string | null;
  author: string | null;
  authorTh: string | null;
  excerpt: string | null;
  excerptTh: string | null;
  content: string | null;
  contentTh: string | null;
  coverImageUrl: string | null;
  tags: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  publishedAt: string | null;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface FAQ {
  id: number;
  questionTh: string;
  questionEn: string | null;
  answerTh: string;
  answerEn: string | null;
  category: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface Testimonial {
  id: number;
  nameEn: string;
  nameTh: string | null;
  school: string | null;
  rating: number;
  contentTh: string | null;
  contentEn: string | null;
  avatarUrl: string | null;
  featured: boolean;
  isActive: boolean;
}

export interface Promotion {
  id: number;
  title: string;
  titleTh: string;
  titleEn: string | null;
  descriptionTh: string | null;
  originalPriceTh: string | null;
  discountPriceTh: string | null;
  seatsRemaining: number | null;
  bonusTh: string | null;
  discountPercent: number | null;
  expiresAt: string | null;
  imageUrl: string | null;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface NewsletterSubscriber {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  lineId: string | null;
  source: string;
  isActive: string;
  createdAt: string;
}

export interface Banner {
  id: number;
  title: string | null;
  titleTh: string | null;
  subtitle: string | null;
  subtitleTh: string | null;
  ctaText: string | null;
  ctaTextTh: string | null;
  ctaUrl: string | null;
  imageUrl: string;
  linkUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface Partner {
  id: number;
  name: string;
  logoUrl: string | null;
  partnerType: string | null;
  websiteUrl: string | null;
  isActive: boolean;
}

export interface GalleryItem {
  id: number;
  imageUrl: string;
  titleTh: string | null;
  titleEn: string | null;
  category: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface TeamMember {
  id: number;
  nameEn: string;
  nameTh: string | null;
  role: string | null;
  avatarUrl: string | null;
  bio: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: string;
  adminNotes: string | null;
  createdAt: string;
}

export interface FormSubmission {
  id: number;
  formType: string;
  name: string;
  email: string;
  phone: string | null;
  schoolInterest: string | null;
  status: string;
  data: Record<string, unknown>;
  createdAt: string;
}
