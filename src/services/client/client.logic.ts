
import slugify from 'slugify';
import { randomUUID } from 'crypto';
import { ClientRepository } from './client.repository';
import { ClientValidator } from '../../errors/schema/client.validation.schema';
import {
  CreateClientDTO,
  IClient,
  IClientRepositoryCreateResponse,
  PaginatedResponse,
  PaginationParams,
  UpdateClient,
} from '../../types/client';
import {
  ClientError,
  ClientNotFoundError,
} from '../../errors/client.error';

export class ClientLogic {
  constructor(
    private repository: ClientRepository,
    private validator: ClientValidator
  ) {}

  async isValidOrder({ order }: { order: number }) {
    const isValid = await this.repository.isValidOrder({ order });
    return isValid;
  }

  async getAllClients(
    params: PaginationParams
  ): Promise<PaginatedResponse<IClient>> {
    const skip = params.skip || 0;
    const take = params.take || 10;

    const [clients, totalItems] = await Promise.all([
      this.repository.findMany(skip, take),
      this.repository.count(),
    ]);

    const remainingItems = totalItems - (skip * take + clients.length);

    return {
      data: clients as any,
      pagination: {
        totalItems,
        remainingItems,
        nowCount: clients.length,
        totalPages: Math.ceil(totalItems / take),
        currentPage: skip + 1,
        pageSize: take,
      },
    };
  }

  async getClientById(id: string): Promise<any> {
    this.validator.validateId(id);
    const client = await this.repository.findById(id);
    if (!client) {
      throw new ClientNotFoundError(id);
    }
    const { image, logo, ...rest } = client;
    return {
      Image: image,
      Logo: logo,
      client: rest,
    };
  }

  async getClientBySlug(
    slug: string
  ): Promise<Awaited<ReturnType<typeof this.repository.findBySlug>>> {
    this.validator.validateSlug(slug);
    const client = await this.repository.findBySlug(slug);
    if (!client) {
      throw new ClientError(
        `client with slug not found ${slug}`,
        404,
        'CLIENT_NOT_FOUND'
      );
    }
    return client;
  }

  async createClient(
    data: CreateClientDTO
  ): Promise<IClientRepositoryCreateResponse> {
    const valid = this.validator.validateCreate(data);
    const slug = slugify(data.name + randomUUID().substring(0, 8), {
      lower: true,
    });
    const client = await this.repository.create({
      ...valid,
      slug: slug,
    });
    if (!client) throw new Error('error create client');
    return client;
  }

  async deleteClient(clientId: string) {
    try {
      if (!clientId) throw new Error('id is required');
      this.validator.validateId(clientId);
      const deletedClient = await this.repository.delete(clientId);
      if (!deletedClient) throw new Error('error deleting client');
      return deletedClient;
    } catch (error) {
      console.error(error);
      throw new Error('Error deleting client');
    }
  }

  async Search(q: string) {
    if (!q)
      throw new ClientError(
        'search query is required',
        400,
        'SEARCH_QUERY_REQUIRED'
      );
    const clients = await this.repository.SearchClient(q, 0, 10);
    if (!clients)
      throw new ClientError(
        'error searching clients',
        400,
        'ERROR_SEARCHING_CLIENTS'
      );
    return clients;
  }

  async updateClient(data: UpdateClient) {
    this.validator.validateUpdate(data);
    const updatedClient = await this.repository.update(data);
    if (!updatedClient)
      throw new ClientError(
        'error updating client',
        400,
        'ERROR_UPDATING_CLIENT'
      );
    const { Image, Logo, ...rest } = updatedClient;
    return { Image, Logo, ...rest };
  }
}