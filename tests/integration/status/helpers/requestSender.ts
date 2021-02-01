import * as supertest from 'supertest';
import { Application } from 'express';

import { container } from 'tsyringe';
import { ServerBuilder } from '../../../../src/serverBuilder';
import { IStatus } from '../../../../src/status/interfaces';

let app: Application | null = null;

export function init(): void {
  const builder = container.resolve<ServerBuilder>(ServerBuilder);
  app = builder.build();
}

export async function getStatus(): Promise<supertest.Response> {
  return supertest.agent(app).get('/status').set('Content-Type', 'application/json');
}

export async function updateStatus(status: IStatus): Promise<supertest.Response> {
  return supertest.agent(app).post('/status').set('Content-Type', 'application/json').send(status);
}
