/* eslint-disable import/no-cycle */
import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from '@sequelize/core';
import { Attribute, NotNull, PrimaryKey, Table } from '@sequelize/core/decorators-legacy';
import { Tagged } from 'type-fest';
import { v4 as uuidv4 } from 'uuid';

import { Entity } from './types';

export type EmployeeId = Tagged<string, 'EmployeeId'>;

export interface Employee extends Entity {
  /**
   * (AVOCA) The unique identifier for the employee
   * Note Avoca refers to this as (id)
   */
  employee_id?: EmployeeId;

  /**
   * (AVOCA) The email of the employee; email notifications can be sent to this address
   */
  email?: string;

  /**
   * (CUSTOM) The last time the employee was active
   * ISO 8601 string
   */
  last_active_at?: Date | null;

  /**
   * (CUSTOM) Auth password hash
   */
  auth_password_hash?: string | null;

  /**
   * (CUSTOM) Auth email is verified status
   */
  auth_email_verified?: boolean | null;

  /**
   * (CUSTOM) Whether the employee has 2FA enabled yet or not
   */
  auth_totp_enabled?: boolean | null;

  /**
   * (CUSTOM) The last time 2FA was verified
   */
  auth_totp_verified_at?: Date | null;

  /**
   * (CUSTOM) The current authentication status of the employee
   */
  auth_status?: string | null;

  /**
   * (CUSTOM) The employee's TOTP secret
   */
  auth_totp_secret?: string | null;

  /**
   * (CUSTOM) The employee's refresh token
   */
  auth_refresh_token?: string | null;

  /**
   * (AVOCA) The URL to the employee's avatar
   */
  avatar_url?: string | null;

  /**
   * (AVOCA) The color hex for the employee
   */
  color_hex?: string | null;

  /**
   * (AVOCA) The first name of the employee
   */
  first_name?: string | null;

  /**
   * (AVOCA) The last name of the employee
   */
  last_name?: string | null;

  /**
   * (AVOCA) The mobile phone number of the employee
   */
  mobile_number?: string | null;

  /**
   * (AVOCA) The role of the employee
   */
  role?: string | null;

  /**
   * (AVOCA) The permissions of the employee
   */
  permissions?: {
    can_add_and_edit_job?: boolean;
    can_be_booked_online?: boolean;
    can_call_and_text_with_customers?: boolean;
    can_chat_with_customers?: boolean;
    can_delete_and_cancel_job?: boolean;
    can_edit_message_on_invoice?: boolean;
    can_see_street_view_data?: boolean;
    can_share_job?: boolean;
    can_take_payment_see_prices?: boolean;
    can_see_customers?: boolean;
    can_see_full_schedule?: boolean;
    can_see_future_jobs?: boolean;
    can_see_marketing_campaigns?: boolean;
    can_see_reporting?: boolean;
    can_edit_settings?: boolean;
    is_point_of_contact?: boolean;
    is_admin?: boolean;
  } | null;
}

@Table({
  timestamps: true,
  freezeTableName: true,
  tableName: 'employees',
})
export class EmployeeModel extends Model<
  InferAttributes<EmployeeModel>,
  InferCreationAttributes<EmployeeModel>
> {
  @PrimaryKey
  @Attribute(DataTypes.STRING)
  declare employee_id: CreationOptional<EmployeeId>;

  @Attribute(DataTypes.STRING)
  @NotNull
  declare email: string;

  @Attribute(DataTypes.DATE)
  declare last_active_at: Date | null;

  @Attribute(DataTypes.STRING)
  declare auth_password_hash: string | null;

  @Attribute(DataTypes.BOOLEAN)
  declare auth_email_verified: boolean | null;

  @Attribute(DataTypes.STRING)
  declare auth_status: string | null;

  @Attribute(DataTypes.STRING)
  declare auth_totp_secret: string | null;

  @Attribute(DataTypes.TEXT)
  declare auth_refresh_token: string | null;

  @Attribute(DataTypes.BOOLEAN)
  declare auth_totp_enabled: boolean | null;

  @Attribute(DataTypes.DATE)
  declare auth_totp_verified_at: Date | null;

  @Attribute(DataTypes.STRING)
  declare avatar_url?: string | null;

  @Attribute(DataTypes.STRING)
  declare color_hex?: string | null;

  @Attribute(DataTypes.STRING)
  declare first_name?: string | null;

  @Attribute(DataTypes.STRING)
  declare last_name?: string | null;

  @Attribute(DataTypes.STRING)
  declare mobile_number?: string | null;

  @Attribute(DataTypes.STRING)
  declare role?: string | null;

  @Attribute(DataTypes.JSON)
  declare permissions?: {
    can_add_and_edit_job?: boolean;
    can_be_booked_online?: boolean;
    can_call_and_text_with_customers?: boolean;
    can_chat_with_customers?: boolean;
    can_delete_and_cancel_job?: boolean;
    can_edit_message_on_invoice?: boolean;
    can_see_street_view_data?: boolean;
    can_share_job?: boolean;
    can_take_payment_see_prices?: boolean;
    can_see_customers?: boolean;
    can_see_full_schedule?: boolean;
    can_see_future_jobs?: boolean;
    can_see_marketing_campaigns?: boolean;
    can_see_reporting?: boolean;
    can_edit_settings?: boolean;
    is_point_of_contact?: boolean;
    is_admin?: boolean;
  } | null;

  toJSON(): Employee {
    return super.toJSON();
  }
}

export const getUserId = () => uuidv4() as EmployeeId;
