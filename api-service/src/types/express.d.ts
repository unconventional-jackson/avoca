import 'express';

declare module 'express' {
  interface Locals {
    correlation?: string;
    employee_id?: string;
  }

  export interface Response {
    locals: Locals;
  }
}
