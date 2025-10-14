import { NextFunction, Response, Request } from "express";
import { ServicesLogic } from "../services/service-parts/serices.logic";
import {
  ServiceNotFoundError,
  ServiceUpdateError,
} from "../errors/services.error";
import { ServicesValidator } from "../validtation/services-schema";
import { requireAuth } from "../middlewares/auth";

export class ServicesController {
  private servicesLogic: ServicesLogic;
  constructor(servicesLogic: ServicesLogic) {
    this.servicesLogic = servicesLogic;
  }

  // Add methods to handle services-related operations here // pagniate
  async getAllServices(req: Request, res: Response, next: NextFunction) {
    try {
      const { skip, take } = req.query;

      const services = await this.servicesLogic.getAllServices({
        skip: Number(skip) || 0,
        take: Number(take) || 10,
      });
      if (!services) throw new ServiceNotFoundError("error get services");

      return res.json({
        data: services,
        message: "services fetched successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getServiceById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new ServiceNotFoundError("id is required");
      const service = await this.servicesLogic.getServiceById(id);
      return res.json({
        data: service,
        message: "service fetched successfully",
      });
    } catch (error) {
      next(error);
    }
  }
  async createService(req: Request, res: Response, next: NextFunction) {
    try {
      const image =
        Array.isArray(req.files) && req.files.length > 0
          ? req.files[0].buffer
          : null;

      const data = req.body;
      const newService = await this.servicesLogic.createService({
        ...data,
        isActive: data.isActive === "true" ? true : false,
        isFeatured: data.isFeatured === "true" ? true : false,
        order: Number(data.order) || 0,
        icon: data.icon || "",
        image,
      });

      return res.status(201).json({
        data: newService,
        message: "service created successfully",
      });
    } catch (error) {
      next(error);
    }
  }
  async updateService(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const serviceData = req.body;
      const data = {
        ...serviceData,
        serviceId: id,
        image:
          Array.isArray(req.files) && req.files.length > 0
            ? req?.files[0]?.buffer
            : undefined,
        imageState: serviceData?.imageState as
          | "KEEP"
          | "REMOVE"
          | "UPDATE"
          | undefined,
      };
      const updatedService = await this.servicesLogic.updateService({
        ...data,
        isActive: data.isActive === "true" ? true : false,
        isFeatured: data.isFeatured === "true" ? true : false,
        order: Number(data.order) || 0,
        icon: data.icon || "",
      });
      
      return res.json({
        data: updatedService,
        message: "service updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteService(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new ServiceNotFoundError("id is required");
      const deletedService = await this.servicesLogic.deleteService(id);
      if (!deletedService)
        throw new ServiceNotFoundError("error deleting service");
      return res.json({
        data: deletedService,
        message: "service deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
