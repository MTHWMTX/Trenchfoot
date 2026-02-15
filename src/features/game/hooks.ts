import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../data/db';

export function useGameSession(id: string) {
  return useLiveQuery(() => db.gameSessions.get(id), [id]);
}

export function useActiveGameSession() {
  return useLiveQuery(
    () => db.gameSessions.where('status').equals('active').first()
  );
}

export function useActiveGameForWarband(warbandId: string) {
  return useLiveQuery(
    () => db.gameSessions
      .where('status').equals('active')
      .filter(s => s.warbandId === warbandId)
      .first(),
    [warbandId]
  );
}
