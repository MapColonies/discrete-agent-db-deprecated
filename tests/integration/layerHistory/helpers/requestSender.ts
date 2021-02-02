import * as supertest from 'supertest';
import { Application } from 'express';

import { container } from 'tsyringe';
import { ServerBuilder } from '../../../../src/serverBuilder';
import { ILayerHistoryIdentifier } from '../../../../src/layerHistory/interfaces';

let app: Application | null = null;

export function init(): void {
  const builder = container.resolve<ServerBuilder>(ServerBuilder);
  app = builder.build();
}

export async function getHistory(id: ILayerHistoryIdentifier): Promise<supertest.Response> {
  return supertest.agent(app).get(`/layers/${id.id}/${id.version}`).set('Content-Type', 'application/json');
}

export async function createHistory(id: ILayerHistoryIdentifier): Promise<supertest.Response> {
  return supertest.agent(app).post(`/layers/${id.id}/${id.version}`).set('Content-Type', 'application/json');
}

export async function updateHistoryStatus(id: ILayerHistoryIdentifier, body: Record<string, unknown>): Promise<supertest.Response> {
  return supertest.agent(app).put(`/layers/${id.id}/${id.version}`).set('Content-Type', 'application/json').send(body);
}
