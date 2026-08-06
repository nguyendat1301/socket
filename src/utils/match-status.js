import { MATCH_STATUS } from '../validation/matches.js';

export function getMatchStatus(startTime, endTime, now = new Date()) {
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return null; // Invalid date
    }

    if (now < start) {
        return MATCH_STATUS.SCHEDULED;
    }

    if (now >= end) {
        return MATCH_STATUS.FINISHED;
    }

    return MATCH_STATUS.LIVE;
}

export async function syncMatchStatus(match, updateMatchStatus) {
    const nextStatus = getMatchStatus(match.startTime, match.endTime);
    if (!nextStatus) {
        return match.status; // Invalid date, do not update
    }

    if (nextStatus !== match.status) {
        await updateMatchStatus(match.id, nextStatus);
        return nextStatus;
    }
    return match.status; // No change
}