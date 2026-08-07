import { Router } from 'express';
import { db } from '../db/db.js';
import { matches } from '../db/schema.js';
import { string } from "zod";
import { createMatchSchema, listMatchesQuerySchema } from '../validation/matches.js';
import { getMatchStatus } from '../utils/match-status.js'
import { desc } from 'drizzle-orm';
export const matchesRouter = Router();
const MAX_LIMIT = 10;
matchesRouter.get('/', async (req, res) => {
    const parsed = listMatchesQuerySchema.safeParse(req.query)

    if (!parsed.success) {
        return res.status(400).json({ errors: parsed.error.issues });
    }

    const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT)

    try {
        const data = await db
            .select()
            .from(matches)
            .orderBy(desc(matches.createdAt))
            .limit(limit);
        res.status(200).json({ data });
    } catch (error) {
        res.status(500).json({ error: "internal server error", error: error.message });

    }
});

matchesRouter.post('/', async (req, res) => {
    const parsed = createMatchSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ errors: parsed.errors });
    }

    const { startTime, endTime, homeScore, awayScore } = parsed.data;

    try {
        const [event] = await db.insert(matches).values({
            ...parsed.data,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            homeScore: homeScore ?? 0,
            awayScore: awayScore ?? 0,
            status: getMatchStatus(startTime, endTime),
        }).returning();

        if(req.app.locals.broadcastMatchCreate){
            res.app.locals.broadcastMatchCreate(event);

        res.status(201).json({ message: 'Match created', match: event });
        }

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});
