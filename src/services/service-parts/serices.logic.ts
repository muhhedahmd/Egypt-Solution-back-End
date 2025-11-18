import slugify from "slugify";
import { randomUUID } from "crypto";
import { ServicesRepository } from "./services.Repository";
import { ServicesValidator } from "../../validtation/services-schema";

import {
  CreateServiceDTO,
  IService,
  IServiceRepositoryCreateResponse,
  PaginatedResponse,
  PaginationParams,
  updateService,
} from "../../types/services";
import {
  ServiceError,
  ServiceNotFoundError,
} from "../../errors/services.error";

export class ServicesLogic {
  constructor(
    private repository: ServicesRepository,
    private validator: ServicesValidator
  ) {}

  async isValidOrder({ order }: { order: number }) {
    const isValid = await this.repository.isValidOrder({
      order,
    });
    return isValid;
  }
  async getAllServices(
    params: PaginationParams
  ): Promise<PaginatedResponse<IService>> {
    const skip = params.skip || 0;
    const take = params.take || 10;

    const [services, totalItems] = await Promise.all([
      this.repository.findMany(skip, take),
      this.repository.count(),
    ]);
    const remainingItems = totalItems - (skip * take + services.length);

    return {
      data : (services as any),
      pagination: {
        totalItems,
        remainingItems,
        nowCount: services.length,
        totalPages: Math.ceil(totalItems / take),
        currentPage: skip + 1,
        pageSize: take,
      },
    };
  }

  async getServiceById(id: string): Promise<any> {
    console.log({
      id,
    });
    this.validator.validateId(id);
    const service = await this.repository.findById(id);
    if (!service) {
      throw new ServiceNotFoundError(id);
    }
    const { image, ...rest } = service;
    return {
      Image: image,
      service: rest,
    };
  }

  async getServiceBySlug(
    slug: string
  ): Promise<Awaited<ReturnType<typeof this.repository.findBySlug>>> {
    this.validator.validateSlug(slug);
    const service = await this.repository.findBySlug(slug);
    if (!service) {
      throw new ServiceError(
        `service with slug not found ${slug} `,
        404,
        "SERVICE_NOT_FOUND"
      );
    }
    return service;
  }

  async createService(
    data: CreateServiceDTO
  ): Promise<IServiceRepositoryCreateResponse> {
    const valid = this.validator.validateCreate(data);
    const slug = slugify(data.name + randomUUID().substring(0, 8), {
      lower: true,
    });
    const serices = await this.repository.create({
      ...valid,
      slug: slug,
    });
    if (!serices) throw new Error("error create services");
    return serices;
  }

  async deleteService(serviceId: string) {
    try {
      if (!serviceId) throw new Error("id is required");
      this.validator.validateId(serviceId);
      const deletedService = await this.repository.delete(serviceId);
      if (!deletedService) throw new Error("error deleting service");
      return deletedService;
    } catch (error) {
      console.log(error);
      throw new Error("Error deleting service");
    }
  }
  async Search(q: string) {
    if (!q)
      throw new ServiceError(
        "search query is required",
        400,
        "SEARCH_QUERY_REQUIRED"
      );
    const services = await this.repository.SearchService(q, 0, 10);
    if (!services)
      throw new ServiceError(
        "error searching services",
        400,
        "ERROR_SEARCHING_SERVICES"
      );
    return services;
  }
  async updateService(data: updateService) {
    this.validator.validateUpdate(data);
    const updatedService = await this.repository.update(data);
    if (!updatedService)
      throw new ServiceError(
        "error updating service",
        400,
        "ERROR_UPDATING_SERVICE"
      );
    const { Image, ...rest } = updatedService;
    return { Image, ...rest };
  }
}
