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
import { Tagged } from 'type-fest';
import { v4 as uuidv4 } from 'uuid';

import { CustomerAddress, CustomerAddressId, CustomerAddressModel } from './CustomerAddresses';
import { Customer, CustomerId, CustomerModel } from './Customers';
import { Employee, EmployeeModel } from './Employees';
import { PhoneCallModel } from './PhoneCalls';
import { Entity } from './types';

export type JobId = Tagged<string, 'JobId'>;

export interface Job extends Entity {
  /**
   * The unique identifier for the job
   * (AVOCA) returns this as id
   */
  job_id?: JobId;

  /**
   * (AVOCA) The invoice number for the job
   */
  invoice_number?: string | null;

  /**
   * (AVOCA) The name of the job
   */
  name?: string | null;

  /**
   * (AVOCA) The description of the job
   */
  description?: string | null;

  /**
   * (AVOCA) The customer associated with the job
   */
  customer_id?: CustomerId;

  /**
   * (AVOCA) The customer entity associated with the job
   */
  customer?: Customer | null;

  /**
   * (AVOCA) The customer's address associated with the job
   */
  address_id?: CustomerAddressId;

  /**
   * (AVOCA) The customer's address entity associated with the job
   */
  address?: CustomerAddress | null;

  /**
   * (AVOCA) Notes on the job
   */
  notes?: string | null;

  /**
   * (AVOCA) The status of the job
   */
  work_status?:
    | 'unscheduled'
    | 'scheduled'
    | 'in_progress'
    | 'complete_rated'
    | 'complete_unrated'
    | 'user_canceled'
    | 'pro_canceled'
    | null;

  /**
   * (AVOCA) Work status timestamps
   */
  work_timestamps?: {
    started_at?: string | null;
    completed_at?: string | null;
    on_my_way_at?: string | null;
  } | null;

  /**
   * (AVOCA) The schedule for the job
   */
  schedule?: {
    scheduled_start?: string | null;
    scheduled_end?: string | null;
    arrival_window?: string | null;
  } | null;

  /**
   * (AVOCA) The total amount for the job
   */
  total_amount?: number | null;

  /**
   * (AVOCA) The outstanding balance for the job
   */
  outstanding_balance?: number | null;

  /**
   * (AVOCA) The assigned employees for the job;
   */
  assigned_employees?: Employee[] | null;

  /**
   * (AVOCA) The tags associated with the job
   */
  tags?: string[] | null;

  /**
   * (AVOCA) The original estimate id for the job
   */
  original_estimate_id?: string | null;

  /**
   * (AVOCA) The original estimate for the job
   */
  lead_source?: string | null;
}

@Table({
  timestamps: true,
  freezeTableName: true,
  tableName: 'jobs',
})
export class JobModel extends Model<InferAttributes<JobModel>, InferCreationAttributes<JobModel>> {
  @PrimaryKey
  @Attribute(DataTypes.STRING)
  declare job_id: CreationOptional<JobId>;

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
  declare address_id: CustomerAddressId;
  @BelongsTo(() => CustomerAddressModel, {
    foreignKey: 'address_id',
    foreignKeyConstraints: true,
  })
  declare address: NonAttribute<CustomerAddressModel>;

  @Attribute(DataTypes.TEXT)
  declare notes: string | null;

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
  declare schedule: {
    scheduled_start?: string | null;
    scheduled_end?: string | null;
    arrival_window?: string | null;
  } | null;

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

  toJSON(): Job {
    return super.toJSON();
  }
}

export const getJobId = () => uuidv4() as JobId;
