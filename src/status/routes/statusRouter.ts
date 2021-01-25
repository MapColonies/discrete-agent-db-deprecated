import { Router } from 'express';
import { FactoryFunction } from 'tsyringe';
import { StatusController } from '../controllers/statusController';

const statusRouterFactory: FactoryFunction<Router> = (dependencyContainer) => {
  const router = Router();
  const controller = dependencyContainer.resolve(StatusController);

  router.get('/', controller.getStatus);
  router.post('/', controller.updateStatus);

  return router;
};

export { statusRouterFactory };
