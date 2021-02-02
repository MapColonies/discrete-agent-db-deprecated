import { RequestHandler } from 'express';
import httpStatus from 'http-status-codes';
import { injectable, inject } from 'tsyringe';
import { Services } from '../../common/constants';
import { ILogger } from '../../common/interfaces';
import { ILayerHistoryIdentifier, ILayerHistoryResponse, IUpdateLayerHistoryStatusRequestBody } from '../interfaces';

import { LayerHistoryManager } from '../models/layerHistoryManager';

type UpdateLayerHistoryHandler = RequestHandler<ILayerHistoryIdentifier, ILayerHistoryResponse, IUpdateLayerHistoryStatusRequestBody>;
type LayerHistoryHandler = RequestHandler<ILayerHistoryIdentifier, ILayerHistoryResponse>;

@injectable()
export class LayerHistoryController {
  public constructor(
    @inject(Services.LOGGER) private readonly logger: ILogger,
    @inject(LayerHistoryManager) private readonly manager: LayerHistoryManager
  ) {}

  public getLayerHistory: LayerHistoryHandler = async (req, res, next) => {
    try {
      const layer = await this.manager.get(req.params);
      return res.status(httpStatus.OK).json(layer);
    } catch (err) {
      next(err);
    }
  };

  public createLayerHistory: LayerHistoryHandler = async (req, res, next) => {
    try {
      const layer = await this.manager.create(req.params);
      return res.status(httpStatus.CREATED).json(layer);
    } catch (err) {
      next(err);
    }
  };

  public updateLayerHistoryStatus: UpdateLayerHistoryHandler = async (req, res, next) => {
    try {
      const layer = await this.manager.updateStatus(req.params, req.body.status);
      return res.status(httpStatus.OK).json(layer);
    } catch (err) {
      next(err);
    }
  };
}
