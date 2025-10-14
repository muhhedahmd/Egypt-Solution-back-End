import type { SlideShow as slideShowType, Image , CompositionType , SlideshowType, ServiceSlideShow, ClientSlideShow, ProjectSlideShow, TestimonialSlideShow, TeamSlideShow, Prisma } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

type slideShowWithImage = slideShowType & {
  Image: Image | null;
};
export interface IslideShow extends slideShowWithImage {}
export interface IslideShowRepositoryCreateResponse {
  Image: Image | null;
  slideShow: slideShowType;
}
export interface PaginationDTO {
  skip: number;
  take: number;
}
export interface CreateslideShowDTO {
  title: string;
  slug: string;
  description?: string;
  type: SlideshowType,
  composition: CompositionType
  background?: string;
  isActive?: boolean;
  autoPlay?: boolean;
  interval?: number;
  order?: number;
}

export interface UpdateslideShowDTO {
  slideShowId: string;
  title?: string;
  slug?: string;
  description?: string;
  type?: SlideshowType
  composition?: CompositionType
  background?: string;
  isActive?: boolean;
  autoPlay?: boolean;
  interval?: number;
  order?: number;
}

export interface AttachServiceDTO {
  slideShowId: string;
  serviceId: string;
  order?: number;
  isVisible?: boolean;
  customTitle?: string;
  customDesc?: string;
}

export interface AttachProjectDTO {
  slideShowId: string;
  projectId: string;
  order?: number;
  isVisible?: boolean;
}

export interface AttachClientDTO {
  slideShowId: string;
  clientId: string;
  order?: number;
  isVisible?: boolean;
}

export interface AttachTestimonialDTO {
  slideShowId: string;
  testimonialId: string;
  order?: number;
  isVisible?: boolean;
}

export interface AttachTeamDTO {
  slideShowId: string;
  teamId: string;
  order?: number;
  isVisible?: boolean;
}

export interface BulkAttachDTO {
  slideShowId: string;
  items: Array<{
    type: slideShowType
    id: string;
    order?: number;
    isVisible?: boolean;
    customTitle?: string;
    customDesc?: string;
  }>;
}

export interface ReorderItemsDTO {
  slideShowId: string;
  items: Array<{
    id: string;
    order: number;
  }>;
}

export interface DetachItemDTO {
  slideShowId: string;
  itemId: string;
  itemType: slideShowType
}

export interface AttachItemsDTO extends AttachServiceDTO, AttachProjectDTO, AttachClientDTO, AttachTestimonialDTO, AttachTeamDTO {}

export type AttachmentTypes =  ServiceSlideShow | ClientSlideShow | ProjectSlideShow | TestimonialSlideShow | TeamSlideShow;
export type modelMap = {
  service: Prisma.ServiceDelegate<DefaultArgs, Prisma.PrismaClientOptions>;
  project: Prisma.ProjectDelegate<DefaultArgs, Prisma.PrismaClientOptions>;
  client: Prisma.ClientDelegate<DefaultArgs, Prisma.PrismaClientOptions>;
  teamMember: Prisma.TeamMemberDelegate<
    DefaultArgs,
    Prisma.PrismaClientOptions
  >;
  testimonial: Prisma.TestimonialDelegate<
    DefaultArgs,
    Prisma.PrismaClientOptions
  >;
};