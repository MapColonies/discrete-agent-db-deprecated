import { Repository, Connection } from 'typeorm';
import { newDb } from 'pg-mem';
import { Setting } from '../../src/DAL/entity/setting';
import { LayerHistory } from '../../src/DAL/entity/layerHistory';

// //functions
// const getCustomRepositoryMock = jest.fn();
// const createConnection = jest.fn();

// //Repository mock
// const findOneMock = jest.spyOn(Repository.prototype, 'findOne');
// //const findOneMock = jest.fn();
// // eslint-disable-next-line @typescript-eslint/naming-convention
// //const Repository = jest.fn();

// let repositories: {
//   [key:string]: unknown
// };
// const initTypeOrmMocks = (): void => {
//   repositories = {};
//   getCustomRepositoryMock.mockImplementation(<T>(key: ObjectType<T>) => {
//     Object.keys(repositories[key.name] as Object)
//     return repositories[key.name];
//   });
//   createConnection.mockReturnValue({
//       getCustomRepository: getCustomRepositoryMock,
//     });
//   // Repository.mockReturnValue({
//   //   findOne: findOneMock
//   // })
// };
// const registerRepository = <T>(key: ObjectType<T>, instance: T): void => {
//   repositories[key.name] = instance;
// };

const createConnection = jest.fn();

const initConnectionMock = async (): Promise<void> => {
  const db = newDb({
    autoCreateForeignKeyIndices: true,
  });
  const connection = (await db.adapters.createTypeormConnection({
    type: 'postgres',
    entities: [Setting, LayerHistory],
  })) as Connection;

  // create schema
  await connection.synchronize();
  createConnection.mockReturnValue(connection);
};

//mocks
export { createConnection, initConnectionMock };
//types
export { Repository };
//decorators
export { PrimaryColumn, Column, Entity, EntityRepository, CreateDateColumn, UpdateDateColumn } from 'typeorm';
