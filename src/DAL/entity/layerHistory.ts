import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ProgressStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'inProgress',
  TRIGGERED = 'triggered',
}

@Entity()
export class LayerHistory {
  @PrimaryColumn('uuid')
  public layerId = '';

  @PrimaryColumn('varchar', { length: 30 })
  public version = '';

  @Column({ length: 300 })
  public status?: ProgressStatus;

  @CreateDateColumn()
  public createdOn?: Date;

  @UpdateDateColumn()
  public updatedOn?: Date;

  public constructor();
  public constructor(init: Partial<LayerHistory>);
  public constructor(layerId: string, version: string, status?: ProgressStatus);
  public constructor(...args: [] | [Partial<LayerHistory>] | [string, string, ProgressStatus?]) {
    const initializerObjectLength = 1;
    const initializerParametersLength = 3;
    switch (args.length) {
      case initializerObjectLength:
        Object.assign(this, args[0]);
        break;
      case initializerParametersLength:
        this.layerId = args[0];
        this.version = args[1];
        this.status = args[2];
        break;
      default:
        break;
    }
  }
}
