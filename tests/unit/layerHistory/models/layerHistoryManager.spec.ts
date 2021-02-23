import { HTTP_DUPLICATE, HTTP_NOT_FOUND } from '../../../../src/common/httpErrors';
import { ConnectionManager } from '../../../../src/DAL/connectionManager';
import { LayerHistory, ProgressStatus } from '../../../../src/DAL/entity/layerHistory';
import { ILayerHistoryIdentifier, ILayerHistoryResponse } from '../../../../src/layerHistory/interfaces';
import { LayerHistoryManager } from '../../../../src/layerHistory/models/layerHistoryManager';

let layerHistoryManager: LayerHistoryManager;
//db mock
const isConnectedMock = jest.fn();
const initMock = jest.fn();
const getLayerHistoryRepository = jest.fn();
const connectionManagerMock = ({
  isConnected: isConnectedMock,
  init: initMock,
  getLayerHistoryRepository: getLayerHistoryRepository,
} as unknown) as ConnectionManager;
const getMock = jest.fn();
const upsertMock = jest.fn();
const existsMock = jest.fn();
const repositoryMock = {
  get: getMock,
  upsert: upsertMock,
  exists: existsMock,
};

//test data
const historyIdentifier: ILayerHistoryIdentifier = {
  id: 'testId',
  version: 'testVersion',
};
const pendingHistoryResponse: ILayerHistoryResponse = {
  id: 'testId',
  version: 'testVersion',
  status: ProgressStatus.PENDING,
};
const triggeredHistoryResponse: ILayerHistoryResponse = {
  id: 'testId',
  version: 'testVersion',
  status: ProgressStatus.TRIGGERED,
};
const pendingHistoryRecord = new LayerHistory('testId', 'testVersion');
const triggeredHistoryRecord = new LayerHistory('testId', 'testVersion', ProgressStatus.TRIGGERED);

describe('LayerHistoryManager', () => {
  beforeEach(function () {
    jest.resetAllMocks();
    getLayerHistoryRepository.mockReturnValue(repositoryMock);
    layerHistoryManager = new LayerHistoryManager({ log: jest.fn() }, connectionManagerMock);
  });

  describe('getLayerHistory', () => {
    it('returns layer history when exists', async function () {
      getMock.mockResolvedValue(pendingHistoryRecord);
      // action
      const resource = await layerHistoryManager.get(historyIdentifier);

      // expectation
      expect(resource).toEqual(pendingHistoryResponse);
      expect(getMock).toHaveBeenCalledTimes(1);
      expect(getMock).toHaveBeenCalledWith(historyIdentifier.id, historyIdentifier.version);
    });

    it('throws error when not exists', async function () {
      getMock.mockResolvedValue(undefined);
      // action
      const action = async () => {
        await layerHistoryManager.get(historyIdentifier);
      };

      // expectation
      await expect(action).rejects.toEqual(HTTP_NOT_FOUND);
      expect(getMock).toHaveBeenCalledTimes(1);
      expect(getMock).toHaveBeenCalledWith(historyIdentifier.id, historyIdentifier.version);
    });
  });

  describe('updateHistoryStatus', () => {
    it('progress status is updated and returned', async function () {
      existsMock.mockResolvedValue(true);
      upsertMock.mockResolvedValue(triggeredHistoryRecord);
      // action
      const resource = await layerHistoryManager.updateStatus(historyIdentifier, ProgressStatus.TRIGGERED);

      // expectation
      expect(resource).toEqual(triggeredHistoryResponse);
      expect(upsertMock).toHaveBeenCalledWith(triggeredHistoryRecord);
      expect(upsertMock).toHaveBeenCalledTimes(1);
      expect(existsMock).toHaveBeenCalledTimes(1);
    });

    it('error is thrown when updating none existing history', async function () {
      existsMock.mockResolvedValue(false);
      // action
      const action = async () => {
        await layerHistoryManager.updateStatus(historyIdentifier, ProgressStatus.TRIGGERED);
      };
      // expectation
      await expect(action).rejects.toEqual(HTTP_NOT_FOUND);
      expect(upsertMock).toHaveBeenCalledTimes(0);
      expect(existsMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('CreateHistory', () => {
    it('history is created and returned', async function () {
      existsMock.mockResolvedValue(false);
      upsertMock.mockResolvedValue(pendingHistoryRecord);
      // action
      const resource = await layerHistoryManager.create(historyIdentifier);

      // expectation
      expect(resource).toEqual(pendingHistoryResponse);
      expect(upsertMock).toHaveBeenCalledWith(pendingHistoryRecord);
      expect(upsertMock).toHaveBeenCalledTimes(1);
      expect(existsMock).toHaveBeenCalledTimes(1);
    });

    it('error is thrown when trying to create existing history', async function () {
      existsMock.mockResolvedValue(true);
      // action
      const action = async () => {
        await layerHistoryManager.create(historyIdentifier);
      };
      // expectation
      await expect(action).rejects.toEqual(HTTP_DUPLICATE);
      expect(upsertMock).toHaveBeenCalledTimes(0);
      expect(existsMock).toHaveBeenCalledTimes(1);
    });
  });
});
