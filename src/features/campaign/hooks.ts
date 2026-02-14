import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../data/db';

export function useCampaigns() {
  return useLiveQuery(() => db.campaigns.orderBy('updatedAt').reverse().toArray()) ?? [];
}

export function useCampaign(id: string) {
  return useLiveQuery(() => db.campaigns.get(id), [id]);
}

export function useCampaignForWarband(warbandId: string) {
  return useLiveQuery(
    () => db.campaigns.where('warbandId').equals(warbandId).first(),
    [warbandId]
  );
}

export function useTraumaTables() {
  return useLiveQuery(() => db.traumaTables.toArray()) ?? [];
}

export function useSkillTables() {
  return useLiveQuery(() => db.skillTables.toArray()) ?? [];
}

export function useExplorationTables() {
  return useLiveQuery(() => db.explorationTables.toArray()) ?? [];
}

export function usePostGameSession(campaignId: string, gameNumber: number) {
  return useLiveQuery(
    () => db.postGameSessions
      .where('[campaignId+gameNumber]')
      .equals([campaignId, gameNumber])
      .first()
      .catch(() =>
        // Fallback if compound index not available
        db.postGameSessions
          .where('campaignId').equals(campaignId)
          .filter(s => s.gameNumber === gameNumber && !s.completed)
          .first()
      ),
    [campaignId, gameNumber]
  );
}

export function usePostGameSessionById(id: string) {
  return useLiveQuery(() => db.postGameSessions.get(id), [id]);
}
