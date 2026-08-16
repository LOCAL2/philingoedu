import { Request, Response, NextFunction } from 'express';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ZodSchema = { safeParse(data: unknown): { success: boolean; data?: unknown; error?: { errors: Array<{ path: (string | number)[]; message: string }> } } };

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = (result.error?.errors ?? []).map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      res.status(400).json({ error: 'Validation Error', errors });
      return;
    }
    req.body = result.data;
    next();
  };
}
