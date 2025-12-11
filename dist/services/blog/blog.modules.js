"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogModules = void 0;
const blog_repostery_1 = require("./blog.repostery");
const blog_error_1 = require("../../errors/blog.error");
const blog_logic_1 = require("./blog.logic");
const blogRoutes_1 = require("../../routes/blogRoutes");
const blogController_1 = require("../../controllers/blogController");
class blogModules {
    constructor(prisma) {
        this.repository = new blog_repostery_1.blogRepository(prisma);
        this.validator = new blog_error_1.BlogValidator();
        this.blog = new blog_logic_1.blogLogic(this.repository, this.validator);
        this.controller = new blogController_1.blogController(this.blog);
        this.routes = new blogRoutes_1.blogRoutes(this.controller);
    }
    getRoutes() {
        return this.routes.getRoutes();
    }
}
exports.blogModules = blogModules;
