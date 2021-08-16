import { Repository, EntityRepository } from 'typeorm';
import { container } from 'tsyringe';
import { ILogger } from '../../common/interfaces';
import { Services } from '../../common/constants';
import { LayerHistory } from '../entity/layerHistory';
import { HTTP_INTERNAL_SERVER_ERROR } from '../../common/httpErrors';

@EntityRepository(LayerHistory)
export class LayerHistoryRepository extends Repository<LayerHistory> {
  private readonly appLogger: ILogger; //don't override internal repository logger.

  public constructor() {
    super();
    this.appLogger = container.resolve(Services.LOGGER); //direct injection don't work here due to being initialized by typeOrm
  }

  public async get(directory: string): Promise<LayerHistory | undefined> {
    try {
      return await this.findOne({ directory: directory });
    } catch (err) {
      if (err !== undefined) {
        this.appLogger.log('error', `get history for "${directory}". error: ${JSON.stringify(err)}`);
        throw HTTP_INTERNAL_SERVER_ERROR;
      }
      return undefined;
    }
  }

  public async upsert(layer: LayerHistory): Promise<LayerHistory> {
    this.appLogger.log('info', `upserting history for "${layer.directory}".`);
    try {
      return await this.save(layer);
    } catch (err) {
      this.appLogger.log('error', `failed to upsert history: ${JSON.stringify(layer)}. error: ${JSON.stringify(err)}`);
      throw HTTP_INTERNAL_SERVER_ERROR;
    }
  }

  public async exists(directory: string): Promise<boolean> {
    const res = await this.get(directory);
    return res != undefined;
  }
}
