import { promise } from "zod/v4";
import { contactValidatior } from "../../errors/schema/contact.validation.schema";
import { PaginationParams } from "../../types/client";
import { PaginatedResponse } from "../../types/services";
import { ContactRepostery } from "./contact.repostery";
import { ContactError } from "../../errors/contact.error";

export class ContactLogic {
  constructor(
    private ContactRepostery: ContactRepostery,
    private ContactValidator: contactValidatior
  ) {}
  async getPagnittedMany(
    params: PaginationParams
  ): Promise<
    PaginatedResponse<
      Awaited<ReturnType<typeof this.ContactRepostery.findMany>>[number]
    >
  > {
    const { skip, take } =
      this.ContactValidator.pagnitionParmsValidation(params);

      const [totalItems, contacts] = await Promise.all([
        await this.ContactRepostery.count(),
        await this.ContactRepostery.findMany(0, 10),
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
}
