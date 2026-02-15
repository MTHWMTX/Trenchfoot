import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useRuleset, useHomebrewFactions, useHomebrewEquipment, useHomebrewAddons, useHomebrewModels } from '../hooks';
import {
  updateRuleset, deleteRuleset,
  createFaction, deleteFaction,
  createEquipmentTemplate, deleteEquipmentTemplate,
  createAddon, deleteAddon,
} from '../actions';
import { db } from '../../../data/db';
import { FactionBadge } from '../../warband/components/FactionBadge';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { FactionEditSheet } from './FactionEditSheet';
import { ModelEditSheet } from './ModelEditSheet';
import { EquipmentEditSheet } from './EquipmentEditSheet';
import { AddonEditSheet } from './AddonEditSheet';
import type { Faction, EquipmentTemplate, Addon } from '../../../types';

export function RulesetDetail() {
  const { rulesetId } = useParams<{ rulesetId: string }>();
  const navigate = useNavigate();
  const ruleset = useRuleset(rulesetId!);
  const factions = useHomebrewFactions(rulesetId!);
  const equipment = useHomebrewEquipment(rulesetId!);
  const addons = useHomebrewAddons(rulesetId!);

  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<{ type: 'faction' | 'equipment' | 'addon'; id: string } | null>(null);

  // Sheet state
  const [editFaction, setEditFaction] = useState<Faction | null>(null);
  const [editEquipment, setEditEquipment] = useState<EquipmentTemplate | null>(null);
  const [editAddon, setEditAddon] = useState<Addon | null>(null);
  const [modelFactionId, setModelFactionId] = useState<string | null>(null);

  if (!ruleset) {
    return (
      <div className="px-4 py-6 max-w-lg mx-auto">
        <div className="text-text-muted text-sm">Loading...</div>
      </div>
    );
  }

  const handleNameSave = async () => {
    if (nameVal.trim()) {
      await updateRuleset(ruleset.id, { name: nameVal.trim() });
    }
    setEditingName(false);
  };

  const handleDelete = async () => {
    await deleteRuleset(ruleset.id);
    navigate('/homebrew');
  };

  const handleAddFaction = async (team: 'heaven' | 'hell') => {
    const id = await createFaction(rulesetId!, 'New Faction', team);
    const faction = await db.factions.get(id);
    if (faction) setEditFaction(faction);
  };

  const handleAddEquipment = async () => {
    const id = await createEquipmentTemplate(rulesetId!, {
      name: 'New Equipment',
      category: 'equipment',
      equipType: '',
      range: '',
      tags: [],
      modifiers: [],
      description: '',
      blurb: '',
    });
    const eq = await db.equipmentTemplates.get(id);
    if (eq) setEditEquipment(eq);
  };

  const handleAddAddon = async () => {
    const id = await createAddon('fc_none', rulesetId!, {
      name: 'New Ability',
      tags: [],
      description: '',
    });
    const addon = await db.addons.get(id);
    if (addon) setEditAddon(addon);
  };

  const handleDeleteItem = async () => {
    if (!deleteItemId) return;
    if (deleteItemId.type === 'faction') await deleteFaction(deleteItemId.id);
    else if (deleteItemId.type === 'equipment') await deleteEquipmentTemplate(deleteItemId.id);
    else if (deleteItemId.type === 'addon') await deleteAddon(deleteItemId.id);
  };

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <Link to="/homebrew" className="inline-flex items-center gap-1 text-text-muted text-xs hover:text-accent-gold no-underline transition-colors mb-4">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 19l-7-7 7-7" /></svg>
        Homebrew
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          {editingName ? (
            <input
              type="text"
              value={nameVal}
              onChange={(e) => setNameVal(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
              className="text-xl font-bold bg-transparent border-b border-accent-gold/30 text-text-primary focus:outline-none w-full"
              autoFocus
            />
          ) : (
            <h1
              className="text-xl font-bold cursor-pointer hover:text-accent-gold transition-colors"
              onClick={() => { setNameVal(ruleset.name); setEditingName(true); }}
            >
              {ruleset.name}
            </h1>
          )}
          <p className="text-text-muted text-[10px] mt-0.5">v{ruleset.version}</p>
        </div>
        <button
          type="button"
          onClick={() => setDeleteConfirm(true)}
          className="p-2 text-text-muted hover:text-accent-red-bright transition-colors bg-transparent border-none cursor-pointer rounded-lg hover:bg-accent-red/10"
          aria-label="Delete ruleset"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </button>
      </div>

      {/* Factions Section */}
      <Section
        title="Factions"
        count={factions.length}
        onAdd={() => handleAddFaction('heaven')}
        addLabel="+ Add Faction"
      >
        {factions.map((f) => (
          <ItemCard
            key={f.id}
            onEdit={() => setEditFaction(f)}
            onDelete={() => setDeleteItemId({ type: 'faction', id: f.id })}
          >
            <FactionBadge name={f.name} team={f.team} />
            <FactionModelCount factionId={f.id} />
          </ItemCard>
        ))}
      </Section>

      {/* Equipment Section */}
      <Section
        title="Equipment"
        count={equipment.length}
        onAdd={handleAddEquipment}
        addLabel="+ Add Equipment"
      >
        {equipment.map((e) => (
          <ItemCard
            key={e.id}
            onEdit={() => setEditEquipment(e)}
            onDelete={() => setDeleteItemId({ type: 'equipment', id: e.id })}
          >
            <div className="font-semibold text-[13px] text-text-primary">{e.name}</div>
            <span className="text-[9px] text-text-muted bg-bg-tertiary px-1.5 py-0.5 rounded capitalize">{e.category}</span>
          </ItemCard>
        ))}
      </Section>

      {/* Abilities Section */}
      <Section
        title="Abilities"
        count={addons.length}
        onAdd={handleAddAddon}
        addLabel="+ Add Ability"
      >
        {addons.map((a) => (
          <ItemCard
            key={a.id}
            onEdit={() => setEditAddon(a)}
            onDelete={() => setDeleteItemId({ type: 'addon', id: a.id })}
          >
            <div className="font-semibold text-[13px] text-text-primary">{a.name}</div>
            {a.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {a.tags.map((t, i) => (
                  <span key={i} className="text-[9px] text-accent-gold bg-accent-gold/10 px-1.5 py-0.5 rounded">{t}</span>
                ))}
              </div>
            )}
          </ItemCard>
        ))}
      </Section>

      {/* Delete confirm dialogs */}
      <ConfirmDialog
        open={deleteConfirm}
        onOpenChange={setDeleteConfirm}
        title="Delete Ruleset"
        description="This will permanently delete this ruleset and all its content."
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDelete}
      />
      <ConfirmDialog
        open={!!deleteItemId}
        onOpenChange={(open) => { if (!open) setDeleteItemId(null); }}
        title={`Delete ${deleteItemId?.type ?? 'item'}`}
        description={`This will permanently delete this ${deleteItemId?.type ?? 'item'}${deleteItemId?.type === 'faction' ? ' and all its models' : ''}.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteItem}
      />

      {/* Edit sheets */}
      <FactionEditSheet
        faction={editFaction}
        rulesetId={rulesetId!}
        open={!!editFaction}
        onClose={() => setEditFaction(null)}
        onEditModel={(factionId) => setModelFactionId(factionId)}
      />
      <ModelEditSheet
        factionId={modelFactionId}
        rulesetId={rulesetId!}
        open={!!modelFactionId}
        onClose={() => setModelFactionId(null)}
      />
      <EquipmentEditSheet
        equipment={editEquipment}
        open={!!editEquipment}
        onClose={() => setEditEquipment(null)}
      />
      <AddonEditSheet
        addon={editAddon}
        factions={factions}
        open={!!editAddon}
        onClose={() => setEditAddon(null)}
      />
    </div>
  );
}

// --- Helper Components ---

function Section({ title, count, onAdd, addLabel, children }: {
  title: string;
  count: number;
  onAdd: () => void;
  addLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-text-muted">
          {title} <span className="text-text-muted/50">({count})</span>
        </h2>
        <button
          type="button"
          onClick={onAdd}
          className="text-[11px] text-accent-gold hover:text-accent-gold/80 transition-colors bg-transparent border-none cursor-pointer font-medium"
        >
          {addLabel}
        </button>
      </div>
      {count === 0 ? (
        <div className="p-4 bg-bg-secondary border border-border-default border-dashed rounded-xl text-center">
          <p className="text-text-muted text-xs">No {title.toLowerCase()} yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">{children}</div>
      )}
    </div>
  );
}

function ItemCard({ onEdit, onDelete, children }: {
  onEdit: () => void;
  onDelete: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onEdit}
        className="flex-1 text-left p-3 bg-bg-secondary border border-border-default rounded-xl hover:border-accent-gold/20 hover:bg-bg-tertiary transition-all cursor-pointer"
      >
        {children}
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="p-2 text-text-muted hover:text-accent-red-bright transition-colors bg-transparent border-none cursor-pointer rounded-lg hover:bg-accent-red/10 shrink-0"
        aria-label="Delete"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
        </svg>
      </button>
    </div>
  );
}

function FactionModelCount({ factionId }: { factionId: string }) {
  const models = useHomebrewModels(factionId);
  return (
    <div className="text-text-muted text-[10px] mt-1">
      {models.length} model{models.length !== 1 ? 's' : ''}
    </div>
  );
}
