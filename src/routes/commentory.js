import { Router } from 'express';
import { ZodError } from 'zod';
import { desc, eq } from 'drizzle-orm';

import { db } from '../db/db.js';
import { commentary } from '../db/schema.js';
import { matchIdParamSchema } from '../validation/matches.js';
import { createCommentarySchema, listCommentaryQuerySchema } from '../validation/commentary.js';
import { Result } from 'pg';

// Router with mergeParams: true to access parent route parameters (e.g. :id)
export const commentoryRouter = Router({ mergeParams: true });

const MAX_LIMIT = 100;

/**
 * GET /matches/:id/commentary
 * Fetches commentary entries for a match ordered by createdAt descending with limit.
 */
commentoryRouter.get('/', async (req, res) => {
  try {
    // 1. Validate req.params using matchIdParamSchema and req.query using listCommentaryQuerySchema
    const { id: matchId } = matchIdParamSchema.parse(req.params);
    const query = listCommentaryQuerySchema.parse(req.query);

    // 2. Apply limit based on query parameter (defaulting to 100 with MAX_LIMIT safety cap)
    const limit = Math.min(query.limit ?? 100, MAX_LIMIT);

    // 3. Fetch data where matchId equals parameter, ordered by createdAt descending
    const results = await db
      .select()
      .from(commentary)
      .where(eq(commentary.matchId, matchId))
      .orderBy(desc(commentary.createdAt))
      .limit(limit);

    // 4. Return results
    return res.status(200).json({
      data: results,
    });
  } catch (error) {
    // Handle Zod validation errors (HTTP 400)
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
    }

    // Handle database / internal server errors (HTTP 500)
    console.error('Error fetching commentary:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
});

/**
 * POST /matches/:id/commentary
 * Creates a new commentary record for a specific match.
 */
commentoryRouter.post('/', async (req, res) => {
  try {
    // 1. Validate req.params using matchIdParamSchema and req.body using createCommentarySchema
    const { id: matchId } = matchIdParamSchema.parse(req.params);
    const body = createCommentarySchema.parse(req.body);

    // 2. Prepare payload & insert into the commentary table using Drizzle ORM
    const [createdCommentary] = await db
      .insert(commentary)
      .values({
        matchId,
        minute: body.minute ?? body.minutes,
        sequence: body.sequence,
        period: body.period,
        eventType: body.eventType,
        actor: body.actor,
        team: body.team,
        message: body.message,
        metadata: body.metadata,
        tags: body.tags,
      })
      .returning();

    if (res.app.locals.broadcastCommentary) {
      res.app.locals.broadcastCommentary(matchId, createdCommentary)
    }

    // 4. Return 201 Created with the inserted data
    return res.status(201).json({
      message: 'Commentary created successfully',
      data: createdCommentary,
    });
  } catch (error) {
    // Handle Zod validation failures (HTTP 400)
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
    }

    // Handle internal server or DB errors (HTTP 500)
    console.error('Error creating commentary:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
});
