import { randomUUID } from "crypto";
import { PrismaClientConfig } from "../../config/prisma";
import slugify from "slugify";
import {
  CreateProjectDTO,
  CreateTechnologyDTO,
  ProjectWithTechnologiesDTO,
  UpdateProjectDTO,
} from "../../types/project";
import {
  AssignImageToDBImage,
  deleteImageById,
  txInstance,
  UploadImage,
  UploadImageWithoutBlurHAsh,
} from "../../lib/helpers";
import { ServiceError } from "../../errors/services.error";
import {
  Image,
  Project,
  ProjectStatus,
  ProjectTechnology,
  Service,
  Technology,
} from "@prisma/client";

export class projectRepository {
  constructor(
    private prisma: PrismaClientConfig // private project : ServicesRepository
  ) {}

  // reorder logic
  async reorderDelete({ projectDeleted }: { projectDeleted: Project }) {
    try {
      const order = projectDeleted.order;
      const theRest = await this.prisma.project.findMany({
        where: {
          order: {
            gt: order,
          },
        },
        orderBy: {
          order: "asc",
        },
      });
      const promises = await Promise.all(
        theRest.map((att) => {
          return this.prisma.project.update({
            where: {
              id: att.id,
            },
            data: {
              order: att.order - 1,
            },
          });
        })
      );

      return promises;
    } catch (error) {
      console.error(error);
      throw new ServiceError(
        "error updating a projects Reorder",
        400,
        "SLIDESHOW_UPDATE_ERROR"
      );
    }
  }

  // reorderUpdate for better that will be a swap
  async reorderUpdate({
    projectUpdate,
    orderBeforeUpdate,
  }: {
    projectUpdate: Project;
    orderBeforeUpdate: number;
  }) {
    try {
      const order = projectUpdate.order;

      const findOrder = await this.prisma.project.findFirst({
        where: {
          order,
        },
      });
      if (findOrder) {
        return this.prisma.project.update({
          where: {
            id: findOrder.id,
          },
          data: {
            order: orderBeforeUpdate,
          },
        });
      }
    } catch (error) {
      console.error(error);
      throw new ServiceError(
        "error updating a projects Reorder",
        400,
        "SLIDESHOW_UPDATE_ERROR"
      );
    }
  }

  async findMany(skip: number, take: number) {
    return this.prisma.project.findMany({
      include: {
        image: true,
        technologies: {
          select: {
            technology: {
              select: {
                icon: true,
                name: true,
                category: true,
              },
            },
          },
        },
      },
      skip: skip * take,
      take: take,
    });
  }

  async count() {
    return this.prisma.project.count();
  }

  async findBySlugFull(
    id: string,
    prismaTouse?: txInstance
  ): Promise<{
    image: Image | null;
    technologies: Partial<Technology>[];
    project: Project;
    servicesData: {
      image: Image | null;
      service: Service;
    }[];
  } | null> {
    try {
      const project = await (prismaTouse || this.prisma).project.findUnique({
        where: {
          slug: id,
        },
        include: {
          image: true,
          technologies: {
            select: {
              technology: {
                select: {
                  slug: true,
                  id: true,
                  icon: true,
                  name: true,
                  category: true,
                },
              },
            },
          },
          services: {
            include: {
              image: true,
            },
          },
        },
      });
      if (!project) return null;
      const { image, technologies, services, ...rest } = project;

      return {
        image,
        servicesData: services.map((service) => {
          const { image, ...rest } = service;
          return {
            image: image || null,
            service: rest,
          };
        }),
        technologies: technologies.map((tech) => tech.technology),
        project: rest,
      };
    } catch (error) {
      console.log(error);
      throw new ServiceError(
        "error finding project by ID",
        400,
        "PROJECT_GET_ERROR"
      );
    }
  }

  async findById(
    id: string,
    prismaTouse?: txInstance
  ): Promise<(Project & { image: Image | null }) | null> {
    try {
      const project = (prismaTouse || this.prisma).project.findUnique({
        where: { id },
        include: {
          image: true,
          technologies: {
            select: {
              technology: {
                select: {
                  icon: true,
                  name: true,
                  category: true,
                },
              },
            },
          },
        },
      });
      return project;
    } catch (error) {
      console.log(error);
      throw new ServiceError(
        "error finding project by ID",
        400,
        "PROJECT_GET_ERROR"
      );
    }
  }

  async create(
    data: CreateProjectDTO & { slug: string; imageId?: string },
    prismaTouse?: txInstance
  ): Promise<{ project: Project; Image: Image | null }> {
    try {
      const transication = await this.prisma.$transaction(
        async (tx) => {
          const slug = slugify(data.title + randomUUID().substring(0, 8), {
            lower: true,
          });
          if (!slug) throw new Error("error create slug");

          if (data.image) {
            const createImage = await UploadImage(data.image, data.title);
            if (!createImage) throw new Error("error upload image");
            const imageToDB = await AssignImageToDBImage(
              {
                imageType: "PROJECT",
                blurhash: createImage.blurhash,
                width: createImage.width,
                height: createImage.height,
                data: createImage.data,
              },
              tx
            );
            data.imageId = imageToDB.id;
          }

          const lastOrder = (await this.count()) - 1;
          const findIstheretheOrder = await tx.project.findFirst({
            where: {
              order: data.order,
            },
          });
          if (findIstheretheOrder) {
            data.order = lastOrder + 1;
          }
          if (data.order && data.order > lastOrder) {
            data.order = lastOrder + 1;
          }

          const { slug: _slug, image: _image, ...CerateRest } = data;

          const project = await tx.project.create({
            data: {
              ...CerateRest,
              // imageId: imageToDB.id || null,
              order: data.order || 0,
              slug: slug,
            },
            include: {
              image: true,
            },
          });
          const { image, ...rest } = project;
          return { Image: image, project: rest };
        },
        {
          timeout: 20000,
          maxWait: 5000,
        }
      );
      return transication;
    } catch (error) {
      console.log(error);
      throw new ServiceError(
        "error creating a project",
        400,
        "PROJECT_CREATE_ERROR"
      );
    }
  }
  async createTransiaction(
    data: CreateProjectDTO & { slug: string; imageId?: string },
    prismaTouse?: txInstance
  ): Promise<{ project: Project; Image: Image | null }> {
    try {
      const prismaTx = prismaTouse || this.prisma;

      const slug = slugify(data.title + randomUUID().substring(0, 8), {
        lower: true,
      });
      if (!slug) throw new Error("error create slug");

      if (data.image) {
        const createImage = await UploadImage(data.image, data.title);
        if (!createImage) throw new Error("error upload image");
        const imageToDB = await AssignImageToDBImage(
          {
            imageType: "PROJECT",
            blurhash: createImage.blurhash,
            width: createImage.width,
            height: createImage.height,
            data: createImage.data,
          },
          prismaTx
        );
        data.imageId = imageToDB.id;
      }

      const lastOrder = (await this.count()) - 1;
      const findIstheretheOrder = await prismaTx.project.findFirst({
        where: {
          order: data.order,
        },
      });
      if (findIstheretheOrder) {
        data.order = lastOrder + 1;
      }
      if (data.order && data.order > lastOrder) {
        data.order = lastOrder + 1;
      }

      const { slug: _slug, image: _image, ...CerateRest } = data;

      const project = await prismaTx.project.create({
        data: {
          ...CerateRest,
          // imageId: imageToDB.id || null,
          order: data.order || 0,
          slug: slug,
        },
        include: {
          image: true,
        },
      });
      const { image, ...rest } = project;
      return { Image: image, project: rest };
    } catch (error) {
      console.log(error);
      throw new ServiceError(
        "error creating a project",
        400,
        "PROJECT_CREATE_ERROR"
      );
    }
  }

  async CreateProjecAndAssignTechnologies({
    project,
    technologies,
    services,
  }: {
    project: CreateProjectDTO;
    technologies?: string[];
    services?: string[];
  }) {
    const slug = slugify(project.title, { lower: true });
    const transaction = await this.prisma.$transaction(
      async (prismaTx) => {
        const createdProject = await this.createTransiaction(
          { ...project, slug },
          prismaTx
        );
        let projectTechnologies: Technology[] = [];
        let projectServices: Service[] = [];
        if (technologies) {
          projectTechnologies = await Promise.all(
            technologies.map(async (tech) => {
              const Tech = await prismaTx.projectTechnology.create({
                data: {
                  projectId: createdProject.project.id,
                  technologyId: tech,
                },
                select: {
                  technology: true,
                },
              });
              return Tech.technology;
            })
          );
        }
        if (services) {
          projectServices = await Promise.all(
            services.flatMap(async (service, idx) => {
              const serviceTech = await prismaTx.project.update({
                where: {
                  id: createdProject.project.id,
                },
                data: {
                  services: {
                    connect: {
                      id: service,
                    },
                  },
                },
                select: {
                  services: true,
                },
              });
              return serviceTech.services.filter(
                (s, index) => s.id === service
              )[0];
            })
          );
        }
        return { createdProject, projectTechnologies, projectServices };
      },
      {
        timeout: 20000,
        maxWait: 5000,
      }
    );
    return transaction;
  }

  async update(
    data: UpdateProjectDTO
  ): Promise<{ project: Project; Image: Image | null }> {
    try {
      const transaction = await this.prisma.$transaction(
        async (prismaTx) => {
          let NewImageId: string | null = null;

          if (!data.id) throw new Error("no serviceId provided");

          const project = await this.findById(data.id, prismaTx);

          if (!project) throw new Error("project not found");

          NewImageId = project?.imageId || null;

          if (data.imageState === "REMOVE") {
            if (project.imageId) {
              await prismaTx.project.update({
                where: { id: data.id },
                data: { imageId: null },
              });
              await deleteImageById(project.imageId, prismaTx);
            }
            NewImageId = null;
          }

          if (data.imageState === "UPDATE") {
            if (project.imageId) {
              await prismaTx.project.update({
                where: { id: data.id },
                data: { imageId: null },
              });

              await deleteImageById(project.imageId, prismaTx);
            }

            if (!data.image) throw new Error("no image provided");

            const createImage = await UploadImage(
              data.image,
              data.title || "update"
            );

            if (!createImage) throw new Error("error upload image");

            const imageToDB = await AssignImageToDBImage(
              {
                imageType: "PROJECT",
                blurhash: createImage.blurhash,
                width: createImage.width,
                height: createImage.height,
                data: createImage.data,
              },
              prismaTx
            );

            if (!imageToDB) throw new Error("error create imageToDB");
            NewImageId = imageToDB.id;
          }

          // Generate new slug if name changed
          if (data.title && data.title !== project.title) {
            const slug = slugify(data.title + randomUUID().substring(0, 8), {
              lower: true,
            });
            data.slug = slug;
          }

          // console.log("project ID:", data.serviceId, NewImageId);
          const isOrderChanged =
            data.order !== undefined && data.order != project.order;

          if (isOrderChanged)
            await this.reorderUpdate({
              projectUpdate: project,
              orderBeforeUpdate: project.order,
            });

          // Update the project with new data
          const updatedService = await prismaTx.project.update({
            where: { id: data.id },
            data: {
              slug: data.slug || project.slug,
              title: data.title || project.title,
              description: data.description || project.description,
              richDescription: data.richDescription || project.richDescription,
              imageId: NewImageId,
              clientName: data.clientName || project.clientName || "",
              clientCompany: data.clientCompany || project.clientCompany || "",
              status: data.status || project.status || false,
              startDate: data.startDate || project.startDate || new Date(),
              endDate: data.endDate || project.endDate || new Date(),
              isFeatured: data.isFeatured || project.isFeatured || false,
              order: data.order || project.order || 0,
            },
            include: { image: true },
          });

          const { image, ...rest } = updatedService;
          return { Image: image, project: rest };
        },
        {
          timeout: 20000,
          maxWait: 5000,
        }
      );

      return transaction;
    } catch (error) {
      console.log(error);
      throw new Error("Error updating project");
    }
  }

  // *** 
  async updateProjectWithTechsServices(data: {
  id: string;
  projectData: UpdateProjectDTO;
  deletedTechIds: string[];
  newTechIds: string[];
  deletedServiceIds: string[];
  newServiceIds: string[];
}): Promise<{
  project: Project;
  image: Image | null;
  technologies: Technology[];
  services: Service[];
}> {
  try {
    const transaction = await this.prisma.$transaction(
      async (tx) => {
        // 1. Update the project itself
        let imageId: string | null = null;
        const existingProject = await this.findById(data.id, tx);
        
        if (!existingProject) {
          throw new ServiceError("Project not found", 404, "PROJECT_NOT_FOUND");
        }

        imageId = existingProject.imageId;

        // Handle image updates
        if (data.projectData.imageState === "REMOVE" && imageId) {
          await tx.project.update({
            where: { id: data.id },
            data: { imageId: null },
          });
          await deleteImageById(imageId, tx);
          imageId = null;
        }

        if (data.projectData.imageState === "UPDATE") {
          if (imageId) {
            await tx.project.update({
              where: { id: data.id },
              data: { imageId: null },
            });
            await deleteImageById(imageId, tx);
          }

          if (data.projectData.image) {
            const uploadedImage = await UploadImage(
              data.projectData.image,
              data.projectData.title || existingProject.title
            );
            
            if (!uploadedImage) {
              throw new ServiceError("Failed to upload image", 400, "IMAGE_UPLOAD_ERROR");
            }

            const dbImage = await AssignImageToDBImage(
              {
                imageType: "PROJECT",
                blurhash: uploadedImage.blurhash,
                width: uploadedImage.width,
                height: uploadedImage.height,
                data: uploadedImage.data,
              },
              tx
            );
            imageId = dbImage.id;
          }
        }

        // Generate new slug if title changed
        let slug = existingProject.slug;
        if (data.projectData.title && data.projectData.title !== existingProject.title) {
          slug = slugify(data.projectData.title + randomUUID().substring(0, 8), {
            lower: true,
          });
        }

        // Handle order changes
        if (
          data.projectData.order !== undefined &&
          data.projectData.order !== existingProject.order
        ) {
          await this.reorderUpdate({
            projectUpdate: { ...existingProject, order: data.projectData.order },
            orderBeforeUpdate: existingProject.order,
          });
        }

        // Update project
        const updatedProject = await tx.project.update({
          where: { id: data.id },
          data: {
            title: data.projectData.title ?? existingProject.title,
            description: data.projectData.description ?? existingProject.description,
            richDescription: data.projectData.richDescription ?? existingProject.richDescription,
            clientName: data.projectData.clientName ?? existingProject.clientName,
            clientCompany: data.projectData.clientCompany ?? existingProject.clientCompany,
            projectUrl: data.projectData.projectUrl ?? existingProject.projectUrl,
            githubUrl: data.projectData.githubUrl ?? existingProject.githubUrl,
            status: data.projectData.status ?? existingProject.status,
            startDate: data.projectData.startDate ?? existingProject.startDate,
            endDate: data.projectData.endDate ?? existingProject.endDate,
            isFeatured: data.projectData.isFeatured ?? existingProject.isFeatured,
            order: data.projectData.order ?? existingProject.order,
            imageId,
            slug,
          },
          include: {
            image: true,
          },
        });

        // 2. Handle technology deletions
        if (data.deletedTechIds.length > 0) {
          await tx.projectTechnology.deleteMany({
            where: {
              projectId: data.id,
              technologyId: { in: data.deletedTechIds },
            },
          });
        }

        // 3. Handle technology additions
        if (data.newTechIds.length > 0) {
          // Check if technologies exist
          const techs = await tx.technology.findMany({
            where: { id: { in: data.newTechIds } },
          });

          if (techs.length !== data.newTechIds.length) {
            throw new ServiceError(
              "One or more technologies not found",
              404,
              "TECHNOLOGY_NOT_FOUND"
            );
          }

          // Create new relationships
          await tx.projectTechnology.createMany({
            data: data.newTechIds.map((techId) => ({
              projectId: data.id,
              technologyId: techId,
            })),
            skipDuplicates: true,
          });
        }

        // 4. Handle service deletions
        if (data.deletedServiceIds.length > 0) {
          await tx.project.update({
            where: { id: data.id },
            data: {
              services: {
                disconnect: data.deletedServiceIds.map((id) => ({ id })),
              },
            },
          });
        }

        // 5. Handle service additions
        if (data.newServiceIds.length > 0) {
          // Check if services exist
          const services = await tx.service.findMany({
            where: { id: { in: data.newServiceIds } },
          });

          if (services.length !== data.newServiceIds.length) {
            throw new ServiceError(
              "One or more services not found",
              404,
              "SERVICE_NOT_FOUND"
            );
          }

          await tx.project.update({
            where: { id: data.id },
            data: {
              services: {
                connect: data.newServiceIds.map((id) => ({ id })),
              },
            },
          });
        }

        // 6. Fetch final state with all relationships
        const finalProject = await tx.project.findUnique({
          where: { id: data.id },
          include: {
            image: true,
            technologies: {
              include: {
                technology: true,
              },
            },
            services: true,
          },
        });

        if (!finalProject) {
          throw new ServiceError("Failed to retrieve updated project", 500, "PROJECT_RETRIEVAL_ERROR");
        }

        return {
          project: finalProject,
          image: finalProject.image,
          technologies: finalProject.technologies.map((pt) => pt.technology),
          services: finalProject.services,
        };
      },
      {
        timeout: 20000,
        maxWait: 5000,
      }
    );

    return transaction;
  } catch (error) {
    console.error("Error updating project with techs/services:", error);
    if (error instanceof ServiceError) throw error;
    throw new ServiceError(
      "Failed to update project",
      500,
      "PROJECT_UPDATE_ERROR"
    );
  }
}

  async delete(id: string): Promise<Project> {
    try {
      const transaction = await this.prisma.$transaction(
        async (prismaTx) => {
          const project = await prismaTx.project.findUnique({ where: { id } });
          if (!project) throw new Error("project not found");
          await prismaTx.project.update({
            where: { id },
            data: { imageId: null },
          });
          if (project.imageId) await deleteImageById(project.imageId, prismaTx);
          const projectDeleted = await prismaTx.project.delete({
            where: { id },
          });
          await this.reorderDelete({ projectDeleted });

          return project;
        },
        {
          timeout: 20000,
          maxWait: 5000,
        }
      );
      return transaction;
    } catch (error) {
      console.log(error);
      throw new Error("Error deleting project");
    }
  }

  async findTechById(id: string, tx?: txInstance): Promise<Technology | null> {
    try {
      const technology = await (tx || this.prisma).technology.findUnique({
        where: { id },
      });
      return technology;
    } catch (error: any) {
      if (error?.code === "P2025") {
        throw new ServiceError(
          " technology not found",
          404,
          "TECHNOLOGY_GET_ERROR"
        );
      }
      console.log(error);
      throw new ServiceError(
        "error finding technology by ID",
        400,
        "TECHNOLOGY_GET_ERROR"
      );
    }
  }

  async countTechnologies(): Promise<number> {
    try {
      return await this.prisma.technology.count();
    } catch (error) {
      console.error(error);
      throw new ServiceError(
        "Error counting technologies",
        400,
        "TECHNOLOGY_COUNT_ERROR"
      );
    }
  }

  async findManyTechnologies(
    skip: number,
    take: number
  ): Promise<Technology[]> {
    try {
      return await this.prisma.technology.findMany({
        skip: skip * take,
        take,
        orderBy: {
          name: "asc",
        },
        include: {
          _count: {
            select: {
              projects: true,
            },
          },
        },
      });
    } catch (error) {
      console.error(error);
      throw new ServiceError(
        "Error finding technologies",
        400,
        "TECHNOLOGY_GET_ERROR"
      );
    }
  }
  async createTechnology(
    data: CreateTechnologyDTO & { icon?: Buffer | null },
    tx?: txInstance
  ): Promise<Technology> {
    try {
      const slug = slugify(data.name + randomUUID().substring(0, 8), {
        lower: true,
      });
      const pxToUse = tx ? tx : this.prisma;
      let icon: any = "";

      if (data.icon) icon = await UploadImageWithoutBlurHAsh(data.icon, slug);
      const technology = await pxToUse.technology.create({
        data: {
          name: data.name,
          icon: icon?.data?.[0].data?.ufsUrl || "",
          category: data.category || "",
          slug,
        },
      });

      return technology;
    } catch (error) {
      console.log(error);
      throw new ServiceError(
        "error creating technology",
        400,
        "TECHNOLOGY_CREATE_ERROR"
      );
    }
  }

  async updateTechnology(
    id: string,
    data: Partial<CreateTechnologyDTO>
  ): Promise<Technology> {
    try {
      const technology = await this.prisma.technology.update({
        where: { id },
        data: {
          name: data.name,
          // icon: data.icon,
          category: data.category,
        },
      });
      return technology;
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new ServiceError(
          "Technology not found",
          404,
          "TECHNOLOGY_NOT_FOUND"
        );
      }
      console.error(error);
      throw new ServiceError(
        "Error updating technology",
        400,
        "TECHNOLOGY_UPDATE_ERROR"
      );
    }
  }
  async deleteTechnology(id: string): Promise<Technology> {
    try {
      await this.prisma.projectTechnology.deleteMany({
        where: { technologyId: id },
      });

      const technology = await this.prisma.technology.delete({
        where: { id },
      });

      return technology;
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new ServiceError(
          "Technology not found",
          404,
          "TECHNOLOGY_NOT_FOUND"
        );
      }
      console.error(error);
      throw new ServiceError(
        "Error deleting technology",
        400,
        "TECHNOLOGY_DELETE_ERROR"
      );
    }
  }
  async assignProjectToTechnolgy(
    data: ProjectWithTechnologiesDTO[]
  ): Promise<ProjectTechnology[]> {
    try {
      const transaction = await this.prisma.$transaction(
        async (prismaTx) => {
          const promises = await Promise.all(
            data.map(async (data) => {
              await this.findById(data.projectId, prismaTx);
              await this.findTechById(data.technologyId, prismaTx);
              console.log({ data });
              const projectTechnology = await prismaTx.projectTechnology.create(
                {
                  data: {
                    projectId: data.projectId,
                    technologyId: data.technologyId,
                  },
                  include: { project: true, technology: true },
                }
              );
              return projectTechnology;
            })
          );

          return promises;
        },
        {
          timeout: 20000,
          maxWait: 5000,
        }
      );
      return transaction;
    } catch (error) {
      console.log(error);
      throw new ServiceError(
        "error assign project to technology",
        400,
        "ASSIGN_PROJECT_TO_TECHNOLOGY_ERROR"
      );
    }
  }

  async removeProjectToTechnolgy(
    data: ProjectWithTechnologiesDTO[]
  ): Promise<ProjectTechnology[]> {
    try {
      const transaction = await this.prisma.$transaction(
        async (prismaTx) => {
          const promises = await Promise.all(
            data.map(async (data) => {
              await this.findById(data.projectId, prismaTx);
              await this.findTechById(data.technologyId, prismaTx);

              const projectTechnology = await prismaTx.projectTechnology.delete(
                {
                  where: {
                    projectId_technologyId: {
                      projectId: data.projectId,
                      technologyId: data.technologyId,
                    },
                  },
                }
              );
              return projectTechnology;
            })
          );

          return promises;
        },
        {
          timeout: 20000,
          maxWait: 5000,
        }
      );
      return transaction;
    } catch (error) {
      console.log(error);
      throw new ServiceError(
        "error remove project to technology",
        400,
        "REMOVE_PROJECT_TO_TECHNOLOGY_ERROR"
      );
    }
  }
  async createTechnologyAndProject(data: {
    CreateTechnology: CreateTechnologyDTO;
    CreateProject: (CreateProjectDTO & { slug: string })[];
  }) {
    try {
      const transaction = await this.prisma.$transaction(
        async (prismaTx) => {
          const technology = await this.createTechnology(
            {
              icon: data.CreateTechnology.icon || null,
              name: data.CreateTechnology.name,
              category: data.CreateTechnology.category,
            },
            prismaTx
          );

          const projectIds = (
            await Promise.all(
              data.CreateProject.map((project) =>
                this.create(project, prismaTx)
              )
            )
          ).map((project) => project.project.id);

          console.log(projectIds, technology.id);

          const dataToAssign = projectIds.map((projectId) => ({
            projectId,
            technologyId: technology.id,
          }));
          const projectWithTechnology = await Promise.all(
            dataToAssign.map(async (data) => {
              await this.findById(data.projectId, prismaTx);
              await this.findTechById(data.technologyId, prismaTx);
              const projectTechnology = await prismaTx.projectTechnology.create(
                {
                  data: {
                    projectId: data.projectId,
                    technologyId: data.technologyId,
                  },
                  include: { project: true, technology: true },
                }
              );
              return projectTechnology;
            })
          );

          return { technology, projectWithTechnology };
        },
        {
          timeout: 20000,
          maxWait: 5000,
        }
      );
      const result = transaction.projectWithTechnology.map(
        (projectWithTechnology) => {
          return projectWithTechnology.project;
          // technology: projectWithTechnology.technology,
        }
      );
      return { technology: transaction.technology, projects: { ...result } };
    } catch (error) {
      console.log(error);
      throw new ServiceError(
        "error creating technology and project",
        400,
        "TECHNOLOGY_CREATE_ERROR"
      );
    }
  }

  async createProjectAndTechnologies({
    project,
    technologies,
  }: {
    project: CreateProjectDTO & { slug: string };
    technologies: CreateTechnologyDTO[];
  }) {
    try {
      const transaction = await this.prisma.$transaction(
        async (prismaTx) => {
          const createdProject = await this.create(project, prismaTx);

          const createdTechnologies = await Promise.all(
            technologies.map((tech) =>
              this.createTechnology(tech as any, prismaTx)
            )
          );

          const projectTechnologies = await Promise.all(
            createdTechnologies.map(async (tech) => {
              return await prismaTx.projectTechnology.create({
                data: {
                  projectId: createdProject.project.id,
                  technologyId: tech.id,
                },
              });
            })
          );

          return { createdProject, createdTechnologies };
        },
        {
          timeout: 20000,
          maxWait: 5000,
        }
      );
      return transaction;
    } catch (error) {
      console.log(error);
      throw new ServiceError(
        "error creating project and technologies",
        400,
        "PROJECT_CREATE_ERROR"
      );
    }
  }
  async findTechnologiesByProject(
    projectId: string,
    skip: number,
    take: number
  ): Promise<Array<ProjectTechnology & { technology: Technology }>> {
    try {
      const technologies = await this.prisma.projectTechnology.findMany({
        where: { projectId },
        skip,
        take,
        include: { technology: true },
      });
      return technologies;
    } catch (error) {
      console.log(error);
      throw new ServiceError(
        "error finding technologies by project",
        400,
        "TECHNOLOGY_GET_ERROR"
      );
    }
  }
  async findTechnologiesByProjectCount(projectId: string) {
    try {
      const technologies = await this.prisma.projectTechnology.count({
        where: { projectId },
      });
      return technologies;
    } catch (error) {
      console.log(error);
      throw new ServiceError(
        "error finding technologies by project",
        400,
        "TECHNOLOGY_GET_ERROR"
      );
    }
  }

  async findProjectsByTechnology(
    technologyId: string,
    skip: number,
    take: number
  ) {
    try {
      const projects = await this.prisma.projectTechnology.findMany({
        where: { technologyId },
        skip,
        take,
        include: { project: true },
      });
      return projects;
    } catch (error) {
      console.log(error);
      throw new ServiceError(
        "error finding projects by technology",
        400,
        "PROJECT_GET_ERROR"
      );
    }
  }
  async findProjectsByTechnologyCount(technologyId: string) {
    try {
      const count = await this.prisma.projectTechnology.count({
        where: { technologyId },
      });
      return count;
    } catch (error) {
      console.log(error);
      throw new ServiceError(
        "error finding projects by technology count",
        400,
        "PROJECT_GET_ERROR"
      );
    }
  }
  async searchProjects(
    searchTerm: string,
    skip: number,
    take: number
  ): Promise<
    {
      project: Project;
      image: Image | null;
      technologies: Partial<Technology>[];
    }[]
  > {
    try {
      const find = await this.prisma.project.findMany({
        where: {
          OR: [
            {
              title: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              clientName: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              clientCompany: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
          ],
        },
        include: {
          image: true,
          technologies: {
            include: {
              technology: true,
            },
          },
        },
        skip: skip * take,
        take,
        orderBy: {
          createdAt: "desc",
        },
      });
      if (!find) {
        throw new ServiceError(
          "No projects found",
          400,
          "PROJECT_SEARCH_ERROR"
        );
      }

      const projects = find.map((project) => {
        const { image, technologies, ...rest } = project;
        return {
          project: rest,
          image,
          technologies:
            technologies?.map((item) => {
              return {
                id: item.technology.id,
                slug: item.technology.slug,
                icon: item.technology.icon,
                name: item.technology.name,
                category: item.technology.category,
              };
            }) || [],
        };
      });

      return projects;
    } catch (error) {
      console.error(error);
      throw new ServiceError(
        "Error searching projects",
        400,
        "PROJECT_SEARCH_ERROR"
      );
    }
  }
  async countSearchResults(searchTerm: string): Promise<number> {
    try {
      return await this.prisma.project.count({
        where: {
          OR: [
            {
              title: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              clientName: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              clientCompany: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
          ],
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } catch (error) {
      console.error(error);
      throw new ServiceError(
        "Error counting featured projects",
        400,
        "PROJECT_COUNT_ERROR"
      );
    }
  }
  async searchTechnologies(searchTerm: string, skip: number, take: number) {
    try {
      return await this.prisma.technology.findMany({
        where: {
          name: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        skip: skip * take,
        take,
        orderBy: {
          name: "asc",
        },
      });
    } catch (error) {
      console.error(error);
      throw new ServiceError(
        "Error searching technologies",
        400,
        "TECHNOLOGY_SEARCH_ERROR"
      );
    }
  }
  async countSearchResultsTech(searchTerm: string) {
    try {
      return await this.prisma.technology.count({
        where: {
          name: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      });
    } catch (error) {
      console.error(error);
      throw new ServiceError(
        "Error counting search results",
        400,
        "TECHNOLOGY_COUNT_ERROR"
      );
    }
  }
  async getFeaturedProjects(skip: number, take: number): Promise<Project[]> {
    try {
      return await this.prisma.project.findMany({
        where: {
          isFeatured: true,
        },
        include: {
          image: true,
          technologies: {
            include: {
              technology: true,
            },
          },
        },
        skip: skip * take,
        take,
        orderBy: {
          order: "asc",
        },
      });
    } catch (error) {
      console.error(error);
      throw new ServiceError(
        "Error getting featured projects",
        400,
        "PROJECT_GET_ERROR"
      );
    }
  }
  async countFeaturedProjects(): Promise<number> {
    try {
      return await this.prisma.project.count({
        where: {
          isFeatured: true,
        },
      });
    } catch (error) {
      console.error(error);
      throw new ServiceError(
        "Error counting featured projects",
        400,
        "PROJECT_COUNT_ERROR"
      );
    }
  }

  async countProjectsByStatus(status: ProjectStatus): Promise<number> {
    try {
      return await this.prisma.project.count({
        where: {
          status,
        },
      });
    } catch (error) {
      console.error(error);
      throw new ServiceError(
        "Error counting projects by status",
        400,
        "PROJECT_COUNT_ERROR"
      );
    }
  }

  async getProjectsByStatus(
    status: ProjectStatus,
    skip: number,
    take: number
  ): Promise<Project[]> {
    try {
      return await this.prisma.project.findMany({
        where: {
          status,
        },
        include: {
          image: true,
          technologies: {
            include: {
              technology: true,
            },
          },
        },
        skip: skip * take,
        take,
        orderBy: {
          createdAt: "desc",
        },
      });
    } catch (error) {
      console.error(error);
      throw new ServiceError(
        "Error getting projects by status",
        400,
        "PROJECT_GET_ERROR"
      );
    }
  }

  async getTechnologiesByCategory(
    category: string,
    skip: number,
    take: number
  ): Promise<Technology[]> {
    try {
      return await this.prisma.technology.findMany({
        where: {
          category: {
            equals: category,
            mode: "insensitive",
          },
        },
        include: {
          _count: {
            select: {
              projects: true,
            },
          },
        },
        skip: skip * take,
        take,
        orderBy: {
          name: "asc",
        },
      });
    } catch (error) {
      console.error(error);
      throw new ServiceError(
        "Error getting technologies by category",
        400,
        "TECHNOLOGY_GET_ERROR"
      );
    }
  }
  async countTechnologiesByCategory(category: string): Promise<number> {
    try {
      return await this.prisma.technology.count({
        where: {
          category: {
            equals: category,
            mode: "insensitive",
          },
        },
      });
    } catch (error) {
      console.error(error);
      throw new ServiceError(
        "Error getting technologies count by category",
        400,
        "TECHNOLOGY_GET_ERROR"
      );
    }
  }
  async getAllCategories({
    skip,
    take,
  }: {
    skip: number;
    take: number;
  }): Promise<string[]> {
    try {
      const technologies = await this.prisma.technology.findMany({
        select: {
          category: true,
        },
        distinct: ["category"],
        where: {
          AND: [
            {
              category: {
                not: null,
              },
            },
            {
              category: {
                not: "",
              },
            },
          ],
        },
        skip: skip * take,
        take,
        orderBy: {
          name: "asc",
        },
      });

      return technologies
        .map((t) => t.category)
        .filter((c): c is string => c !== null);
    } catch (error) {
      console.error(error);
      throw new ServiceError(
        "Error getting categories",
        400,
        "TECHNOLOGY_GET_ERROR"
      );
    }
  }
  async getCountCategories(): Promise<number> {
    try {
      return await this.prisma.technology.count({
        where: {
          AND: [
            {
              category: {
                not: null,
              },
            },
            {
              category: {
                not: "",
              },
            },
          ],
        },
      });
    } catch (error) {
      console.error(error);
      throw new ServiceError(
        "Error getting categories",
        400,
        "TECHNOLOGY_GET_ERROR"
      );
    }
  }
}
