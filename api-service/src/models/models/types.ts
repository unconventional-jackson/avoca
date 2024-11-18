import { Transaction } from '@sequelize/core';

export type ExtraModelArgs = {
  correlation?: string;
  transaction?: Transaction;
  /**
   * The unique identifier of the Operator performing an operator, for audit purposes
   */
  operatorId?: string;
};

export const pageSize = 50;

/**
 * Utility type to indicate that arguments for a function should accept pagination parameters.
 */
export type Paginator<T> = T & {
  limit?: number;
  next?: number;
};

export type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

/**
 * Utility type for us to extend when interacting with database types.
 */
export interface Entity {
  /**
   * Created timestamp, ISO8601 format.
   */
  createdAt?: Date | null;

  /**
   * Who created the Entity.
   */
  createdBy?: string | null;

  /**
   * Updated timestamp, ISO8601 format.
   */
  updatedAt?: Date | null;

  /**
   * Who updated the Entity.
   */
  updatedBy?: string | null;

  /**
   * The timestamp the item was soft-deleted, ISO8601 format.
   */
  deletedAt?: Date | null;

  /**
   * Who soft-deleted the Entity.
   */
  deletedBy?: string | null;
}
