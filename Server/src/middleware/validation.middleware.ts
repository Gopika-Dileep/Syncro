import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

export const validateRequest = (schema: z.Schema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      }) as Record<string, unknown>;

      if (parsed.body) req.body = parsed.body;
      if (parsed.query) Object.assign(req.query, parsed.query);
      if (parsed.params) Object.assign(req.params, parsed.params);

      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const issues = error.issues || [];
        const errorMessages = issues.map((issue: z.ZodIssue) => {
          return `${issue.path.join(".")} - ${issue.message}`;
        });
        res.status(400).json({ success: false, error: "Validation failed", details: errorMessages });
        return;
      }
      const message = error instanceof Error ? error.message : "Internal server error";
      res.status(500).json({ success: false, error: "Internal server error", message });
    }
  };
};
