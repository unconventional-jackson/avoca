import 'express';

declare module 'express' {
  interface Locals {
    correlation?: string;
    userId?: string;
  }

  export interface Response {
    locals: Locals;
  }
}
