/** Video attached to a school — YouTube or direct upload */
export interface SchoolVideo {
  id: string;
  type: 'youtube' | 'upload';
  url: string;        // YouTube full URL (or ID) OR /api/storage/objects/... serve URL
  youtubeId?: string; // extracted YouTube ID for thumbnail
  title?: string;
  titleTh?: string;
}

/** Facility photo item */
export interface PricingFacilityItem {
  id: string;
  labelTh: string;
  label: string;
  emoji: string;
  photoUrl: string;
  descriptionTh?: string;
}

/** Structured pricing config stored per school */
export interface PricingCourseOption {
  id: string;
  name: string;
  nameTh: string;
  pricePerFourWeeks: number; // USD
}

export interface PricingRoomOption {
  id: string;
  name: string;
  nameTh: string;
  pricePerFourWeeks: number; // USD
}

export type PromoDiscountType = 'perFourWeeks' | 'percent' | 'fixedThb';

export interface PricingPromoDiscount {
  enabled: boolean;
  /** How the discount is calculated */
  discountType?: PromoDiscountType;
  /** USD deducted per 4-week block (type=perFourWeeks) */
  discountPerFourWeeks: number;
  /** % off the full subtotal (type=percent) */
  discountPercent?: number;
  /** Fixed THB deducted (type=fixedThb) */
  discountFixedThb?: number;
  minWeeks: number;
  label: string;
  promoCode?: string;
}

export interface PricingConfig {
  enrollmentFee: number; // USD
  courses: PricingCourseOption[];
  rooms: PricingRoomOption[];
  /** Local fees by number of weeks (PHP) */
  localFeesByWeek: Record<string, number>;
  promoDiscount: PricingPromoDiscount;
  durationOptions: number[]; // e.g. [4, 8, 12, 16, 20, 24]
  /** Override global exchange rate for this school */
  exchangeRateUsdThb?: number;
  exchangeRatePhpThb?: number;
  /** Facility photos (rich) */
  facilityPhotos?: PricingFacilityItem[];
  /** Videos (YouTube or uploaded) */
  videos?: SchoolVideo[];
}
