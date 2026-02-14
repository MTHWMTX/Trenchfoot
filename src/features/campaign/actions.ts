import { db } from '../../data/db';
import type { Campaign, CampaignGame, WarbandModel, PostGameSession, PostGameStep } from '../../types';
import { getProgression } from './progression';

const STEP_ORDER: PostGameStep[] = ['trauma', 'promotions', 'reinforcements', 'exploration', 'quartermaster'];

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

// --- Post-Game Session Management ---

export async function createPostGameSession(campaignId: string, gameNumber: number): Promise<string> {
  const id = crypto.randomUUID();
  const session: PostGameSession = {
    id,
    campaignId,
    gameNumber,
    currentStep: 'trauma',
    completedSteps: [],
    traumaResults: [],
    promotionResults: [],
    explorationResults: [],
    completed: false,
    createdAt: new Date(),
  };
  await db.postGameSessions.add(session);
  return id;
}

export async function updatePostGameSession(id: string, changes: Partial<PostGameSession>) {
  await db.postGameSessions.update(id, changes);
}

export async function completePostGameStep(sessionId: string, step: PostGameStep) {
  const session = await db.postGameSessions.get(sessionId);
  if (!session) return;

  const completedSteps = session.completedSteps.includes(step)
    ? session.completedSteps
    : [...session.completedSteps, step];

  const currentIndex = STEP_ORDER.indexOf(step);
  const nextStep = currentIndex < STEP_ORDER.length - 1 ? STEP_ORDER[currentIndex + 1] : step;

  await db.postGameSessions.update(sessionId, { completedSteps, currentStep: nextStep });
}

export async function completePostGame(sessionId: string) {
  const session = await db.postGameSessions.get(sessionId);
  if (!session) return;

  await db.postGameSessions.update(sessionId, { completed: true });

  // Mark the game's postGameCompleted flag
  const campaign = await db.campaigns.get(session.campaignId);
  if (!campaign) return;

  const games = campaign.games.map(g =>
    g.gameNumber === session.gameNumber ? { ...g, postGameCompleted: true } : g
  );
  await db.campaigns.update(session.campaignId, { games, updatedAt: new Date() });
}

export async function deletePostGameSession(id: string) {
  await db.postGameSessions.delete(id);
}

// --- Resource Actions ---

export async function addDucatsToStash(campaignId: string, amount: number) {
  const campaign = await db.campaigns.get(campaignId);
  if (!campaign) return;
  await db.campaigns.update(campaignId, {
    ducatStash: campaign.ducatStash + amount,
    updatedAt: new Date(),
  });
}

export async function addGloryPoints(campaignId: string, amount: number) {
  const campaign = await db.campaigns.get(campaignId);
  if (!campaign) return;
  await db.campaigns.update(campaignId, {
    gloryPoints: campaign.gloryPoints + amount,
    updatedAt: new Date(),
  });
}

export async function updatePromotionDice(modelId: string, earned: number, spent: number) {
  await db.warbandModels.update(modelId, {
    promotionDiceEarned: earned,
    promotionDiceSpent: spent,
  });
}
