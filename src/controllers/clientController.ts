import { NextFunction, Response, Request } from 'express';
import { ClientLogic } from '../services/client/client.logic';
import { ClientError, ClientNotFoundError } from '../errors/client.error';

export class ClientController {
  private clientLogic: ClientLogic;

  constructor(clientLogic: ClientLogic) {
    this.clientLogic = clientLogic;
  }

  async getAllClients(req: Request, res: Response, next: NextFunction) {
    try {
      const { skip, take } = req.query;

      const clients = await this.clientLogic.getAllClients({
        skip: Number(skip) || 0,
        take: Number(take) || 10,
      });

      if (!clients) throw new ClientNotFoundError('error get clients');

      return res.json({
         ...clients,
        message: 'clients fetched successfully',
        success: true
      });
    } catch (error) {
      next(error);
    }
  }

  async getClientById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new ClientNotFoundError('id is required');

      const client = await this.clientLogic.getClientById(id);

      return res.json({
        data: client,
        message: 'client fetched successfully',
        success: true
      });
    } catch (error) {
      next(error);
    }
  }

  async getClientBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const client = await this.clientLogic.getClientBySlug(slug);

      return res.json({
        data: client,
        message: 'client fetched successfully',
        success: true
      });
    } catch (error) {
      next(error);
    }
  }

  async isValidOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { order } = req.query;
      if (typeof Number(order) !== 'number' || isNaN(Number(order)))
        throw new ClientNotFoundError('order is not valid');

      const isValidOrder = await this.clientLogic.isValidOrder({
        order: Number(order),
      });

      return res.json({
        data: {
          isValid: isValidOrder.isValid,
          takenBy: isValidOrder.takenby,
        },
        message: 'checked order successfully',
        success: true
      });
    } catch (error) {
      next(error);
    }
  }

  async createClient(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;

      console.log({
        ...data,
        isActive: data.isActive === 'true' ? true : false,
        isFeatured: data.isFeatured === 'true' ? true : false,
        order: Number(data.order) || 0,
        image:
          Array.isArray(req.files) && req.files.length > 0
            ? req.files.find((f) => f.fieldname === 'image')?.buffer
            : null,
        logo:
          Array.isArray(req.files) && req.files.length > 0
            ? req.files.find((f) => f.fieldname === 'logo')?.buffer
            : null,
      });

      const newClient = await this.clientLogic.createClient({
        ...data,
        isActive: data.isActive === 'true' ? true : false,
        isFeatured: data.isFeatured === 'true' ? true : false,
        order: Number(data.order) || 0,
        image:
          Array.isArray(req.files) && req.files.length > 0
            ? req.files.find((f) => f.fieldname === 'image')?.buffer
            : null,
        logo:
          Array.isArray(req.files) && req.files.length > 0
            ? req.files.find((f) => f.fieldname === 'logo')?.buffer
            : null,
      });

      return res.status(201).json({
        data: newClient,
        message: 'client created successfully',
        success: true
      });
    } catch (error) {
      next(error);
    }
  }

  async updateClient(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const clientData = req.body;

      const files = req.files as Express.Multer.File[] | undefined;

      const data = {
        ...clientData,
        clientId: id,
        image:
          Array.isArray(files) && files.length > 0
            ? files.find((f) => f.fieldname === 'image')?.buffer
            : undefined,
        logo:
          Array.isArray(files) && files.length > 0
            ? files.find((f) => f.fieldname === 'logo')?.buffer
            : undefined,
        imageState: clientData?.imageState as
          | 'KEEP'
          | 'REMOVE'
          | 'UPDATE'
          | undefined,
        logoState: clientData?.logoState as
          | 'KEEP'
          | 'REMOVE'
          | 'UPDATE'
          | undefined,  
      };

      const updatedClient = await this.clientLogic.updateClient({
        ...data,
        isActive: data.isActive === 'true' ? true : data.isActive === 'false' ? false : undefined,
        isFeatured: data.isFeatured === 'true' ? true : data.isFeatured === 'false' ? false : undefined,
        order: data.order ? Number(data.order) : undefined,
      });

      return res.json({
        data: updatedClient,
        message: 'client updated successfully',
        success: true
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteClient(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new ClientNotFoundError('id is required');

      const deletedClient = await this.clientLogic.deleteClient(id);
      if (!deletedClient)
        throw new ClientNotFoundError('error deleting client');

      return res.json({
        data: deletedClient,
        message: 'client deleted successfully',
        success: true
      });
    } catch (error) {
      next(error);
    }
  }

  async SearchClients(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string')
        throw new ClientError(
          'search query is required',
          400,
          'SEARCH_QUERY_REQUIRED'
        );

      const clients = await this.clientLogic.Search(q);
      if (!clients) throw new ClientNotFoundError('error searching clients');

      return res.json({
        data: clients,
        message: 'clients searched successfully',
        success: true
      });
    } catch (error) {
      next(error);
    }
  }
}