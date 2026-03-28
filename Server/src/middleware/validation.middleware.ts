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
      
      // Assign parsed/coerced data back to req
      if (parsed.body) req.body = parsed.body;
      if (parsed.query) req.query = parsed.query as unknown as Request['query'];
      if (parsed.params) req.params = parsed.params as unknown as Request['params'];
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((issue) => {
          return `${issue.path.join(".")} - ${issue.message}`;
        });
        res.status(400).json({ success: false, error: "Validation failed", details: errorMessages });
        return;
      }
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  };
};
