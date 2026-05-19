type RealtimePayload = Record<string, unknown>;

export function emitTeamEvent(teamId: string, event: string, payload: RealtimePayload) {
  global.__io?.to(`team:${teamId}`).emit(event, payload);
}

export function emitUserEvent(userId: string, event: string, payload: RealtimePayload) {
  global.__io?.to(`user:${userId}`).emit(event, payload);
}
