"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactRepostery = void 0;
const contact_error_1 = require("../../errors/contact.error");
class ContactRepostery {
    // private prisma: PrismaClientConfig
    constructor(prisma) {
        this.prisma = prisma;
    }
    count() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const count = yield this.prisma.contact.count();
                return count;
            }
            catch (error) {
                console.log(error);
                throw new Error("Error counting contacts");
            }
        });
    }
    findMany(skip, take) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const contacts = yield this.prisma.contact.findMany({
                    skip: skip * take,
                    take,
                });
                return contacts;
            }
            catch (error) {
                console.log(error);
                throw new contact_error_1.ContactError("Error finding contacts");
            }
        });
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const contact = yield this.prisma.contact.create({ data });
                return contact;
            }
            catch (error) {
                console.log(error);
                throw new Error("Error creating contact");
            }
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const contact = yield this.prisma.contact.update({ where: { id }, data });
                return contact;
            }
            catch (error) {
                console.log(error);
                throw new Error("Error updating contact");
            }
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const contact = yield this.prisma.contact.delete({ where: { id } });
                return contact;
            }
            catch (error) {
                console.log(error);
                throw new Error("Error deleting contact");
            }
        });
    }
}
exports.ContactRepostery = ContactRepostery;
