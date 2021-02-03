import { Router } from 'express';
import { FactoryFunction } from 'tsyringe';
import { LayerHistoryController } from '../controllers/layerHistoryController';

const layerHistoryRouterFactory: FactoryFunction<Router> = (dependencyContainer) => {
  const router = Router();
  const controller = dependencyContainer.resolve(LayerHistoryController);

  router.get('/:id/:version', controller.getLayerHistory);
  router.post('/:id/:version', controller.createLayerHistory);
  router.put('/:id/:version', controller.updateLayerHistoryStatus);

  return router;
};

export { layerHistoryRouterFactory };
