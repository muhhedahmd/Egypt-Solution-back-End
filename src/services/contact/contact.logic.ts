import { Prisma } from "@prisma/client";
import { ContactError, ContactNotFoundError } from "../../errors/contact.error";
import { ContactValidator } from "../../errors/schema/contact.validation.schema";
import { PaginationParams } from "../../types/client";
import { PaginatedResponse } from "../../types/services";
import { ContactRepostery } from "./contact.repostery";
import { FilterParams, FilterType } from "../../types/contact";

export class ContactLogic {
  private buildPagination(
    totalItems: number,
    nowCount: number,
    skip: number,
    take: number
  ) {
    return {
      totalItems,
      remainingItems: Math.max(0, totalItems - (skip * take + nowCount)),
      nowCount,
      totalPages: Math.ceil(totalItems / take),
      currentPage: skip + 1,
      pageSize: take,
    };
  }



  constructor(
    private ContactRepostery: ContactRepostery,
    private ContactValidator: ContactValidator
  ) {}
  async getPagnittedMany(
    params: PaginationParams
  ): Promise<
    PaginatedResponse<
      Awaited<ReturnType<typeof this.ContactRepostery.findMany>>[number]
    >
  > {
    const { skip, take } =
      this.ContactValidator.paginationParamsValidation(params);

    const [totalItems, contacts] = await Promise.all([
      await this.ContactRepostery.count(),
      await this.ContactRepostery.findMany(skip, take),
    ]);
    if (!contacts) throw new Error("Error finding contacts");

    return {
      data: contacts,
      pagination: {
        totalItems,
        remainingItems: totalItems - (skip * take + contacts.length),
        nowCount: contacts.length,
        totalPages: Math.ceil(totalItems / take),
        currentPage: skip + 1,
        pageSize: take,
      },
    };
  }
  async create(
    data: unknown
  ): Promise<Awaited<ReturnType<typeof this.ContactRepostery.create>>> {
    const validatedData = this.ContactValidator.createContactValidation(data);
    console.log("validatedData", validatedData);
    const newContact = await this.ContactRepostery.create({
      ...validatedData,
    });
    return newContact;
  }
  async getStats() {
    try {
      return await this.ContactRepostery.statics();
    } catch (error) {
      console.error("Error fetching stats:", error);
      throw new ContactError("Error fetching stats");
    }
  }

  async filter(params: FilterParams): Promise<PaginatedResponse<any>> {

    try {
      const { type, skip, take, ...filterValues } = params;

      const whereClause = this.ContactRepostery.buildWhereClause(type, filterValues);
      const { contacts, totalItems } =
        await this.ContactRepostery.findManyWithCount(whereClause, skip, take);

      return {
        data: contacts,
        pagination: this.buildPagination(
          totalItems,
          contacts.length,
          skip,
          take
        ),
      };
    } catch (error) {
      if (error instanceof ContactError) throw error;
      console.error("Error filtering contacts:", error);
      throw new ContactError("Error filtering contacts");
    }
  }
  async multiFilter(

    filters: Partial<Record<FilterType, any>>,
    skip: number,
    take: number
  ): Promise<PaginatedResponse<any>> {
    try {
      // this.ContactValidator.multiFilterValidation({ ...filters, skip, take });
      const whereConditions: Prisma.ContactWhereInput[] = [];

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          const filterType = key as FilterType;

          switch (filterType) {
            case "email":
            case "name":
            case "phone":
            case "company":
            case "subject":
            case "message":
            case "budget":
            case "timeline":
              whereConditions.push({
                [filterType]: {
                  contains: value,
                  mode: "insensitive",
                },
              });
              break;

            case "category":
            case "status":
            case "priority":
              whereConditions.push({
                [filterType]: {
                  equals: value,
                },
              });
              break;

            case "dateRange":
              if (value.startDate || value.endDate) {
                const dateFilter: any = {};
                if (value.startDate) dateFilter.gte = new Date(value.startDate);
                if (value.endDate) dateFilter.lte = new Date(value.endDate);

                whereConditions.push({
                  createdAt: dateFilter,
                });
              }
              break;
          }
        }
      });

      const whereClause: Prisma.ContactWhereInput = {
        AND: whereConditions.length > 0 ? whereConditions : undefined,
      };

      const { contacts, totalItems } =
        await this.ContactRepostery.findManyWithCount(whereClause, skip, take);

      return {
        data: contacts,
        pagination: this.buildPagination(
          totalItems,
          contacts.length,
          skip,
          take
        ),
      };
    } catch (error) {
      console.error("Error in multi-filter:", error);
      throw new ContactError("Error filtering contacts");
    }
  }

  async searchContacts(

    searchQuery: string,
    skip: number,
    take: number
  ): Promise<PaginatedResponse<any>> {
    try {
      const whereClause: Prisma.ContactWhereInput = {
        OR: [
          { name: { contains: searchQuery, mode: "insensitive" } },
          { email: { contains: searchQuery, mode: "insensitive" } },
          { company: { contains: searchQuery, mode: "insensitive" } },
          { subject: { contains: searchQuery, mode: "insensitive" } },
          { message: { contains: searchQuery, mode: "insensitive" } },
        ],
      };

      const { contacts, totalItems } =
        await this.ContactRepostery.findManyWithCount(whereClause, skip, take);

      return {
        data: contacts,
        pagination: this.buildPagination(
          totalItems,
          contacts.length,
          skip,
          take
        ),
      };
    } catch (error) {
      console.error("Error searching contacts:", error);
      if (error instanceof ContactError) throw error
      throw new ContactError("Error searching contacts");
    }
  }
  async getById(id: string) {
    try {
      const contact = await this.ContactRepostery.findById(id)
      
      if (!contact) {
        throw new ContactNotFoundError('Contact not found')
      }

      return contact
    } catch (error) {
      if (error instanceof ContactError) throw error
      throw new ContactError('Error fetching contact')
    }
  }
  async update( id: string, data: unknown) {
    const validatedData = this.ContactValidator.updateContactValidation(data);
    const updatedContact = await this.ContactRepostery.update(id, validatedData);
    return updatedContact;
  }
  async replay({
    id, response, subject, message
  } : {
    id?: string;
    response?: string;
    subject?: string;
    message?: string;
  }) {
    const replay = this.ContactRepostery.replayEmail(id, response, subject, message);
    return replay
  }
}
