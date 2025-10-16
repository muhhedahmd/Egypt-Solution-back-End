
// ==================== PROJECT TYPES ====================

import { ProjectStatus } from "@prisma/client";
import prisma from "../config/prisma";


export interface CreateProjectDTO {
  title: string;
  description?: string;
  richDescription: string;
  clientName?: string;
  clientCompany?: string;
  projectUrl?: string;
  githubUrl?: string;
  status?: ProjectStatus;
  startDate?: string | Date;
  endDate?: string | Date;
  image?: Buffer;
  isFeatured?: boolean;
  order?: number;
  technologyIds?: string[];
  serviceIds?: string[];
  slideShowIds?: string[];
}

export interface UpdateProjectDTO {
id : string
  title?: string;
  description?: string;
  richDescription?: string;
  clientName?: string;
  clientCompany?: string;
  projectUrl?: string;
  githubUrl?: string;
  status?: ProjectStatus;
  startDate?: string | Date;
  endDate?: string | Date;
  image?: Buffer;
  imageState?: "KEEP" | "REMOVE" | "UPDATE";
  slug?: string;
  isFeatured?: boolean;
  order?: number;
  technologyIds?: string[];
}

export interface ProjectDTO {
  id: string;
  title: string;
  slug: string;
  description?: string;
  richDescription?: string;
  clientName?: string;
  clientCompany?: string;
  projectUrl?: string;
  githubUrl?: string;
  status: ProjectStatus;
  startDate?: Date;
  endDate?: Date;
  imageId?: string;
  isFeatured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== TECHNOLOGY TYPES ====================

export interface CreateTechnologyDTO {
  name: string;
  icon?: string;
  category?: string;
}

export interface UpdateTechnologyDTO {
  name?: string;
  slug?: string;
  icon?: string;
  category?: string;
}

export interface TechnologyDTO {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface ProjectWithTechnologiesDTO {
    projectId: string;
    technologyId: string;
}

export interface TechnologyWithProjectsDTO extends TechnologyDTO {
  projects: ProjectDTO[];
}

