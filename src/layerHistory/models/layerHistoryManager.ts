import { inject, injectable } from 'tsyringe';
import { Services } from '../../common/constants';
import { HTTP_DUPLICATE, HTTP_NOT_FOUND } from '../../common/httpErrors';
import { ILogger } from '../../common/interfaces';
import { ConnectionManager } from '../../DAL/connectionManager';
import { LayerHistory, ProgressStatus } from '../../DAL/entity/layerHistory';
import { LayerHistoryRepository } from '../../DAL/repositories/layerHistoryRepository';
import { ILayerHistoryResponse } from '../interfaces';

@injectable()
export class LayerHistoryManager {
  private repository?: LayerHistoryRepository;

  public constructor(@inject(Services.LOGGER) private readonly logger: ILogger, private readonly connectionManager: ConnectionManager) {}

  public async get(directory: string): Promise<ILayerHistoryResponse | undefined> {
    const repository = await this.getRepository();
    const entity = await repository.get(directory);
    if (entity !== undefined) {
      return this.entityToModel(entity);
    } else {
      throw HTTP_NOT_FOUND;
    }
  }

  public async create(directory: string): Promise<ILayerHistoryResponse> {
    const repository = await this.getRepository();
    const exists = await repository.exists(directory);
    if (exists) {
      throw HTTP_DUPLICATE;
    }
    const layer = new LayerHistory({ directory });
    const entity = await repository.upsert(layer);
    return this.entityToModel(entity);
  }

  public async updateStatus(directory: string, status?: ProgressStatus, id?: string, version?: string): Promise<ILayerHistoryResponse> {
    const repository = await this.getRepository();
    const exists = await repository.exists(directory);
    if (exists) {
      const layer = new LayerHistory({ directory });
      if (status != undefined) {
        layer.status = status;
      }
      if (id != undefined) {
        layer.layerId = id;
      }
      if (version != undefined) {
        layer.version = version;
      }
      const entity = await repository.upsert(layer);
      return this.entityToModel(entity);
    } else {
      throw HTTP_NOT_FOUND;
    }
  }

  private async getRepository(): Promise<LayerHistoryRepository> {
    if (!this.repository) {
      if (!this.connectionManager.isConnected()) {
        await this.connectionManager.init();
      }
      this.repository = this.connectionManager.getLayerHistoryRepository();
    }
    return this.repository;
  }

  private entityToModel(entity: LayerHistory): ILayerHistoryResponse {
    const model: ILayerHistoryResponse = {
      directory: entity.directory,
      id: entity.layerId,
      version: entity.version,
      status: entity.status,
    };
    return model;
  }
}
