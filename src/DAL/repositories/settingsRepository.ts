import { Repository, EntityRepository } from 'typeorm';
import { container } from 'tsyringe';
import { Setting } from '../entity/setting';
import { ILogger } from '../../common/interfaces';
import { Services } from '../../common/constants';
import { HTTP_INTERNAL_SERVER_ERROR } from '../../common/httpErrors';

@EntityRepository(Setting)
export class SettingsRepository extends Repository<Setting> {
  private readonly appLogger: ILogger; //don't override internal repository logger.

  public constructor() {
    super();
    this.appLogger = container.resolve(Services.LOGGER); //direct injection don't work here due to being initialized by typeOrm
  }

  public async get(key: string): Promise<Setting | undefined> {
    try {
      return await this.findOne({ key: key });
    } catch (err) {
      if (err !== undefined) {
        this.appLogger.log('error', `get settings "${key}". error: ${JSON.stringify(err)}`);
        throw HTTP_INTERNAL_SERVER_ERROR;
      }
      return undefined;
    }
  }

  public async upsert(setting: Setting): Promise<Setting | undefined> {
    this.appLogger.log('info', `updated setting "${setting.key}" to "${setting.value}"`);
    try {
      return await this.save(setting);
    } catch (err) {
      this.appLogger.log('error', `upsert settings: ${JSON.stringify(setting)}. error: ${JSON.stringify(err)}`);
      throw HTTP_INTERNAL_SERVER_ERROR;
    }
  }

  public async getAll(): Promise<Setting[] | undefined> {
    try {
      return await this.find();
    } catch (err) {
      this.appLogger.log('error', `get all settings. error: ${JSON.stringify(err)}`);
      throw HTTP_INTERNAL_SERVER_ERROR;
    }
  }
}
