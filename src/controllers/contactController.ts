import { NextFunction, Request, Response } from "express";
import { ContactLogic } from "../services/contact/contact.logic";
import { ContactError } from "../errors/contact.error";

export class ContactController {
  constructor(private logic: ContactLogic) {}

  async cerateContact(req: Request, res: Response, next: NextFunction) {
    try {
        const body = req.body;
        const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];
      const newContact = await this.logic.create({
        ...body,
        ipAddress,
        userAgent
      });


      return res.status(201).json({
        success: true,
        message: "Contact created successfully",
        data: newContact,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPagnittedContacts(req: Request, res: Response, next: NextFunction) {

    try {
      const { skip, take } = req.query;
      const contacts = await this.logic.getPagnittedMany({
        skip: Number(skip) || 0,
        take: Number(take) || 10,
      });
      return res.status(200).json({
        success: true,
        message: "Contacts fetched successfully",
        ...contacts,
      });
    } catch (error) {
      next(error);
    }
  }
  async getContactById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const contact = await this.logic.getById(id);
      return res.status(200).json({
        success: true,
        message: "Contact fetched successfully",
        data: contact,
      });
    } catch (error) {
      next(error);
    }
  }

  async searchContacts(req: Request, res: Response, next: NextFunction) {

    try {
      const { skip, take, q } = req.query;
      if (typeof q !== "string") {
        throw new ContactError("Query parameter 'q' must be a string");
      }
      const contacts = await this.logic.searchContacts(q , Number(skip) || 0, Number(take) || 10);
      return res.status(200).json({
        success: true,
        message: "Contacts fetched successfully",
        ...contacts,
      });
    } catch (error) {
      next(error);
    }
  }
  async getStats(req: Request, res: Response, next: NextFunction) {
    

    try {
      const stats = await this.logic.getStats()

      return res.status(200).json({
        success: true,
        message: "Contact stats fetched successfully",
        data: stats,
      })
    } catch (error) {
      next(error)
    }
  }

  async multiFilter(req: Request, res: Response, next: NextFunction) {
    
    try {
      const { skip = 0, take = 10 } = req.query
      const { ...filters} = req.body
    
      const filtersTyped: Partial<Record<string, any>> = Object.entries(filters)
        .reduce((acc: Record<string, any>, [key , value ] ) => {
        acc[key as string] = value;
        return acc;
      }, {});

      const result = await this.logic.multiFilter(
        filtersTyped,
        Number(skip),
        Number(take)
      )

      return res.status(200).json({
        success: true,
        ...result,
      })
    } catch (error) {
      next(error)

    }
  }

  //   async delete(req: Request, res: Response, next: NextFunction) {

  //   try {
  //     const { id } = req.params
  //     await this.logic.delete(id)

  //     return res.status(200).json({
  //       success: true,
  //       message: 'Contact deleted successfully',
  //     })
  //   } catch (error) {
  //     next(error)
  //     }
  // }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const body = req.body;
      const updatedContact = await this.logic.update(id, body);
      return res.status(200).json({
        success: true,
        message: "Contact updated successfully",
        data: updatedContact,
      });
    } catch (error) {
      next(error);
    }
  }
  async replay(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { response  , subject, message} = req.body;
      const replay = await this.logic.replay({id, response, subject, message});
      return res.status(200).json({
        success: true,
        message: "Contact replayed successfully",
        data: replay,
      });
    } catch (error) {
      next(error);
    }
  }


}
