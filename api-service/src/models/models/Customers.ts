/* eslint-disable import/no-cycle */
import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
} from '@sequelize/core';
import { Attribute, HasMany, PrimaryKey, Table } from '@sequelize/core/decorators-legacy';
import { Customer as AvocaCustomer } from '@unconventional-jackson/avoca-external-api';
import { Tagged } from 'type-fest';
import { v4 as uuidv4 } from 'uuid';

import { AddressModel } from './Addresses';
import { Entity, Nullable } from './types';

export type CustomerId = Tagged<string, 'CustomerId'>;

export interface InternalCustomer extends Entity, Nullable<AvocaCustomer> {
  /**
   * The unique identifier for the customer; Avoca's API does not document a Customer ID for us to use but one appears to be implied as (id).
   */
  id?: CustomerId;
}

@Table({
  timestamps: true,
  freezeTableName: true,
  tableName: 'customers',
})
export class CustomerModel extends Model<
  InferAttributes<CustomerModel>,
  InferCreationAttributes<CustomerModel>
> {
  @PrimaryKey
  @Attribute(DataTypes.STRING)
  declare id: CreationOptional<CustomerId>;

  @Attribute(DataTypes.STRING)
  declare first_name: string | null;

  @Attribute(DataTypes.STRING)
  declare last_name: string | null;

  @Attribute(DataTypes.STRING)
  declare email: string | null;

  @Attribute(DataTypes.STRING)
  declare company: string | null;

  @Attribute(DataTypes.STRING)
  declare mobile_number: string | null;

  @Attribute(DataTypes.STRING)
  declare home_number: string | null;

  @Attribute(DataTypes.STRING)
  declare work_number: string | null;

  @Attribute(DataTypes.BOOLEAN)
  declare notifications_enabled: boolean | null;

  @Attribute(DataTypes.JSON)
  declare tags: string[] | null;

  @Attribute(DataTypes.STRING)
  declare lead_source: string | null;

  @HasMany(() => AddressModel, {
    foreignKey: 'id',
    foreignKeyConstraints: false,
  })
  declare addresses?: NonAttribute<AddressModel[]>;

  toJSON() {
    return super.toJSON() as AvocaCustomer;
  }
}

export const getCustomerId = () => uuidv4() as CustomerId;
