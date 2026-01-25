import { randomUUID } from 'crypto';
import { PrismaClientConfig } from '../../config/prisma';
import {
  deleteImageById,
  UploadImage,
  AssignImageToDBImage,
} from '../../lib/helpers';
import { CreateTestimonialDTO, InterFaceSearchTestimonial, UpdateTestimonial } from '../../types/testimonal';
import { TestimonialError } from '../../errors/testimonal.error';

export class TestimonialRepository {
  constructor(private prisma: PrismaClientConfig) {}

  async findMany(skip: number, take: number) {
    const testimonials = await this.prisma.testimonial.findMany({
      include: {
        avatar: true,
        TestimonialTranslation: {
          select: {
            clientName: true,
            clientPosition: true,
            clientCompany: true,
            content: true,
            lang: true,
          },
        },
        slideShows: {
          include: {
            slideShow: true,
          },
        },
      },
      skip: skip * take,
      take: take,
      orderBy: {
        order: 'asc',
      },
    });

    return testimonials.map((testimonial) => {
      const { avatar, TestimonialTranslation, slideShows, ...rest } = testimonial;
      return {
        testimonial: { ...rest },
        avatar: avatar || null,
        translation: TestimonialTranslation,
        slideShows,
      };
    });
  }

  async isValidOrder({ order }: { order: number }) {
    try {
      const find = await this.prisma.testimonial.findFirst({
        where: { order },
      });
      return {
        isValid: !find,
        takenby: find,
      };
    } catch (error) {
      console.error(error);
      throw new Error('Error finding testimonial by order');
    }
  }

  async count() {
    return this.prisma.testimonial.count();
  }

  async findById(id: string) {
    try {
      const testimonial = await this.prisma.testimonial.findUnique({
        where: { id },
        include: {
          avatar: true,
          TestimonialTranslation: {
            select: {
              clientName: true,
              clientPosition: true,
              clientCompany: true,
              content: true,
              lang: true,
            },
          },
          slideShows: {
            include: {
              slideShow: true,
            },
          },
        },
      });

      if (!testimonial) return null;

      const { avatar, TestimonialTranslation, slideShows, ...rest } = testimonial;
      return {
        testimonial: { ...rest },
        Avatar: avatar || null,
        translation: TestimonialTranslation,
        slideShows,
      };
    } catch (error) {
      console.error(error);
      throw new Error('Error finding testimonial by ID');
    }
  }

  async SearchTestimonial(
    lang: 'EN' | 'AR',
    searchTerm: string,
    skip: number,
    take: number
  ): Promise<InterFaceSearchTestimonial[]> {
    try {
      const testimonials = await this.prisma.testimonial.findMany({
        where: {
          OR: [
            {
              TestimonialTranslation: {
                some: {
                  clientName: {
                    contains: searchTerm,
                    mode: 'insensitive',
                  },
                },
              },
            },
            {
              TestimonialTranslation: {
                some: {
                  clientPosition: {
                    contains: searchTerm,
                    mode: 'insensitive',
                  },
                },
              },
            },
            {
              TestimonialTranslation: {
                some: {
                  clientCompany: {
                    contains: searchTerm,
                    mode: 'insensitive',
                  },
                },
              },
            },
            {
              TestimonialTranslation: {
                some: {
                  content: {
                    contains: searchTerm,
                    mode: 'insensitive',
                  },
                },
              },
            },
          ],
        },
        include: {
          avatar: true,
          TestimonialTranslation: {
            where: { lang },
            select: {
              clientName: true,
              clientPosition: true,
              clientCompany: true,
              content: true,
              lang: true,
            },
          },
        },
        skip: skip * take,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      });

      return testimonials.map((testimonial) => {
        const { avatar, TestimonialTranslation, ...rest } = testimonial;
        return {
          ...rest,
          translation: TestimonialTranslation,
          avatar,
        } as InterFaceSearchTestimonial;
      });
    } catch (error) {
      console.error(error);
      throw new TestimonialError(
        'Error searching testimonial',
        400,
        'TESTIMONIAL_SEARCH_ERROR'
      );
    }
  }

  async create(lang: 'EN' | 'AR', data: CreateTestimonialDTO) {
    try {
      const transaction = await this.prisma.$transaction(
        async (tx) => {
          let avatarId: string | null = null;

          // Upload avatar if provided
          if (data.avatar) {
            const createAvatar = await UploadImage(data.avatar, data.clientName);
            if (!createAvatar) throw new Error('error upload avatar');

            const avatarToDB = await AssignImageToDBImage(
              {
                imageType: 'TESTIMONIAL',
                blurhash: createAvatar.blurhash,
                width: createAvatar.width,
                height: createAvatar.height,
                data: createAvatar.data,
              },
              tx
            );
            if (!avatarToDB) throw new Error('error create avatarToDB');
            avatarId = avatarToDB.id;
          }

          const testimonial = await tx.testimonial.create({
            data: {
              clientName : "" , 
              content:"",
              rating: data.rating || 5,
              avatarId: avatarId,
              isActive: data.isActive ?? true,
              isFeatured: data.isFeatured ?? false,
              order: data.order || 0,
              TestimonialTranslation: {
                create: {
                  clientName: data.clientName,
                  clientPosition: data.clientPosition,
                  clientCompany: data.clientCompany,
                  content: data.content,
                  lang: lang,
                },
              },
            },
            include: {
              avatar: true,
              TestimonialTranslation: {
                where: { lang },
                select: {
                  clientName: true,
                  clientPosition: true,
                  clientCompany: true,
                  content: true,
                  lang: true,
                },
              },
            },
          });

          const { avatar, TestimonialTranslation, ...rest } = testimonial;
          return {
            Avatar: avatar,
            translation: TestimonialTranslation,
            testimonial: rest,
          };
        },
        {
          timeout: 20000,
          isolationLevel: 'Serializable',
          maxWait: 5000,
        }
      );
      return transaction;
    } catch (error) {
      console.error(error);
      throw new Error('Error creating testimonial');
    }
  }

  async update(lang: 'EN' | 'AR', data: UpdateTestimonial) {
    try {
      const transaction = await this.prisma.$transaction(
        async (prismaTx) => {
          let NewAvatarId: string | null = null;

          if (!data.testimonialId) throw new Error('no testimonialId provided');

          const testimonial = await prismaTx.testimonial.findUnique({
            where: { id: data.testimonialId },
          });

          if (!testimonial) throw new Error('testimonial not found');

          NewAvatarId = testimonial?.avatarId || null;

          // Handle avatar update/removal
          if (data.avatarState === 'REMOVE') {
            if (testimonial.avatarId) {
              await prismaTx.testimonial.update({
                where: { id: data.testimonialId },
                data: { avatarId: null },
              });
              await deleteImageById(testimonial.avatarId, prismaTx);
            }
            NewAvatarId = null;
          }

          if (data.avatarState === 'UPDATE') {
            if (testimonial.avatarId) {
              await prismaTx.testimonial.update({
                where: { id: data.testimonialId },
                data: { avatarId: null },
              });
              await deleteImageById(testimonial.avatarId, prismaTx);
            }

            if (!data.avatar) throw new Error('no avatar provided');

            const createAvatar = await UploadImage(
              data.avatar,
              data.clientName || 'update'
            );

            if (!createAvatar) throw new Error('error upload avatar');

            const avatarToDB = await AssignImageToDBImage(
              {
                imageType: 'TESTIMONIAL',
                blurhash: createAvatar.blurhash,
                width: createAvatar.width,
                height: createAvatar.height,
                data: createAvatar.data,
              },
              prismaTx
            );

            if (!avatarToDB) throw new Error('error create avatarToDB');
            NewAvatarId = avatarToDB.id;
          }

          // Update the testimonial with new data
          const updatedTestimonial = await prismaTx.testimonial.update({
            where: { id: data.testimonialId },
            data: {
              rating: data.rating ?? testimonial.rating,
              avatarId: NewAvatarId,
              isActive: data.isActive ?? testimonial.isActive,
              isFeatured: data.isFeatured ?? testimonial.isFeatured,
              order: data.order ?? testimonial.order,
            },
            include: {
              avatar: true,
            },
          });

          // Update or create translation
          const t = await prismaTx.testimonialTranslation.upsert({
            where: {
              testimonialId_lang: {
                testimonialId: data.testimonialId,
                lang: lang,
              },
            },
            update: {
              clientName: data.clientName,
              clientPosition: data.clientPosition,
              clientCompany: data.clientCompany,
              content: data.content,
            },
            create: {
              testimonialId: data.testimonialId,
              clientName: data.clientName || 'Client',
              clientPosition: data.clientPosition,
              clientCompany: data.clientCompany,
              content: data.content || '',
              lang: lang,
            },
          });

          const { avatar, ...rest } = updatedTestimonial;
          return {
            Avatar: avatar,
            translation: t,
            testimonial: rest,
          };
        },
        {
          timeout: 20000,
          maxWait: 5000,
        }
      );

      return transaction;
    } catch (error) {
      console.error(error);
      throw new Error('Error updating testimonial');
    }
  }

  async delete(id: string) {
    try {
      const transaction = await this.prisma.$transaction(
        async (prismaTx) => {
          const testimonial = await prismaTx.testimonial.findUnique({ 
            where: { id } 
          });
          if (!testimonial) throw new Error('testimonial not found');

          await prismaTx.testimonial.update({
            where: { id },
            data: { avatarId: null },
          });

          if (testimonial.avatarId) 
            await deleteImageById(testimonial.avatarId, prismaTx);

          await prismaTx.testimonial.delete({ where: { id } });
          return testimonial;
        },
        {
          timeout: 20000,
          maxWait: 5000,
        }
      );
      return transaction;
    } catch (error) {
      console.error(error);
      throw new Error('Error deleting testimonial');
    }
  }
}