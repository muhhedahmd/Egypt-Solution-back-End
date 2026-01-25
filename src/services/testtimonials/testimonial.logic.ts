import { TestimonialRepository } from "./testimonial.repostery";
import { TestimonialValidator } from "../../errors/schema/testimonal.validation.schema";
import {
  CreateTestimonialDTO,
  ITestimonial,
  ITestimonialRepositoryCreateResponse,
  PaginatedResponse,
  PaginationParams,
  UpdateTestimonial,
} from "../../types/testimonal";
import {
  TestimonialError,
  TestimonialNotFoundError,
} from "../../errors/testimonal.error";

export class TestimonialLogic {
  constructor(
    private repository: TestimonialRepository,
    private validator: TestimonialValidator,
  ) {}

  async isValidOrder({ order }: { order: number }) {
    const isValid = await this.repository.isValidOrder({ order });
    return isValid;
  }

  async getAllTestimonials(
    params: PaginationParams,
  ): Promise<PaginatedResponse<ITestimonial>> {
    const skip = params.skip || 0;
    const take = params.take || 10;

    const [testimonials, totalItems] = await Promise.all([
      this.repository.findMany(skip, take),
      this.repository.count(),
    ]);

    const remainingItems = totalItems - (skip * take + testimonials.length);

    return {
      data: testimonials as any,
      pagination: {
        totalItems,
        remainingItems,
        nowCount: testimonials.length,
        totalPages: Math.ceil(totalItems / take),
        currentPage: skip + 1,
        pageSize: take,
      },
    };
  }

  async getTestimonialById(id: string): Promise<any> {
    this.validator.validateId(id);
    const testimonial = await this.repository.findById(id);
    if (!testimonial) {
      throw new TestimonialNotFoundError(id);
    }
    // const  = testimonial;
    return  testimonial
  }

  async createTestimonial(
    lang: "EN" | "AR",
    data: CreateTestimonialDTO,
  ): Promise<ITestimonialRepositoryCreateResponse> {
    const valid = this.validator.validateCreate(data);
    const testimonial = await this.repository.create(lang, valid);
    if (!testimonial) throw new Error("error create testimonial");
    return testimonial;
  }

  async deleteTestimonial(testimonialId: string) {
    try {
      if (!testimonialId) throw new Error("id is required");
      this.validator.validateId(testimonialId);
      const deletedTestimonial = await this.repository.delete(testimonialId);
      if (!deletedTestimonial) throw new Error("error deleting testimonial");
      return deletedTestimonial;
    } catch (error) {
      console.error(error);
      throw new Error("Error deleting testimonial");
    }
  }

  async Search(lang: "EN" | "AR", q: string) {
    if (!q)
      throw new TestimonialError(
        "search query is required",
        400,
        "SEARCH_QUERY_REQUIRED",
      );
    const testimonials = await this.repository.SearchTestimonial(
      lang,
      q,
      0,
      10,
    );
    if (!testimonials)
      throw new TestimonialError(
        "error searching testimonials",
        400,
        "ERROR_SEARCHING_TESTIMONIALS",
      );
    return testimonials;
  }

  async updateTestimonial(lang: "EN" | "AR", data: UpdateTestimonial) {
    this.validator.validateUpdate(data);
    const updatedTestimonial = await this.repository.update(lang, data);
    if (!updatedTestimonial)
      throw new TestimonialError(
        "error updating testimonial",
        400,
        "ERROR_UPDATING_TESTIMONIAL",
      );
    const { Avatar, ...rest } = updatedTestimonial;
    return { Avatar, ...rest };
  }
}
