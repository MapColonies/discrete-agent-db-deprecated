import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ProgressStatus {
  IN_PROGRESS = 'inProgress',
  TRIGGERED = 'triggered',
  FAILED = 'failed',
}

@Entity()
export class LayerHistory {
  @PrimaryColumn('varchar', { length: 300 })
  public layerId = '';

  @PrimaryColumn('varchar', { length: 30 })
  public version = '';

  @Column({ type: 'enum', enum: ProgressStatus, default: ProgressStatus.IN_PROGRESS })
  public status: ProgressStatus = ProgressStatus.IN_PROGRESS;

  @CreateDateColumn()
  public createdOn?: Date;

  @UpdateDateColumn()
  public updatedOn?: Date;

  public constructor();
  public constructor(init: Partial<LayerHistory>);
  public constructor(layerId: string, version: string, status?: ProgressStatus);
  public constructor(...args: [] | [Partial<LayerHistory>] | [string, string, ProgressStatus?]) {
    const initializerObjectLength = 1;
    const partialInitializerParametersLength = 2;
    const initializerParametersLength = 3;
    switch (args.length) {
      case initializerObjectLength:
        Object.assign(this, args[0]);
        break;
      case partialInitializerParametersLength:
        this.layerId = args[0];
        this.version = args[1];
        break;
      case initializerParametersLength:
        this.layerId = args[0];
        this.version = args[1];
        this.status = args[2] ?? ProgressStatus.IN_PROGRESS;
        break;
      default:
        break;
    }
  }
}
