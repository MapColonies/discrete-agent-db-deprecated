import * as supertest from 'supertest';
import { Application } from 'express';

import { container } from 'tsyringe';
import { ServerBuilder } from '../../../../src/serverBuilder';

let app: Application | null = null;

export function init(): void {
  const builder = container.resolve<ServerBuilder>(ServerBuilder);
  app = builder.build();
}

export async function getHistory(directory: string): Promise<supertest.Response> {
  directory = encodeURIComponent(directory);
  return supertest.agent(app).get(`/layers/${directory}`).set('Content-Type', 'application/json');
}

export async function createHistory(directory: string): Promise<supertest.Response> {
  directory = encodeURIComponent(directory);
  return supertest.agent(app).post(`/layers/${directory}`).set('Content-Type', 'application/json');
}

export async function updateHistoryStatus(directory: string, body: Record<string, unknown>): Promise<supertest.Response> {
  directory = encodeURIComponent(directory);
  return supertest.agent(app).put(`/layers/${directory}`).set('Content-Type', 'application/json').send(body);
}
