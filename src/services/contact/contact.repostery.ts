import { Contact, Prisma } from "@prisma/client";
import { PrismaClientConfig } from "../../config/prisma";
import {
  ContactCreationError,
  ContactDeletionError,
  ContactError,
} from "../../errors/contact.error";
import { PaginatedResponse } from "../../types/services";
import { FilterParams, FilterType } from "../../types/contact";

export class ContactRepostery {
  // private prisma: PrismaClientConfig
   buildWhereClause(

    type: FilterType,
    filterValues: Partial<FilterParams>
  ): Prisma.ContactWhereInput {
    const filterMap: Record<FilterType, () => Prisma.ContactWhereInput> = {
      email: () => ({
        email: {
          contains: filterValues.email || "",
          mode: "insensitive",
        },
      }),

      name: () => ({
        name: {
          contains: filterValues.name || "",
          mode: "insensitive",
        },
      }),

      phone: () => ({
        phone: {
          contains: filterValues.phone || "",
          mode: "insensitive",
        },
      }),

      company: () => ({
        company: {
          contains: filterValues.company || "",
          mode: "insensitive",
        },
      }),

      subject: () => ({
        subject: {
          contains: filterValues.subject || "",
          mode: "insensitive",
        },
      }),

      message: () => ({
        message: {
          contains: filterValues.message || "",
          mode: "insensitive",
        },
      }),

      category: filterValues.category ? () => ({
        category: filterValues.category,
      }) : () => ({}),

      status: filterValues.status ? () => ({
        status: {
          equals: filterValues.status,
        },
      }) : () => ({}),

      priority: filterValues.priority ? () => ({
        priority: filterValues.priority,
      }) : () => ({}),

      budget: () => ({
        budget: {
          contains: filterValues.budget || "",
          mode: "insensitive",
        },
      }),

      timeline: () => ({
        timeline: {
          contains: filterValues.timeline || "",
          mode: "insensitive",
        },
      }),

      dateRange: () => {
        const dateFilter: any = {};

        if (filterValues.startDate) {
          dateFilter.gte = new Date(filterValues.startDate);
        }

        if (filterValues.endDate) {
          dateFilter.lte = new Date(filterValues.endDate);
        }

        return {
          createdAt: dateFilter,
        };
      },
    };

    const buildFilter = filterMap[type];

    if (!buildFilter) {
      throw new ContactError(`Invalid filter type: ${type}`);
    }

    return buildFilter();
  }

  constructor(private prisma: PrismaClientConfig) {}

  async count() {
    try {
      const count = await this.prisma.contact.count();
      return count;
    } catch (error) {
      console.log(error);
      throw new Error("Error counting contacts");
    }
  }

  async findMany(skip: number, take: number) {
    try {
      const contacts = await this.prisma.contact.findMany({
        skip: skip * take,
        take,
      });
      return contacts;
    } catch (error) {
      console.log(error);
      throw new ContactError("Error finding contacts");
    }
  }
  async create(
    data: Omit<
      Contact,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "priority"
      | "notes"
      | "respondedAt"
      | "resolved"
      | "resolvedAt"
      | "respondedBy"
      | "response"
      | "readAt"
      | "viewCount"
    >
  ) {
    try {
      const contact = await this.prisma.contact.create({
        data: {
          ...data,
        },
      });
      return contact;
    } catch (error) {
      console.log(error);
      throw new ContactError("Error creating contact");
    }
  }
  async statics() {
    try {
      const total = await this.prisma.contact.count();
      const resolved = await this.prisma.contact.count({
        where: {
          resolved: true,
        },
      });
      const urgent = await this.prisma.contact.count({
        where: {
          priority: "URGENT",
        },
      });

      const pending = total - resolved;
      return {
        total,
        resolved,
        pending,
        urgent,
        resolvedPercentage: total ? (resolved / total) * 100 : 0,
        pendingPercentage: total ? (pending / total) * 100 : 0,
        urgentPercentage: total ? (urgent / total) * 100 : 0,
        resolutionRate: pending ? resolved / pending : 0,
      };
    } catch (error) {
      console.log(error);
      throw new ContactError("Error getting contact statistics");
    }
  }

  async filter(params: FilterParams): Promise<PaginatedResponse<any>> {
    try {
      const { type, skip, take, ...filterValues } = params;

      const whereClause = this.buildWhereClause(type, filterValues);

      const [totalItems, contacts] = await Promise.all([
        this.prisma.contact.count({ where: whereClause }),
        this.prisma.contact.findMany({
          where: whereClause,
          skip: skip * take,
          take,
          orderBy: { createdAt: "desc" },
        }),
      ]);

      return {
        data: contacts,
        pagination: {
          totalItems,
          remainingItems: Math.max(
            0,
            totalItems - (skip * take + contacts.length)
          ),
          nowCount: contacts.length,
          totalPages: Math.ceil(totalItems / take),
          currentPage: skip + 1,
          pageSize: take,
        },
      };
    } catch (error) {
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
        AND: whereConditions,
      };

      const [totalItems, contacts] = await Promise.all([
        this.prisma.contact.count({ where: whereClause }),
        this.prisma.contact.findMany({
          where: whereClause,
          skip: skip * take,
          take,
          orderBy: { createdAt: "desc" },
        }),
      ]);

      return {
        data: contacts,
        pagination: {
          totalItems,
          remainingItems: Math.max(
            0,
            totalItems - (skip * take + contacts.length)
          ),
          nowCount: contacts.length,
          totalPages: Math.ceil(totalItems / take),
          currentPage: skip + 1,
          pageSize: take,
        },
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

      const [totalItems, contacts] = await Promise.all([
        this.prisma.contact.count({ where: whereClause }),
        this.prisma.contact.findMany({
          where: whereClause,
          skip: skip * take,
          take,
          orderBy: { createdAt: "desc" },
        }),
      ]);

      return {
        data: contacts,
        pagination: {
          totalItems,
          remainingItems: Math.max(
            0,
            totalItems - (skip * take + contacts.length)
          ),
          nowCount: contacts.length,
          totalPages: Math.ceil(totalItems / take),
          currentPage: skip + 1,
          pageSize: take,
        },
      };
    } catch (error) {
      console.error("Error searching contacts:", error);
      throw new ContactError("Error searching contacts");
    }
  }

  async getContactsByStatus(
    status: string,
    skip: number,
    take: number
  ): Promise<PaginatedResponse<any>> {
    return this.filter({
      type: "status",
      status,
      skip,
      take,
    });
  }

  async getContactsByPriority(
    priority: string,
    skip: number,
    take: number
  ): Promise<PaginatedResponse<any>> {
    return this.filter({
      type: "priority",
      priority,
      skip,
      take,
    });
  }

  async getContactsByCategory(
    category: string,
    skip: number,
    take: number
  ): Promise<PaginatedResponse<any>> {
    return this.filter({
      type: "category",
      category,
      skip,
      take,
    });
  }

  async getContactsByDateRange(
    startDate: Date | string,
    endDate: Date | string,
    skip: number,
    take: number
  ): Promise<PaginatedResponse<any>> {
    return this.filter({
      type: "dateRange",
      startDate,
      endDate,
      skip,
      take,
    });
  }

  async update(
    id: string,
    data: Partial<Omit<Contact, "id" | "createdAt" | "updatedAt">>
  ) {
    try {
      const contact = await this.prisma.contact.update({ where: { id }, data });
      return contact;
    } catch (error) {
      console.log(error);
      throw new ContactCreationError("Error updating contact");
    }
  }
  async delete(id: string) {
    try {
      const contact = await this.prisma.contact.delete({ where: { id } });
      return contact;
    } catch (error) {
      console.log(error);
      throw new ContactDeletionError("Error deleting contact");
    }
  }

  async findManyWithCount(
    whereClause: Prisma.ContactWhereInput,
    skip: number,
    take: number
  ): Promise<{ contacts: any[]; totalItems: number }> {
    const [totalItems, contacts] = await Promise.all([
      this.prisma.contact.count({ where: whereClause }),
      this.prisma.contact.findMany({
        where: whereClause,
        skip: skip * take,
        take,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return { contacts, totalItems };
  }

  async findById(id: string) {
    return this.prisma.contact.findUnique({
      where: { id },
    });
  }
}
