
export interface ITeamMember {
  id: string;
  name: string;
  slug: string;
  position: string;
  bio?: string | null;
  email?: string | null;
  phone?: string | null;
  imageId?: string | null;
  linkedin?: string | null;
  github?: string | null;
  twitter?: string | null;
  isActive: boolean;
  isFeatured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTeamMemberDTO {
  name: string;
  position: string;
  bio?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  order?: number;
  image?: Buffer;
}

export interface UpdateTeamMember {
  teamId: string;
  name?: string;
  slug?: string;
  position?: string;
  bio?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  order?: number;
  image?: Buffer;
  imageState?: 'KEEP' | 'REMOVE' | 'UPDATE';
}

export interface ITeamMemberRepositoryCreateResponse {
  Image: {
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
  teamMember: Omit<ITeamMember, 'image'>;
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

export interface InterFaceSearchTeamMember {
  id: string;
  name: string;
  slug: string;
  position: string;
  bio?: string | null;
  email?: string | null;
  phone?: string | null;
  linkedin?: string | null;
  github?: string | null;
  twitter?: string | null;
  isActive: boolean;
  isFeatured: boolean;
  order: number;
  image?: {
    id: string;
    url: string;
    alt?: string | null;
    blurHash?: string | null;
  } | null;
}