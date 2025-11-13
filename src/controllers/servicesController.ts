import { NextFunction, Response, Request } from "express";
import { ServicesLogic } from "../services/service-parts/serices.logic";
import { ServiceError, ServiceNotFoundError } from "../errors/services.error";

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
  async getServiceBySlug (req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const service = await this.servicesLogic.getServiceBySlug(slug);
      return res.json({
        data: service,
        message: "service fetched successfully",
      });
    } catch (error) {
      next(error);
    }
  }
  async isValidOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { order } = req.query;
      if (typeof Number(order) !== "number" || isNaN(Number(order)))
        throw new ServiceNotFoundError("order is not valid");
      const isValidOrder = await this.servicesLogic.isValidOrder({
        order: Number(order),
      });
      return res.json({
        data: {
          isValid: isValidOrder.isValid,
          takenBy: isValidOrder.takenby,
        },
        message: "checked order successfully",
      });
    } catch (error) {
      next(error);
    }
  }
  async createService(req: Request, res: Response, next: NextFunction) {
    try {
  
      const data = req.body;
      // name
      // slug
      // description
      // richDescription
      // price
      // order
      // isActive
      // isFeatured
      // icon
      // image
      // iconImage
      console.log({
     
        ...data,
        isActive: data.isActive === "true" ? true : false,
        isFeatured: data.isFeatured === "true" ? true : false,
        order: Number(data.order) || 0,
        icon: data.icon || "",
        // iconImage: req.files || "",
         image:  Array.isArray(req.files) && req.files.length > 0 ? req.files.find((f)=> f.fieldname === "image")?.buffer  : null,
        iconImage:  Array.isArray(req.files) && req.files.length > 0 ? req.files.find((f)=> f.fieldname === "iconImage")?.buffer : null

      
       
      });

      const newService = await this.servicesLogic.createService({
        ...data,
        isActive: data.isActive === "true" ? true : false,
        isFeatured: data.isFeatured === "true" ? true : false,
        order: Number(data.order) || 0,
        icon: data.icon || "",
   
         image:  Array.isArray(req.files) && req.files.length > 0 ? req.files.find((f)=> f.fieldname === "image")?.buffer  : null,
        iconImage:  Array.isArray(req.files) && req.files.length > 0 ? req.files.find((f)=> f.fieldname === "iconImage")?.buffer : null

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
      console.log("id3m[fom3[mf]] ", id);
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

  async SearchServices(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;
      if (!q || typeof q !== "string")
        throw new ServiceError("search query is required" , 400, "SEARCH_QUERY_REQUIRED");
      console.log("q", q);
      const services = await this.servicesLogic.Search(q);
      if (!services) throw new ServiceNotFoundError("error searching services");
      return res.json({
        data: services,
        message: "services searched successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
