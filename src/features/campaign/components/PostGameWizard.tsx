import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../data/db';
import { useCampaign, useTraumaTables, useSkillTables, useExplorationTables } from '../hooks';
import { createPostGameSession, completePostGameStep, completePostGame, updatePostGameSession } from '../actions';
import { CampaignSummary } from './CampaignSummary';
import { TraumaStep } from './TraumaStep';
import { PromotionStep } from './PromotionStep';
import { ReinforcementStep } from './ReinforcementStep';
import { ExplorationStep } from './ExplorationStep';
import { QuartermasterStep } from './QuartermasterStep';
import type { PostGameStep } from '../../../types';

const STEPS: { key: PostGameStep; label: string }[] = [
  { key: 'trauma', label: 'Trauma' },
  { key: 'promotions', label: 'Promotions' },
  { key: 'reinforcements', label: 'Reinforcements' },
  { key: 'exploration', label: 'Exploration' },
  { key: 'quartermaster', label: 'Quartermaster' },
];

export function PostGameWizard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const campaign = useCampaign(id ?? '');

  // Find most recent game that needs post-game
  const pendingGame = campaign?.games.find(g => !g.postGameCompleted);
  const gameNumber = pendingGame?.gameNumber ?? 0;

  // Find or create session
  const existingSession = useLiveQuery(
    () => campaign && gameNumber > 0
      ? db.postGameSessions
          .where('campaignId').equals(campaign.id)
          .filter(s => s.gameNumber === gameNumber && !s.completed)
          .first()
      : undefined,
    [campaign?.id, gameNumber]
  );

  const [sessionId, setSessionId] = useState<string | null>(null);

  const session = useLiveQuery(
    () => sessionId ? db.postGameSessions.get(sessionId) : undefined,
    [sessionId]
  );

  // Sync sessionId from existingSession
  useEffect(() => {
    if (existingSession) {
      setSessionId(existingSession.id);
    }
  }, [existingSession]);

  // Create session if none found after loading completes
  useEffect(() => {
    if (campaign && gameNumber > 0 && existingSession === null && !sessionId) {
      createPostGameSession(campaign.id, gameNumber).then(setSessionId);
    }
  }, [campaign, gameNumber, existingSession, sessionId]);

  const warband = useLiveQuery(
    () => campaign ? db.warbands.get(campaign.warbandId) : undefined,
    [campaign?.warbandId]
  );
  const faction = useLiveQuery(
    () => warband ? db.factions.get(warband.factionId) : undefined,
    [warband?.factionId]
  );
  const models = useLiveQuery(
    () => warband ? db.warbandModels.where('warbandId').equals(warband.id).sortBy('order') : [],
    [warband?.id]
  ) ?? [];

  const traumaTables = useTraumaTables();
  const skillTables = useSkillTables();
  const explorationTables = useExplorationTables();

  if (!campaign || !session) {
    return (
      <div className="px-4 py-6 max-w-lg mx-auto">
        <div className="animate-pulse space-y-3">
          <div className="h-3 w-24 bg-bg-tertiary rounded" />
          <div className="h-6 w-48 bg-bg-tertiary rounded" />
          <div className="h-20 w-full bg-bg-tertiary rounded-xl" />
        </div>
      </div>
    );
  }

  const currentStepIndex = STEPS.findIndex(s => s.key === session.currentStep);

  const handleStepComplete = async (step: PostGameStep) => {
    await completePostGameStep(session.id, step);
  };

  const handleFinish = async () => {
    await completePostGame(session.id);
    navigate(`/campaign/${campaign.id}`);
  };

  const handleGoToStep = (step: PostGameStep) => {
    const stepIndex = STEPS.findIndex(s => s.key === step);
    // Allow navigating to completed steps or current step
    if (stepIndex <= currentStepIndex || session.completedSteps.includes(step)) {
      updatePostGameSession(session.id, { currentStep: step });
    }
  };

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      {/* Back */}
      <Link
        to={`/campaign/${campaign.id}`}
        className="inline-flex items-center gap-1 text-text-muted text-xs hover:text-accent-gold no-underline transition-colors mb-4"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 19l-7-7 7-7" /></svg>
        Campaign
      </Link>

      <h1 className="text-xl font-bold mb-1">Post-Game Phase</h1>
      <div className="text-text-muted text-xs mb-4">Game {session.gameNumber}</div>

      {/* Summary bar */}
      <div className="mb-4">
        <CampaignSummary
          currentGame={campaign.currentGame}
          thresholdValue={campaign.thresholdValue}
          fieldStrength={campaign.fieldStrength}
          gloryPoints={campaign.gloryPoints}
          ducatStash={campaign.ducatStash}
        />
      </div>

      {/* Step breadcrumbs */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
        {STEPS.map((step, i) => {
          const isActive = step.key === session.currentStep;
          const isDone = session.completedSteps.includes(step.key);
          const isClickable = i <= currentStepIndex || isDone;
          return (
            <div key={step.key} className="flex items-center gap-1 shrink-0">
              {i > 0 && <div className={`w-4 h-px ${isDone ? 'bg-accent-gold' : 'bg-border-default'}`} />}
              <button
                type="button"
                onClick={() => isClickable && handleGoToStep(step.key)}
                className={`text-[11px] font-medium px-2 py-1 rounded-md transition-colors border-none ${
                  isActive
                    ? 'text-accent-gold bg-accent-gold/10'
                    : isDone
                      ? 'text-text-secondary bg-bg-tertiary cursor-pointer hover:text-accent-gold'
                      : 'text-text-muted bg-transparent cursor-default'
                }`}
              >
                {step.label}
              </button>
            </div>
          );
        })}
      </div>

      {/* Current step content */}
      <div className="animate-fade-in">
        {session.currentStep === 'trauma' && (
          <TraumaStep
            session={session}
            models={models}
            traumaTables={traumaTables}
            gameNumber={session.gameNumber}
            onComplete={() => handleStepComplete('trauma')}
          />
        )}
        {session.currentStep === 'promotions' && (
          <PromotionStep
            session={session}
            models={models}
            skillTables={skillTables}
            gameNumber={session.gameNumber}
            onComplete={() => handleStepComplete('promotions')}
          />
        )}
        {session.currentStep === 'reinforcements' && (
          <ReinforcementStep
            campaign={campaign}
            warband={warband}
            faction={faction}
            models={models}
            onComplete={() => handleStepComplete('reinforcements')}
          />
        )}
        {session.currentStep === 'exploration' && (
          <ExplorationStep
            session={session}
            campaignId={campaign.id}
            explorationTables={explorationTables}
            onComplete={() => handleStepComplete('exploration')}
          />
        )}
        {session.currentStep === 'quartermaster' && (
          <QuartermasterStep
            campaign={campaign}
            faction={faction}
            models={models}
            onFinish={handleFinish}
          />
        )}
      </div>
    </div>
  );
}
