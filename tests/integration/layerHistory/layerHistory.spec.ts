import httpStatusCodes from 'http-status-codes';
import { container } from 'tsyringe';
import { LayerHistoryRepository } from '../../../src/DAL/repositories/layerHistoryRepository';
import { registerTestValues } from '../testContainerConfig';
import { registerRepository, initTypeOrmMocks, findOneMock, saveMock } from '../../mocks/DBMock';
import { ILayerHistoryIdentifier, ILayerHistoryResponse } from '../../../src/layerHistory/interfaces';
import { LayerHistory, ProgressStatus } from '../../../src/DAL/entity/layerHistory';
import * as requestSender from './helpers/requestSender';

//test data
const historyIdentifier: ILayerHistoryIdentifier = {
  id: '7c737f81-705e-4455-83e5-83107abcf2e9',
  version: 'testVersion',
};
const pendingHistoryResponse: ILayerHistoryResponse = {
  id: '7c737f81-705e-4455-83e5-83107abcf2e9',
  version: 'testVersion',
  status: ProgressStatus.PENDING,
};
const triggeredHistoryResponse: ILayerHistoryResponse = {
  id: '7c737f81-705e-4455-83e5-83107abcf2e9',
  version: 'testVersion',
  status: ProgressStatus.TRIGGERED,
};
const pendingHistoryRecord = new LayerHistory('7c737f81-705e-4455-83e5-83107abcf2e9', 'testVersion');
const triggeredHistoryRecord = new LayerHistory('7c737f81-705e-4455-83e5-83107abcf2e9', 'testVersion', ProgressStatus.TRIGGERED);
const findRequest = {
  layerId: '7c737f81-705e-4455-83e5-83107abcf2e9',
  version: 'testVersion',
};

describe('LayerHistory', function () {
  beforeEach(() => {
    registerTestValues();
    requestSender.init();
    initTypeOrmMocks();
    registerRepository(LayerHistoryRepository, new LayerHistoryRepository());
  });
  afterEach(function () {
    container.clearInstances();
    jest.resetAllMocks();
  });

  describe('Happy Path', function () {
    it('get should return 200 status code and the history', async function () {
      findOneMock.mockResolvedValue(pendingHistoryRecord);

      const response = await requestSender.getHistory(historyIdentifier);

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(response.body).toEqual(pendingHistoryResponse);
      expect(findOneMock).toHaveBeenCalledTimes(1);
      expect(findOneMock).toHaveBeenCalledWith(findRequest);
    });

    it('update should return 200 status code and update the history', async function () {
      saveMock.mockResolvedValue(triggeredHistoryRecord);
      findOneMock.mockResolvedValue(pendingHistoryRecord);

      const response = await requestSender.updateHistoryStatus(historyIdentifier, {
        status: ProgressStatus.TRIGGERED,
      });

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(response.body).toEqual(triggeredHistoryResponse);
      expect(saveMock).toHaveBeenCalledTimes(1);
      expect(saveMock).toHaveBeenCalledWith(triggeredHistoryRecord);
      expect(findOneMock).toHaveBeenCalledTimes(1);
      expect(findOneMock).toHaveBeenCalledWith(findRequest);
    });

    it('create should return 201 status code and create history', async function () {
      saveMock.mockResolvedValue(pendingHistoryRecord);
      findOneMock.mockResolvedValue(undefined);

      const response = await requestSender.createHistory(historyIdentifier);

      expect(response.status).toBe(httpStatusCodes.CREATED);
      expect(response.body).toEqual(pendingHistoryResponse);
      expect(saveMock).toHaveBeenCalledTimes(1);
      expect(saveMock).toHaveBeenCalledWith(pendingHistoryRecord);
      expect(findOneMock).toHaveBeenCalledTimes(1);
      expect(findOneMock).toHaveBeenCalledWith(findRequest);
    });
  });

  describe('Bad Path', function () {
    // All requests with status code of 400
    it('update should return 400 status code when given invalid data', async function () {
      const response = await requestSender.updateHistoryStatus(historyIdentifier, {
        status: 'invalid state',
      });

      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
      expect(saveMock).toHaveBeenCalledTimes(0);
      expect(findOneMock).toHaveBeenCalledTimes(0);
    });
  });

  describe('Sad Path', function () {
    // All requests with status code 4XX-5XX
    it('get should return 404 status code when given none existing id', async function () {
      findOneMock.mockResolvedValue(undefined);
      const response = await requestSender.getHistory(historyIdentifier);

      expect(response.status).toBe(httpStatusCodes.NOT_FOUND);
      expect(saveMock).toHaveBeenCalledTimes(0);
      expect(findOneMock).toHaveBeenCalledTimes(1);
      expect(findOneMock).toHaveBeenCalledWith(findRequest);
    });

    it('update should return 404 status code when given none existing id', async function () {
      findOneMock.mockResolvedValue(undefined);
      const response = await requestSender.updateHistoryStatus(historyIdentifier, {
        status: ProgressStatus.TRIGGERED,
      });

      expect(response.status).toBe(httpStatusCodes.NOT_FOUND);
      expect(saveMock).toHaveBeenCalledTimes(0);
      expect(findOneMock).toHaveBeenCalledTimes(1);
      expect(findOneMock).toHaveBeenCalledWith(findRequest);
    });

    it('create should return 409 status code when given existing id', async function () {
      findOneMock.mockResolvedValue(pendingHistoryRecord);
      const response = await requestSender.createHistory(historyIdentifier);

      expect(response.status).toBe(httpStatusCodes.CONFLICT);
      expect(saveMock).toHaveBeenCalledTimes(0);
      expect(findOneMock).toHaveBeenCalledTimes(1);
      expect(findOneMock).toHaveBeenCalledWith(findRequest);
    });

    it('get should return 500 status on db error', async function () {
      findOneMock.mockRejectedValue(new Error('test db error'));

      const response = await requestSender.getHistory(historyIdentifier);

      expect(response.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
      expect(saveMock).toHaveBeenCalledTimes(0);
      expect(findOneMock).toHaveBeenCalledTimes(1);
      expect(findOneMock).toHaveBeenCalledWith(findRequest);
    });

    it('update should return 500 status on find db error', async function () {
      findOneMock.mockRejectedValue({ name: 'DUMMY_DB_ERROR', message: 'DUMMY DB ERROR' });

      const response = await requestSender.updateHistoryStatus(historyIdentifier, {
        status: ProgressStatus.TRIGGERED,
      });

      expect(response.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
      expect(saveMock).toHaveBeenCalledTimes(0);
      expect(findOneMock).toHaveBeenCalledTimes(1);
      expect(findOneMock).toHaveBeenCalledWith(findRequest);
    });

    it('update should return 500 status on save db error', async function () {
      findOneMock.mockResolvedValue(pendingHistoryRecord);
      saveMock.mockRejectedValue(new Error('test db error'));

      const response = await requestSender.updateHistoryStatus(historyIdentifier, {
        status: ProgressStatus.TRIGGERED,
      });

      expect(response.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
      expect(saveMock).toHaveBeenCalledTimes(1);
      expect(findOneMock).toHaveBeenCalledTimes(1);
      expect(findOneMock).toHaveBeenCalledWith(findRequest);
    });

    it('create should return 500 status on find db error', async function () {
      findOneMock.mockRejectedValue(new Error('test db error'));

      const response = await requestSender.createHistory(historyIdentifier);

      expect(response.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
      expect(saveMock).toHaveBeenCalledTimes(0);
      expect(findOneMock).toHaveBeenCalledTimes(1);
      expect(findOneMock).toHaveBeenCalledWith(findRequest);
    });

    it('create should return 500 status on save db error', async function () {
      findOneMock.mockResolvedValue(undefined);
      saveMock.mockRejectedValue(new Error('test db error'));

      const response = await requestSender.createHistory(historyIdentifier);

      expect(response.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
      expect(saveMock).toHaveBeenCalledTimes(1);
      expect(findOneMock).toHaveBeenCalledTimes(1);
      expect(findOneMock).toHaveBeenCalledWith(findRequest);
    });
  });
});
