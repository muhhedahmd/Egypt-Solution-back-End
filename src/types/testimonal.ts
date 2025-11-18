export interface ITestimonial {
  id: string;
  clientName: string;
  clientPosition?: string | null;
  clientCompany?: string | null;
  content: string;
  rating: number;
  avatarId?: string | null;
  isActive: boolean;
  isFeatured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTestimonialDTO {
  clientName: string;
  clientPosition?: string;
  clientCompany?: string;
  content: string;
  rating?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  order?: number;
  avatar?: Buffer;
}

export interface UpdateTestimonial {
  testimonialId: string;
  clientName?: string;
  clientPosition?: string;
  clientCompany?: string;
  content?: string;
  rating?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  order?: number;
  avatar?: Buffer;
  avatarState?: 'KEEP' | 'REMOVE' | 'UPDATE';
}

export interface ITestimonialRepositoryCreateResponse {
  Avatar: {
    id: string;
    filename: string;
    url: string;
    alt?: string | null;
    size?: number | null;
    width?: number | null;
    height?: number | null;
    blurHash?: string | null;
    fileHash: string;
    key: string;
    imageType: string;
    type: string;
    customId?: string | null;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  testimonial: Omit<ITestimonial, 'avatar'>;
}

export interface PaginationParams {
  skip?: number;
  take?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    totalItems: number;
    remainingItems: number;
    nowCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

export interface InterFaceSearchTestimonial {
  id: string;
  clientName: string;
  clientPosition?: string | null;
  clientCompany?: string | null;
  content: string;
  rating: number;
  isActive: boolean;
  isFeatured: boolean;
  order: number;
  avatar?: {
    id: string;
    url: string;
    alt?: string | null;
    blurHash?: string | null;
  } | null;
}