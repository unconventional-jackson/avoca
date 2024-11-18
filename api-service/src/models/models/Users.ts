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

export type UserId = Tagged<string, 'UserId'>;

export interface User extends Entity {
  /**
   * The unique identifier for the user
   */
  userId?: UserId;

  /**
   * The email of the user; email notifications can be sent to this address
   */
  email?: string;

  /**
   * The last time the user was active
   * ISO 8601 string
   */
  lastActiveAt?: string | null;

  /**
   * Auth password hash
   */
  authPasswordHash?: string | null;

  /**
   * Auth email is verified status
   */
  authEmailVerified?: boolean | null;

  /**
   * Whether the user has 2FA enabled yet or not
   */
  authTotpEnabled?: boolean | null;

  /**
   * The last time 2FA was verified
   */
  authTotpVerifiedAt?: Date | null;

  /**
   * Auth email verification token - this is a short-lived token which has a TTL intrinsic to it
   */
  authEmailVerificationToken?: string | null;

  /**
   * Short-lived token for resetting the password
   */
  authResetPasswordToken?: string | null;

  /**
   * The current authentication status of the user
   */
  authStatus?: string | null;

  /**
   * The user's TOTP secret
   */
  authTotpSecret?: string | null;

  /**
   * The user's refresh token
   */
  authRefreshToken?: string | null;
}

@Table({
  timestamps: true,
  freezeTableName: true,
  tableName: 'users',
})
export class UserModel extends Model<
  InferAttributes<UserModel>,
  InferCreationAttributes<UserModel>
> {
  @PrimaryKey
  @Attribute(DataTypes.STRING)
  declare userId: CreationOptional<UserId>;

  @Attribute(DataTypes.STRING)
  @NotNull
  declare email: string;

  @Attribute(DataTypes.STRING)
  declare lastActiveAt: string | null;

  @Attribute(DataTypes.STRING)
  declare authPasswordHash: string | null;

  @Attribute(DataTypes.BOOLEAN)
  declare authEmailVerified: boolean | null;

  @Attribute(DataTypes.STRING)
  declare authEmailVerificationToken: string | null;

  @Attribute(DataTypes.STRING)
  declare authResetPasswordToken: string | null;

  @Attribute(DataTypes.STRING)
  declare authStatus: string | null;

  @Attribute(DataTypes.STRING)
  declare authTotpSecret: string | null;

  @Attribute(DataTypes.TEXT)
  declare authRefreshToken: string | null;

  @Attribute(DataTypes.BOOLEAN)
  declare authTotpEnabled: boolean | null;

  @Attribute(DataTypes.DATE)
  declare authTotpVerifiedAt: Date | null;

  toJSON(): User {
    return super.toJSON();
  }
}

export const getUserId = () => uuidv4() as UserId;
