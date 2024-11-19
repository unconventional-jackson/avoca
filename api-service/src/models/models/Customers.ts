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
import { Tagged } from 'type-fest';
import { v4 as uuidv4 } from 'uuid';

import { CustomerAddress, CustomerAddressModel } from './CustomerAddresses';
import { Entity } from './types';

export type CustomerId = Tagged<string, 'CustomerId'>;

export interface Customer extends Entity {
  /**
   * The unique identifier for the customer; Avoca's API does not document a Customer ID for us to use but one appears to be implied as (id).
   */
  customer_id?: CustomerId;

  /**
   * (AVOCA) The customer's first name
   */
  first_name?: string | null;

  /**
   * (AVOCA) The customer's last name
   */
  last_name?: string | null;

  /**
   * (AVOCA) The customer's email address
   */
  email?: string | null;

  /**
   * (AVOCA) The customer's email address
   */
  company?: string | null;

  /**
   * (AVOCA) The customer's mobile phone number
   */
  mobile_number?: string | null;

  /**
   * (AVOCA) The customer's home phone number
   */
  home_number?: string | null;

  /**
   * (AVOCA) The customer's work phone number
   */
  work_number?: string | null;

  /**
   * (AVOCA) The customer's addresses (resolved by a joined query)
   */
  addresses?: CustomerAddress[] | null;

  /**
   * (AVOCA) This field is NOT considered from Avoca's API for purpose of this project
   */
  notifications_enabled?: boolean | null;

  /**
   * (AVOCA) This field is NOT considered from Avoca's API for purpose of this project
   */
  tags?: string[] | null;

  /**
   * (AVOCA) This field is NOT considered from Avoca's API for purpose of this project
   */
  lead_source?: string | null;
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
  declare customer_id: CreationOptional<CustomerId>;

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

  @HasMany(() => CustomerAddressModel, {
    foreignKey: 'customer_address_id',
    foreignKeyConstraints: false,
  })
  declare addresses?: NonAttribute<CustomerAddressModel[]>;

  toJSON(): Customer {
    return super.toJSON();
  }
}

export const getCustomerId = () => uuidv4() as CustomerId;
