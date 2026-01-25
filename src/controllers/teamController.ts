import { NextFunction, Response, Request } from "express";
import { TeamLogic } from "../services/team/team.logic";
import { TeamError, TeamNotFoundError } from "../errors/team.error";

export class TeamController {
  private teamLogic: TeamLogic;

  constructor(teamLogic: TeamLogic) {
    this.teamLogic = teamLogic;
  }

  async getAllTeamMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const { skip, take } = req.query;

      const teamMembers = await this.teamLogic.getAllTeamMembers({
        skip: Number(skip) || 0,
        take: Number(take) || 10,
      });

      if (!teamMembers) throw new TeamNotFoundError("error get team members");

      return res.json({
        ...teamMembers,
        message: "team members fetched successfully",
      });
    } catch (error) {
      next(error);
    }
  }
  async getAllTeamMembersActive(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { skip, take, isFeatured } = req.query;

      const teamMembers = await this.teamLogic.getAllTeamMembersActive({
        skip: Number(skip) || 0,
        take: Number(take) || 10,
        isFeatured: isFeatured === "true",
      });

      if (!teamMembers) throw new TeamNotFoundError("error get team members");

      return res.json({
        ...teamMembers,
        message: "team members fetched successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getTeamMemberById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new TeamNotFoundError("id is required");

      const teamMember = await this.teamLogic.getTeamMemberById(id);

      return res.json({
        data: teamMember,
        message: "team member fetched successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getTeamMemberBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const teamMember = await this.teamLogic.getTeamMemberBySlug(slug);

      return res.json({
        data: teamMember,
        message: "team member fetched successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async isValidOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { order } = req.query;
      if (typeof Number(order) !== "number" || isNaN(Number(order)))
        throw new TeamNotFoundError("order is not valid");

      const isValidOrder = await this.teamLogic.isValidOrder({
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

  async createTeamMember(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;

      const lang: "AR" | "EN" = (req.lang as "AR" | "EN") || "EN";

      const newTeamMember = await this.teamLogic.createTeamMember(lang, {
        ...data,
        isActive: data.isActive === "true" ? true : false,
        isFeatured: data.isFeatured === "true" ? true : false,
        order: Number(data.order) || 0,
        image:
          Array.isArray(req.files) && req.files.length > 0
            ? req.files.find((f) => f.fieldname === "image")?.buffer
            : null,
      });

      return res.status(201).json({
        data: newTeamMember,
        message: "team member created successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTeamMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const teamData = req.body;

      const files = req.files as Express.Multer.File[] | undefined;
      const lang: "AR" | "EN" = (req.lang as "AR" | "EN") || "EN";

      const data = {
        ...teamData,
        teamId: id,
        image:
          Array.isArray(files) && files.length > 0
            ? files.find((f) => f.fieldname === "image")?.buffer
            : undefined,
        imageState: teamData?.imageState as
          | "KEEP"
          | "REMOVE"
          | "UPDATE"
          | undefined,
      };

      const updatedTeamMember = await this.teamLogic.updateTeamMember(lang, {
        ...data,
        isActive:
          data.isActive === "true"
            ? true
            : data.isActive === "false"
            ? false
            : undefined,
        isFeatured:
          data.isFeatured === "true"
            ? true
            : data.isFeatured === "false"
            ? false
            : undefined,
        order: data.order ? Number(data.order) : undefined,
      });

      return res.json({
        data: updatedTeamMember,
        message: "team member updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTeamMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new TeamNotFoundError("id is required");

      const deletedTeamMember = await this.teamLogic.deleteTeamMember(id);
      if (!deletedTeamMember)
        throw new TeamNotFoundError("error deleting team member");

      return res.json({
        data: deletedTeamMember,
        message: "team member deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async SearchTeamMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const lang: "AR" | "EN" = (req.lang as "AR" | "EN") || "EN";

      const { q } = req.query;
      if (!q || typeof q !== "string")
        throw new TeamError(
          "search query is required",
          400,
          "SEARCH_QUERY_REQUIRED"
        );

      const teamMembers = await this.teamLogic.Search(lang, q);
      if (!teamMembers)
        throw new TeamNotFoundError("error searching team members");

      return res.json({
        data: teamMembers,
        message: "team members searched successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
