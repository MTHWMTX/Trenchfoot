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
