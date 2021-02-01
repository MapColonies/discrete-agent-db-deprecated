import httpStatusCodes from 'http-status-codes';
import { container } from 'tsyringe';
import { IStatus } from '../../../src/status/interfaces';
import { SettingsRepository } from '../../../src/DAL/repositories/settingsRepository';
import { registerTestValues } from '../testContainerConfig';
import { registerRepository, initTypeOrmMocks, findOneMock, saveMock } from '../../mocks/DBMock';
import { SettingsKeys } from '../../../src/common/constants';
import * as requestSender from './helpers/requestSender';

const watchingSetting = { key: SettingsKeys.IS_WATCHING, value: 'true' };

describe('Status', function () {
  beforeEach(() => {
    registerTestValues();
    requestSender.init();
    initTypeOrmMocks();
    registerRepository(SettingsRepository, new SettingsRepository());
  });
  afterEach(function () {
    container.clearInstances();
  });

  describe('Happy Path', function () {
    it('should return 200 status code and the status', async function () {
      findOneMock.mockResolvedValue(watchingSetting);

      const response = await requestSender.getStatus();

      expect(findOneMock).toHaveBeenCalledTimes(1);
      expect(findOneMock).toHaveBeenCalledWith({ key: SettingsKeys.IS_WATCHING });
      expect(response.status).toBe(httpStatusCodes.OK);

      const status = response.body as IStatus;
      expect(status.isWatching).toEqual(true);
    });

    it('should return 200 status code and update the status', async function () {
      saveMock.mockResolvedValue(watchingSetting);
      const statusReq: IStatus = {
        isWatching: true,
      };
      const response = await requestSender.updateStatus(statusReq);

      expect(saveMock).toHaveBeenCalledTimes(1);
      expect(saveMock).toHaveBeenCalledWith(watchingSetting);
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
