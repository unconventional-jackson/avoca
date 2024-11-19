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
import { Address as AvocaAddress } from '@unconventional-jackson/avoca-external-api';
import { Tagged } from 'type-fest';
import { v4 as uuidv4 } from 'uuid';

import { CustomerModel, InternalCustomer } from './Customers';
import { Entity, Nullable } from './types';

export type AddressId = Tagged<string, 'AddressId'>;

export interface InternalAddress extends Entity, Nullable<AvocaAddress> {
  /**
   * (AVOCA) The unique identifier for the customer address
   * We use type-fest to tag this as an AddressId
   */
  id: AddressId;

  /**
   * (CUSTOM) The customer that this address is associated with (Implied by Avoca)
   */
  customer_id?: string;

  /**
   * (CUSTOM) The customer that this address is associated with (Resolved by a joined query)
   */
  customer?: InternalCustomer | null;
}

@Table({
  timestamps: true,
  freezeTableName: true,
  tableName: 'addresses',
})
export class AddressModel extends Model<
  InferAttributes<AddressModel>,
  InferCreationAttributes<AddressModel>
> {
  @PrimaryKey
  @Attribute(DataTypes.STRING)
  declare id: CreationOptional<AddressId>;

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

  toJSON() {
    return super.toJSON() as AvocaAddress;
  }
}

export const getAddressId = () => uuidv4() as AddressId;
