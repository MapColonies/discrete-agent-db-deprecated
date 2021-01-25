import { inject, injectable } from 'tsyringe';
import { Services, SettingsKeys } from '../../common/constants';
import { ILogger } from '../../common/interfaces';
import { ConnectionManager } from '../../DAL/connectionManager';
import { Setting } from '../../DAL/entity/setting';
import { SettingsRepository } from '../../DAL/repositories/settingsRepository';
import { IStatus } from '../interfaces';

@injectable()
export class StatusManager {
  private repository?: SettingsRepository;

  public constructor(@inject(Services.LOGGER) private readonly logger: ILogger, private readonly connectionManager: ConnectionManager) {}

  public async getStatus(): Promise<IStatus> {
    const repository = await this.getRepository();
    const record = await repository.get(SettingsKeys.IS_WATCHING);
    const status = this.entityToModel(record);
    return status;
  }

  public async updateStatus(status: IStatus): Promise<IStatus> {
    const repository = await this.getRepository();
    const isWatching = status.isWatching.toString();
    const record = await repository.upsert({
      key: SettingsKeys.IS_WATCHING,
      value: isWatching,
    });
    return this.entityToModel(record);
  }

  private async getRepository(): Promise<SettingsRepository> {
    if (!this.repository) {
      if (!this.connectionManager.isConnected()) {
        await this.connectionManager.init();
      }
      this.repository = this.connectionManager.getSettingsRepository();
    }
    return this.repository;
  }

  private entityToModel(entity?: Setting): IStatus {
    const isWatching = entity != undefined && entity.value.toLowerCase() === 'true';
    const status: IStatus = {
      isWatching: isWatching,
    };
    return status;
  }
}
