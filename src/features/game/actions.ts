import { db } from '../../data/db';
import type { GameModelState, GameSession } from '../../types';

export async function createGameSession(
  warbandId: string,
  campaignId: string | null
): Promise<string> {
  // Enforce single active session
  const existing = await db.gameSessions.where('status').equals('active').first();
  if (existing) {
    throw new Error('An active game session already exists. End it before starting a new one.');
  }

  const models = await db.warbandModels.where('warbandId').equals(warbandId).sortBy('order');

  // If campaign, only include active models
  const eligible = campaignId
    ? models.filter(m => (m.campaignStatus ?? 'active') === 'active')
    : models;

  const modelStates: GameModelState[] = eligible.map(m => ({
    modelId: m.id,
    templateId: m.templateId,
    customName: m.customName,
    activated: false,
    bloodMarkers: 0,
    blessingMarkers: 0,
    infectionMarkers: 0,
    status: 'active',
  }));

  const now = new Date();
  const session: GameSession = {
    id: crypto.randomUUID(),
    warbandId,
    campaignId,
    turn: 1,
    modelStates,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };

  await db.gameSessions.add(session);
  return session.id;
}

export async function updateModelState(
  sessionId: string,
  modelId: string,
  changes: Partial<Pick<GameModelState, 'activated' | 'bloodMarkers' | 'blessingMarkers' | 'infectionMarkers' | 'status'>>
) {
  const session = await db.gameSessions.get(sessionId);
  if (!session) return;

  const updated = session.modelStates.map(m => {
    if (m.modelId !== modelId) return m;
    const merged = { ...m, ...changes };
    // Clamp markers
    merged.bloodMarkers = Math.max(0, Math.min(6, merged.bloodMarkers));
    merged.blessingMarkers = Math.max(0, merged.blessingMarkers);
    merged.infectionMarkers = Math.max(0, merged.infectionMarkers);
    return merged;
  });

  await db.gameSessions.update(sessionId, {
    modelStates: updated,
    updatedAt: new Date(),
  });
}

export async function advanceTurn(sessionId: string) {
  const session = await db.gameSessions.get(sessionId);
  if (!session) return;

  const resetStates = session.modelStates.map(m => ({
    ...m,
    activated: false,
  }));

  await db.gameSessions.update(sessionId, {
    turn: session.turn + 1,
    modelStates: resetStates,
    updatedAt: new Date(),
  });
}

export async function endGameSession(sessionId: string) {
  await db.gameSessions.update(sessionId, {
    status: 'completed',
    updatedAt: new Date(),
  });
}

export async function deleteGameSession(sessionId: string) {
  await db.gameSessions.delete(sessionId);
}
