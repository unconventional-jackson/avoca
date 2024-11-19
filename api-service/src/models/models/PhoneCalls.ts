/* eslint-disable import/no-cycle */
import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
} from '@sequelize/core';
import { Attribute, BelongsTo, PrimaryKey, Table } from '@sequelize/core/decorators-legacy';
import { Tagged } from 'type-fest';
import { v4 as uuidv4 } from 'uuid';

import { CustomerId, CustomerModel, InternalCustomer } from './Customers';
import { EmployeeId, EmployeeModel, InternalEmployee } from './Employees';
import { JobId, JobModel } from './Jobs';
import { Entity } from './types';

export type PhoneCallId = Tagged<string, 'PhoneCallId'>;

export interface PhoneCall extends Entity {
  /**
   * The unique identifier for the phone call; this is our own construct
   */
  phone_call_id?: PhoneCallId;

  /**
   * The start of the phone call
   */
  start_date_time?: Date | null;

  /**
   * The end of the phone call
   */
  end_date_time?: Date | null;

  /**
   * The transcript
   */
  transcript?: string | null;

  /**
   * The customer that this phone call is associated with
   */
  customer_id?: CustomerId | null;

  /**
   * The customer entity associated with the phone call
   */
  customer?: InternalCustomer | null;

  /**
   * The phone number that the call came from
   */
  phone_number?: string | null;

  /**
   * The job that this phone call is associated with
   */
  job_id?: JobId | null;

  /**
   * The employee that actioned this call
   */
  employee_id?: EmployeeId | null;

  /**
   * The employee entity associated with the phone call
   */
  assigned_employee?: InternalEmployee | null;
}

@Table({
  timestamps: true,
  freezeTableName: true,
  tableName: 'phone_calls',
})
export class PhoneCallModel extends Model<
  InferAttributes<PhoneCallModel>,
  InferCreationAttributes<PhoneCallModel>
> {
  @PrimaryKey
  @Attribute(DataTypes.STRING)
  declare phone_call_id: CreationOptional<PhoneCallId>;

  @Attribute(DataTypes.DATE)
  declare start_date_time?: Date | null;

  @Attribute(DataTypes.DATE)
  declare end_date_time?: Date | null;

  @Attribute(DataTypes.TEXT)
  declare transcript?: string | null;

  @Attribute(DataTypes.STRING)
  declare customer_id?: CustomerId | null;
  @BelongsTo(() => CustomerModel, {
    foreignKey: 'customer_id',
    foreignKeyConstraints: false,
  })
  declare customer?: NonAttribute<CustomerModel> | null;

  @Attribute(DataTypes.STRING)
  declare phone_number?: string | null;

  @Attribute(DataTypes.STRING)
  declare job_id?: JobId | null;
  @BelongsTo(() => JobModel, {
    foreignKey: 'job_id',
    foreignKeyConstraints: false,
  })
  declare job?: NonAttribute<JobModel> | null;

  @Attribute(DataTypes.STRING)
  declare employee_id?: EmployeeId | null;
  @BelongsTo(() => EmployeeModel, {
    foreignKey: 'employee_id',
    foreignKeyConstraints: false,
  })
  declare assigned_employee?: NonAttribute<EmployeeModel> | null;

  toJSON(): PhoneCall {
    return super.toJSON();
  }
}

export const getPhoneCallId = () => uuidv4() as PhoneCallId;
