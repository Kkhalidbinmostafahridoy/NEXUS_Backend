import { NextFunction, Request, Response } from "express";
export type Validator = { parse: (value: unknown) => unknown };
export const validateRequest =
  (validator: Validator) => (req: Request, _res: Response, next: NextFunction) => {
    try {
      validator.parse({ body: req.body, params: req.params, query: req.query });
      next();
    } catch (error) {
      next(error);
    }
  };
