import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { HttpStatus } from '../enums/HttpStatus';
import { COMMON_MESSAGES } from '../constants/messages';

export const validateRequest = (schema: z.Schema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = (await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })) as Record<string, unknown>;

      if (parsed.body) req.body = parsed.body;
      if (parsed.query) Object.assign(req.query, parsed.query);
      if (parsed.params) Object.assign(req.params, parsed.params);

      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const issues = error.issues || [];
        const errorMessages = issues.map((issue: z.ZodIssue) => {
          return `${issue.path.join('.')} - ${issue.message}`;
        });
        res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: COMMON_MESSAGES.VALIDATION_FAILED, details: errorMessages });
        return;
      }
      const message = error instanceof Error ? error.message : COMMON_MESSAGES.INTERNAL_SERVER_ERROR;
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: COMMON_MESSAGES.INTERNAL_SERVER_ERROR, message });
    }
  };
};
