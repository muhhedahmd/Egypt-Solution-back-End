import { Contact } from "@prisma/client";
import { PrismaClientConfig } from "../../config/prisma";
import { ContactError } from "../../errors/contact.error";

export class ContactRepostery {
  // private prisma: PrismaClientConfig
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
  async create(data: Omit<Contact, "id" | "createdAt" | "updatedAt">) {
    try {
      const contact = await this.prisma.contact.create({ data });
      return contact;
    } catch (error) {
      console.log(error);
      throw new Error("Error creating contact");
    }
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
      throw new Error("Error updating contact");
    }
  }
  async delete(id: string) {
    try {
      const contact = await this.prisma.contact.delete({ where: { id } });
      return contact;
    } catch (error) {
      console.log(error);
      throw new Error("Error deleting contact");
    }
  }
}
