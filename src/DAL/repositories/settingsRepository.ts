import { Repository, EntityRepository } from 'typeorm';
import { container } from 'tsyringe';
import { Setting } from '../entity/setting';
import { ILogger } from '../../common/interfaces';
import { Services } from '../../common/constants';

@EntityRepository(Setting)
export class ImageDataRepository extends Repository<Setting> {
  private readonly appLogger: ILogger; //don't override internal repository logger.

  public constructor() {
    super();
    this.appLogger = container.resolve(Services.LOGGER); //direct injection don't work here due to being initialized by typeOrm
  }

  public async get(key: string): Promise<Setting | undefined> {
    //TODO: add custom error and logging
    return this.findOne({ key: key });
  }

  public async upsert(setting: Setting): Promise<Setting | undefined> {
    this.appLogger.log('info', `updated setting "${setting.key}" to "${setting.value}"`);
    //TODO: add custom error and logging
    return this.save(setting);
  }

  public async getAll(): Promise<Setting[] | undefined> {
    //TODO: add custom error and logging
    return this.find();
  }
}
