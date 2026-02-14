// ==========================================================
// API Response Helpers - Standardized error handling
// Equivalent to NestJS exception filters and response patterns
// ==========================================================
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

/**
 * Wraps an async handler with standardized error handling.
 * Similar to NestJS exception filters but for Next.js route handlers.
 */
export function withErrorHandler<Context = unknown>(
  handler: (request: Request, context: Context) => Promise<NextResponse>,
) {
  return async (request: Request, context: Context) => {
    try {
      return await handler(request, context);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor';
      console.error(`[API Error] ${request.method} ${request.url}:`, errorMessage);

      // Zod validation error (like NestJS ValidationPipe)
      if (error instanceof ZodError) {
        const messages = error.issues.map((issue) => issue.message).join('; ');
        return NextResponse.json(
          { message: messages },
          { status: 400 },
        );
      }

      // Business logic errors (stock, not found, etc.)
      const status = errorMessage.includes('no encontrad')
        ? 404
        : errorMessage.includes('insuficiente') || errorMessage.includes('Ya existe')
          ? 400
          : 500;

      return NextResponse.json(
        { message: errorMessage },
        { status },
      );
    }
  };
}

export function parseIdParam(id: string | undefined): number {
  if (!id) throw new Error('ID no proporcionado');
  const parsed = parseInt(id, 10);
  if (isNaN(parsed)) throw new Error('ID inválido');
  return parsed;
}
