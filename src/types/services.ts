import { type Service as ServiceType, type Image, ImageType } from "@prisma/client";


export type serviceWithImage = ServiceType & {
  Image: Image | null;
};
export interface IService extends serviceWithImage {
  // pagination: {
  //   totalItems: number;
  //   totalPages: number;
  //   currentPage: number;
  //   pageSize: number;
  // };
}
export interface IServiceRepositoryCreateResponse {
  Image: Image | null;
  service: ServiceType;
}

export interface interFaceSearchService extends ServiceType {
  image: Image | null
  
}
export interface CreateServiceDTO {
  name: string;
  description: string;
  richDescription: string;
  image?: Buffer;
  icon?: string;
  iconImage?: Buffer;
  price?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  order?: number;
}

export interface UpdateServiceDTO {
  name?: string;
  description?: string;
  richDescription?: string;
  image?: Buffer;
}

export interface PaginationParams {
  skip?: number;
  take?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    remainingItems: number;
    nowCount: number;
    pageSize: number;
  };
}

export interface updateService
  extends Partial<
    CreateServiceDTO & {
      imageState: "KEEP" | "REMOVE" | "UPDATE";
      // imageId?: string;
      image?: Buffer;
      serviceId: string;
      slug?: string;
      icon?: string;
      price?: string;
      isActive?: boolean;
      isFeatured?: boolean;
      order?: number;
    }
  > {}
