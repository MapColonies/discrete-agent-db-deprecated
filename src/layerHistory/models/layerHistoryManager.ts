import { inject, injectable } from 'tsyringe';
import { Services } from '../../common/constants';
import { ILogger } from '../../common/interfaces';
import { ConnectionManager } from '../../DAL/connectionManager';
import { LayerHistory, ProgressStatus } from '../../DAL/entity/layerHistory';
import { LayerHistoryRepository } from '../../DAL/repositories/layerHistoryRepository';
import { ILayerHistoryIdentifier, ILayerHistoryResponse } from '../interfaces';

@injectable()
export class LayerHistoryManager {
  private repository?: LayerHistoryRepository;

  public constructor(@inject(Services.LOGGER) private readonly logger: ILogger, private readonly connectionManager: ConnectionManager) {}

  public async get(id: ILayerHistoryIdentifier): Promise<ILayerHistoryResponse | undefined> {
    const repository = await this.getRepository();
    const entity = await repository.get(id.id, id.version);
    if (entity !== undefined) {
      return this.entityToModel(entity);
    } else {
      // TODO: replace with costume error that will be handled as 404
      throw new Error('record not found');
    }
  }

  public async create(id: ILayerHistoryIdentifier): Promise<ILayerHistoryResponse> {
    const repository = await this.getRepository();
    const exists = await repository.exists(id.id, id.version);
    if (exists) {
      // TODO: replace with costume error that will be handled as conflict
      throw new Error('duplicate record');
    }
    const layer = new LayerHistory(id.id, id.version);
    const entity = await repository.upsert(layer);
    return this.entityToModel(entity);
  }

  public async updateStatus(id: ILayerHistoryIdentifier, status: ProgressStatus): Promise<ILayerHistoryResponse> {
    const repository = await this.getRepository();
    const exists = await repository.exists(id.id, id.version);
    if (exists) {
      const layer = new LayerHistory({
        layerId: id.id,
        version: id.version,
        status: status,
      });
      const entity = await repository.upsert(layer);
      return this.entityToModel(entity);
    } else {
      // TODO: replace with costume error that will be handled as 404
      throw new Error('record not found');
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
      id: entity.layerId,
      version: entity.version,
      status: entity.status,
    };
    return model;
  }
}
