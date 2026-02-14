import { db } from '../../data/db';
import type { Campaign, CampaignGame, WarbandModel } from '../../types';
import { getProgression } from './progression';

export async function createCampaign(warbandId: string, patron: string): Promise<string> {
  const id = crypto.randomUUID();
  const now = new Date();
  const starting = getProgression(1);

  const campaign: Campaign = {
    id,
    warbandId,
    patron,
    currentGame: 1,
    thresholdValue: starting.threshold,
    fieldStrength: starting.fieldStrength,
    gloryPoints: 0,
    ducatStash: 0,
    games: [],
    notes: '',
    createdAt: now,
    updatedAt: now,
  };

  await db.campaigns.add(campaign);
  return id;
}

export async function updateCampaign(id: string, changes: Partial<Campaign>) {
  await db.campaigns.update(id, { ...changes, updatedAt: new Date() });
}

export async function deleteCampaign(id: string) {
  await db.campaigns.delete(id);
}

export async function recordGame(
  campaignId: string,
  game: { result: CampaignGame['result']; opponentName: string; scenarioName: string; notes: string }
) {
  const campaign = await db.campaigns.get(campaignId);
  if (!campaign) throw new Error('Campaign not found');

  const newGame: CampaignGame = {
    gameNumber: campaign.currentGame,
    result: game.result,
    opponentName: game.opponentName,
    scenarioName: game.scenarioName,
    notes: game.notes,
    postGameCompleted: false,
    completedAt: new Date(),
  };

  const nextGame = campaign.currentGame + 1;
  const progression = getProgression(nextGame);

  await db.campaigns.update(campaignId, {
    games: [...campaign.games, newGame],
    currentGame: nextGame,
    thresholdValue: progression.threshold,
    fieldStrength: progression.fieldStrength,
    updatedAt: new Date(),
  });
}

export async function updateModelCampaignStatus(
  modelId: string,
  status: WarbandModel['campaignStatus']
) {
  await db.warbandModels.update(modelId, { campaignStatus: status });
}

export async function addScarToModel(
  modelId: string,
  scar: { name: string; effect: string; gameNumber: number }
) {
  const model = await db.warbandModels.get(modelId);
  if (!model) return;

  const scars = [...(model.scars ?? []), { id: crypto.randomUUID(), ...scar }];
  await db.warbandModels.update(modelId, { scars });
}

export async function addAdvancementToModel(
  modelId: string,
  advancement: { name: string; description: string; table: string; gameNumber: number }
) {
  const model = await db.warbandModels.get(modelId);
  if (!model) return;

  const advancements = [...(model.advancements ?? []), { id: crypto.randomUUID(), ...advancement }];
  await db.warbandModels.update(modelId, { advancements });
}
