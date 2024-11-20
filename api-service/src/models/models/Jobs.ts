/* eslint-disable import/no-cycle */
import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
} from '@sequelize/core';
import {
  Attribute,
  BelongsTo,
  HasMany,
  NotNull,
  PrimaryKey,
  Table,
} from '@sequelize/core/decorators-legacy';
import { Job as AvocaJob, Note, Schedule } from '@unconventional-jackson/avoca-external-api';
import { Tagged } from 'type-fest';
import { v4 as uuidv4 } from 'uuid';

import { AddressId, AddressModel } from './Addresses';
import { CustomerId, CustomerModel } from './Customers';
import { EmployeeModel } from './Employees';
import { PhoneCallModel } from './PhoneCalls';
import { Entity, Nullable } from './types';

export type JobId = Tagged<string, 'JobId'>;

export interface InternalJob extends Entity, Nullable<AvocaJob> {
  /**
   * The unique identifier for the job
   * (AVOCA) returns this as id
   */
  id?: JobId;

  /**
   * (AVOCA) The customer associated with the job
   */
  customer_id?: CustomerId;

  /**
   * (AVOCA) The customer's address associated with the job
   */
  address_id?: AddressId;

  /**
   * (CUSTOM) Adding schedule_start as a flat structure for easier querying
   */
  scheduled_start?: Date | null;

  /**
   * (CUSTOM) Adding schedule_end as a flat structure for easier querying
   */
  scheduled_end?: Date | null;
}

@Table({
  timestamps: true,
  freezeTableName: true,
  tableName: 'jobs',
})
export class JobModel extends Model<InferAttributes<JobModel>, InferCreationAttributes<JobModel>> {
  @PrimaryKey
  @Attribute(DataTypes.STRING)
  declare id: CreationOptional<JobId>;

  @Attribute(DataTypes.STRING)
  declare invoice_number: string | null;

  @Attribute(DataTypes.STRING)
  declare name: string | null;

  @Attribute(DataTypes.STRING)
  declare description: string | null;

  @Attribute(DataTypes.STRING)
  @NotNull
  declare customer_id: CustomerId;
  @BelongsTo(() => CustomerModel, {
    foreignKey: 'customer_id',
    foreignKeyConstraints: true,
  })
  declare customer: NonAttribute<CustomerModel>;

  @Attribute(DataTypes.STRING)
  @NotNull
  declare address_id: AddressId;
  @BelongsTo(() => AddressModel, {
    foreignKey: 'address_id',
    foreignKeyConstraints: true,
  })
  declare address: NonAttribute<AddressModel>;

  @Attribute(DataTypes.JSON)
  declare notes: Note[] | null;

  @Attribute(DataTypes.STRING)
  declare work_status:
    | 'unscheduled'
    | 'scheduled'
    | 'in_progress'
    | 'complete_rated'
    | 'complete_unrated'
    | 'user_canceled'
    | 'pro_canceled'
    | null;

  @Attribute(DataTypes.JSON)
  declare work_timestamps: {
    started_at?: string | null;
    completed_at?: string | null;
    on_my_way_at?: string | null;
  } | null;

  @Attribute(DataTypes.JSON)
  declare schedule: Schedule | null;

  @Attribute(DataTypes.DATE)
  declare scheduled_start: Date | null;

  @Attribute(DataTypes.DATE)
  declare scheduled_end: Date | null;

  @Attribute(DataTypes.FLOAT)
  declare total_amount: number | null;

  @Attribute(DataTypes.FLOAT)
  declare outstanding_balance: number | null;

  @HasMany(() => EmployeeModel, {
    foreignKey: 'employee_id',
    foreignKeyConstraints: false,
  })
  declare assigned_employees: NonAttribute<EmployeeModel[]>;

  @Attribute(DataTypes.JSON)
  declare tags: string[] | null;

  @Attribute(DataTypes.STRING)
  declare original_estimate_id: string | null;

  @Attribute(DataTypes.STRING)
  declare lead_source: string | null;

  @HasMany(() => PhoneCallModel, {
    foreignKey: 'phone_call_id',
    foreignKeyConstraints: false,
  })
  declare phone_calls: NonAttribute<PhoneCallModel[]>;

  toJSON() {
    return super.toJSON() as AvocaJob;
  }
}

export const getJobId = () => uuidv4() as JobId;
