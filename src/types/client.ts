

export interface IClient {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  richDescription?: string | null;
  website?: string | null;
  industry?: string | null;
  imageId?: string | null;
  logoId?: string | null;
  isActive: boolean;
  isFeatured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClientDTO {
  name: string;
  description?: string;
  richDescription?: string;
  website?: string;
  industry?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  order?: number;
  image?: Buffer;
  logo?: Buffer;
}

export interface UpdateClient {
  clientId: string;
  name?: string;
  slug?: string;
  description?: string;
  richDescription?: string;
  website?: string;
  industry?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  order?: number;
  image?: Buffer;
  logo?: Buffer;
  imageState?: 'KEEP' | 'REMOVE' | 'UPDATE';
  logoState?: 'KEEP' | 'REMOVE' | 'UPDATE';
}

export interface IClientRepositoryCreateResponse {
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
  Logo: {
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
  client: Omit<IClient, 'image' | 'logo'>;
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

export interface InterFaceSearchClient {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  richDescription?: string | null;
  website?: string | null;
  industry?: string | null;
  isActive: boolean;
  isFeatured: boolean;
  order: number;
  image?: {
    id: string;
    url: string;
    alt?: string | null;
    blurHash?: string | null;
  } | null;
  logo?: {
    id: string;
    url: string;
    alt?: string | null;
    blurHash?: string | null;
  } | null;
}