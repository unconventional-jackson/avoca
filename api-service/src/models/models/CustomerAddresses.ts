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
  NotNull,
  PrimaryKey,
  Table,
} from '@sequelize/core/decorators-legacy';
import { Tagged } from 'type-fest';
import { v4 as uuidv4 } from 'uuid';

import { Customer, CustomerModel } from './Customers';
import { Entity } from './types';

export type CustomerAddressId = Tagged<string, 'CustomerAddressId'>;

export interface CustomerAddress extends Entity {
  /**
   * (AVOCA) The unique identifier for the customer address. If provided by the Avoca API, we use that ID; Avoca might refer to it as (id)
   */
  customer_address_id?: CustomerAddressId;

  /**
   * (AVOCA) The street address of the customer
   */
  street?: string | null;

  /**
   * (AVOCA) The street address (line 2) of the customer
   */
  street_line_2?: string | null;

  /**
   * (AVOCA) The city of the customer
   */
  city?: string | null;

  /**
   * (AVOCA) The state of the customer
   */
  state?: string | null;

  /**
   * (AVOCA) The zip of the customer
   */
  zip?: string | null;

  /**
   * (AVOCA) The country of the customer
   */
  country?: string | null;

  /**
   * (CUSTOM) The customer that this address is associated with (Implied by Avoca)
   */
  customer_id?: string;

  /**
   * (CUSTOM) The customer that this address is associated with (Resolved by a joined query)
   */
  customer?: Customer | null;
}

@Table({
  timestamps: true,
  freezeTableName: true,
  tableName: 'customer_addresses',
})
export class CustomerAddressModel extends Model<
  InferAttributes<CustomerAddressModel>,
  InferCreationAttributes<CustomerAddressModel>
> {
  @PrimaryKey
  @Attribute(DataTypes.STRING)
  declare customer_address_id: CreationOptional<CustomerAddressId>;

  @Attribute(DataTypes.STRING)
  declare street: string | null;

  @Attribute(DataTypes.STRING)
  declare street_line_2: string | null;

  @Attribute(DataTypes.STRING)
  declare city: string | null;

  @Attribute(DataTypes.STRING)
  declare state: string | null;

  @Attribute(DataTypes.STRING)
  declare zip: string | null;

  @Attribute(DataTypes.STRING)
  declare country: string | null;

  @Attribute(DataTypes.STRING)
  @NotNull
  declare customer_id?: string;
  @BelongsTo(() => CustomerModel, {
    foreignKey: 'customer_id',
    foreignKeyConstraints: false,
  })
  declare customer?: NonAttribute<CustomerModel>;

  toJSON(): CustomerAddress {
    return super.toJSON();
  }
}

export const getCustomerAddressId = () => uuidv4() as CustomerAddressId;
