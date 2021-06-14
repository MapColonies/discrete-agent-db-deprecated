import { readFileSync } from 'fs';
import { createConnection, Connection, ObjectType } from 'typeorm';
import { inject, singleton } from 'tsyringe';
import { ConnectionOptions } from 'typeorm';
import { Services } from '../common/constants';
import { IConfig, ILogger, IDbConfig } from '../common/interfaces';
import { HTTP_INTERNAL_SERVER_ERROR } from '../common/httpErrors';
import { SettingsRepository } from './repositories/settingsRepository';
import { LayerHistoryRepository } from './repositories/layerHistoryRepository';

@singleton()
export class ConnectionManager {
  private connection?: Connection;

  public constructor(@inject(Services.LOGGER) private readonly logger: ILogger, @inject(Services.CONFIG) private readonly config: IConfig) {}

  public async init(): Promise<void> {
    const connectionConfig = this.config.get<IDbConfig>('typeOrm');
    this.logger.log('info', `connection to database ${connectionConfig.database as string} on ${connectionConfig.host as string}`);
    try {
      const options = this.createConnectionOptions(connectionConfig);
      this.connection = await createConnection(options);
    } catch (err) {
      const errString = JSON.stringify(err, Object.getOwnPropertyNames(err));
      this.logger.log('error', `failed to connect to database: ${errString}`);
      throw HTTP_INTERNAL_SERVER_ERROR;
    }
  }

  private createConnectionOptions(dbConfig: IDbConfig): ConnectionOptions {
    const { enableSslAuth, sslPaths, ...connectionOptions } = dbConfig;
    if (enableSslAuth) {
      connectionOptions.password = undefined;
      connectionOptions.ssl = { key: readFileSync(sslPaths.key), cert: readFileSync(sslPaths.cert), ca: readFileSync(sslPaths.ca) };
    }
    return connectionOptions;
  }

  public isConnected(): boolean {
    return this.connection !== undefined;
  }

  public getSettingsRepository(): SettingsRepository {
    return this.getRepository(SettingsRepository);
  }

  public getLayerHistoryRepository(): LayerHistoryRepository {
    return this.getRepository(LayerHistoryRepository);
  }

  private getRepository<T>(repository: ObjectType<T>): T {
    if (!this.isConnected()) {
      const msg = 'failed to send request to database: no open connection';
      this.logger.log('error', msg);
      throw HTTP_INTERNAL_SERVER_ERROR;
    } else {
      const connection = this.connection as Connection;
      return connection.getCustomRepository(repository);
    }
  }
}
