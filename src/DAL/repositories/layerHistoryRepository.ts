import { Repository, EntityRepository } from 'typeorm';
import { container } from 'tsyringe';
import { ILogger } from '../../common/interfaces';
import { Services } from '../../common/constants';
import { LayerHistory } from '../entity/layerHistory';

@EntityRepository(LayerHistory)
export class LayerHistoryRepository extends Repository<LayerHistory> {
  private readonly appLogger: ILogger; //don't override internal repository logger.

  public constructor() {
    super();
    this.appLogger = container.resolve(Services.LOGGER); //direct injection don't work here due to being initialized by typeOrm
  }

  public async get(id: string, version: string): Promise<LayerHistory | undefined> {
    //TODO: add custom error and logging
    return this.findOne({ layerId: id, version: version });
  }

  public async upsert(layer: LayerHistory): Promise<LayerHistory | undefined> {
    this.appLogger.log('info', `upserting layer "${layer.layerId} - ${layer.version}". status: "${layer.status as string}"`);
    //TODO: add custom error and logging
    return this.save(layer);
  }

  public async exists(id: string, version: string): Promise<boolean> {
    const res = await this.get(id, version);
    return res != undefined;
  }
}
