import httpStatusCodes from 'http-status-codes';
import { container } from 'tsyringe';
import { newDb } from 'pg-mem'
import * as typeOrm from 'typeorm'
import { Setting } from '../../../src/DAL/entity/setting';
import { LayerHistory } from '../../../src/DAL/entity/layerHistory';

import { IStatus } from '../../../src/status/interfaces';
import { SettingsRepository } from '../../../src/DAL/repositories/settingsRepository';
import { registerTestValues } from '../testContainerConfig';
// eslint-disable-next-line jest/no-mocks-import
//import { initConnectionMock} from '../../__mocks__/typeorm23';
import * as requestSender from './helpers/requestSender';



const initConnectionMock = async (): Promise<void> => {
  const db = newDb({
    autoCreateForeignKeyIndices: true,
  });
  const connection = (await db.adapters.createTypeormConnection({
    type: 'postgres',
    entities: [Setting, LayerHistory],
  })) as typeOrm.Connection;
  
  // create schema
  await connection.synchronize();
  jest.spyOn(typeOrm,"createConnection").mockResolvedValue(connection);
};


describe('Status', function () {
  beforeAll(function () {
    //registerTestValues();
    //requestSender.init();
  });
  beforeEach(async () => {
    registerTestValues();
    requestSender.init();
    await initConnectionMock();
    //registerRepository(SettingsRepository, new SettingsRepository());
  });
  afterEach(function () {
    container.clearInstances();
  });

  describe('Happy Path', function () {
    it('should return 200 status code and the status', async function () {
      const response = await requestSender.getStatus();

      expect(response.status).toBe(httpStatusCodes.OK);

      const status = response.body as IStatus;
      expect(status.isWatching).toEqual(true);
    });

    it('should return 200 status code and update the status', async function () {
      const statusReq: IStatus = {
        isWatching: true,
      };
      const response = await requestSender.updateStatus(statusReq);

      expect(response.status).toBe(httpStatusCodes.OK);

      const status = response.body as IStatus;
      expect(status.isWatching).toEqual(true);
    });
  });
  describe('Bad Path', function () {
    // All requests with status code of 400
  });
  describe('Sad Path', function () {
    // All requests with status code 4XX-5XX
  });
});
