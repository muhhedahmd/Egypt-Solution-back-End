import { NextFunction, Response, Request } from 'express';
import { TestimonialLogic } from '../services/testtimonials/testimonial.logic';
import { TestimonialError, TestimonialNotFoundError } from '../errors/testimonal.error';


export class TestimonialController {
  private testimonialLogic: TestimonialLogic;

  constructor(testimonialLogic: TestimonialLogic) {
    this.testimonialLogic = testimonialLogic;
  }

  async getAllTestimonials(req: Request, res: Response, next: NextFunction) {
    try {
      const { skip, take } = req.query;

      const testimonials = await this.testimonialLogic.getAllTestimonials({
        skip: Number(skip) || 0,
        take: Number(take) || 10,
      });

      if (!testimonials) throw new TestimonialNotFoundError('error get testimonials');

      return res.json({
        ...testimonials,
        message: 'testimonials fetched successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getTestimonialById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new TestimonialNotFoundError('id is required');

      const testimonial = await this.testimonialLogic.getTestimonialById(id);

      return res.json({
        data: testimonial,
        message: 'testimonial fetched successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async isValidOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { order } = req.query;
      if (typeof Number(order) !== 'number' || isNaN(Number(order)))
        throw new TestimonialNotFoundError('order is not valid');

      const isValidOrder = await this.testimonialLogic.isValidOrder({
        order: Number(order),
      });

      return res.json({
        data: {
          isValid: isValidOrder.isValid,
          takenBy: isValidOrder.takenby,
        },
        message: 'checked order successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async createTestimonial(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;

      console.log({
        ...data,
        isActive: data.isActive === 'true' ? true : false,
        isFeatured: data.isFeatured === 'true' ? true : false,
        rating: Number(data.rating) || 5,
        order: Number(data.order) || 0,
        avatar:
          Array.isArray(req.files) && req.files.length > 0
            ? req.files.find((f) => f.fieldname === 'avatar')?.buffer
            : null,
      });

      const newTestimonial = await this.testimonialLogic.createTestimonial({
        ...data,
        isActive: data.isActive === 'true' ? true : false,
        isFeatured: data.isFeatured === 'true' ? true : false,
        rating: Number(data.rating) || 5,
        order: Number(data.order) || 0,
        avatar:
          Array.isArray(req.files) && req.files.length > 0
            ? req.files.find((f) => f.fieldname === 'avatar')?.buffer
            : null,
      });

      return res.status(201).json({
        data: newTestimonial,
        message: 'testimonial created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTestimonial(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const testimonialData = req.body;

      const files = req.files as Express.Multer.File[] | undefined;

      const data = {
        ...testimonialData,
        testimonialId: id,
        avatar:
          Array.isArray(files) && files.length > 0
            ? files.find((f) => f.fieldname === 'avatar')?.buffer
            : undefined,
        avatarState: testimonialData?.avatarState as
          | 'KEEP'
          | 'REMOVE'
          | 'UPDATE'
          | undefined,
      };

      const updatedTestimonial = await this.testimonialLogic.updateTestimonial({
        ...data,
        isActive: data.isActive === 'true' ? true : data.isActive === 'false' ? false : undefined,
        isFeatured: data.isFeatured === 'true' ? true : data.isFeatured === 'false' ? false : undefined,
        rating: data.rating ? Number(data.rating) : undefined,
        order: data.order ? Number(data.order) : undefined,
      });

      return res.json({
        data: updatedTestimonial,
        message: 'testimonial updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTestimonial(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new TestimonialNotFoundError('id is required');

      const deletedTestimonial = await this.testimonialLogic.deleteTestimonial(id);
      if (!deletedTestimonial)
        throw new TestimonialNotFoundError('error deleting testimonial');

      return res.json({
        data: deletedTestimonial,
        message: 'testimonial deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async SearchTestimonials(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string')
        throw new TestimonialError(
          'search query is required',
          400,
          'SEARCH_QUERY_REQUIRED'
        );

      const testimonials = await this.testimonialLogic.Search(q);
      if (!testimonials) 
        throw new TestimonialNotFoundError('error searching testimonials');

      return res.json({
        data: testimonials,
        message: 'testimonials searched successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}