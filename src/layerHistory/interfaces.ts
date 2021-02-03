import { ProgressStatus } from '../DAL/entity/layerHistory';

export interface ILayerHistoryResponse {
  id: string; // directory name
  version: string; // subdirectory name
  status: ProgressStatus;
}

export interface ILayerHistoryIdentifier {
  id: string; // directory name
  version: string; // subdirectory name
}

export interface IUpdateLayerHistoryStatusRequestBody {
  status: ProgressStatus;
}
