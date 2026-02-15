import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { updateFaction, updateFactionModelList, updateFactionEquipmentList } from '../actions';
import { useHomebrewModels, useHomebrewEquipment } from '../hooks';
import type { Faction, FactionRule, FactionModelEntry, FactionEquipEntry } from '../../../types';

interface FactionEditSheetProps {
  faction: Faction | null;
  rulesetId: string;
  open: boolean;
  onClose: () => void;
  onEditModel: (factionId: string) => void;
}

export function FactionEditSheet({ faction, rulesetId, open, onClose, onEditModel }: FactionEditSheetProps) {
  const [name, setName] = useState('');
  const [team, setTeam] = useState<'heaven' | 'hell'>('heaven');
  const [flavour, setFlavour] = useState('');
  const [rules, setRules] = useState<FactionRule[]>([]);
  const [modelList, setModelList] = useState<FactionModelEntry[]>([]);
  const [equipList, setEquipList] = useState<FactionEquipEntry[]>([]);
  const [modelsExpanded, setModelsExpanded] = useState(false);
  const [equipExpanded, setEquipExpanded] = useState(false);

  const models = useHomebrewModels(faction?.id ?? '');
  const equipment = useHomebrewEquipment(rulesetId);

  useEffect(() => {
    if (faction) {
      setName(faction.name);
      setTeam(faction.team);
      setFlavour(faction.flavour);
      setRules([...faction.rules]);
      setModelList([...faction.modelList]);
      setEquipList([...faction.equipmentList]);
    }
  }, [faction]);

  if (!faction) return null;

  const handleSave = async () => {
    if (!name.trim()) return;
    await updateFaction(faction.id, { name: name.trim(), team, flavour, rules });
    await updateFactionModelList(faction.id, modelList);
    await updateFactionEquipmentList(faction.id, equipList);
    onClose();
  };

  const addRule = () => setRules([...rules, { title: '', description: '' }]);
  const removeRule = (i: number) => setRules(rules.filter((_, idx) => idx !== i));
  const updateRule = (i: number, field: keyof FactionRule, val: string) => {
    const updated = [...rules];
    updated[i] = { ...updated[i], [field]: val };
    setRules(updated);
  };

  // Model armoury helpers
  const addModelToList = (modelId: string) => {
    if (modelList.some(m => m.modelId === modelId)) return;
    setModelList([...modelList, {
      modelId, cost: 0, costType: 'ducats', limitMin: 0, limitMax: 99,
      defaultEquipment: [], upgrades: [],
    }]);
  };
  const removeModelFromList = (modelId: string) => setModelList(modelList.filter(m => m.modelId !== modelId));
  const updateModelEntry = (modelId: string, field: string, val: number | string) => {
    setModelList(modelList.map(m => m.modelId === modelId ? { ...m, [field]: val } : m));
  };

  // Equipment armoury helpers
  const addEquipToList = (equipId: string) => {
    if (equipList.some(e => e.equipId === equipId)) return;
    setEquipList([...equipList, {
      equipId, cost: 0, costType: 'ducats', limit: 99, restrictions: [],
    }]);
  };
  const removeEquipFromList = (equipId: string) => setEquipList(equipList.filter(e => e.equipId !== equipId));
  const updateEquipEntry = (equipId: string, field: string, val: number | string) => {
    setEquipList(equipList.map(e => e.equipId === equipId ? { ...e, [field]: val } : e));
  };

  const unlistedModels = models.filter(m => !modelList.some(ml => ml.modelId === m.id));
  const unlistedEquip = equipment.filter(e => !equipList.some(el => el.equipId === e.id));

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-40 animate-fade-in" />
        <Dialog.Content className="fixed bottom-0 left-0 right-0 z-50 bg-bg-secondary border-t border-accent-gold/15 rounded-t-2xl p-5 pb-8 safe-bottom max-h-[85vh] overflow-y-auto animate-slide-up">
          <div className="w-8 h-1 bg-border-default rounded-full mx-auto mb-5" />
          <Dialog.Title className="text-lg font-bold mb-1">Edit Faction</Dialog.Title>
          <Dialog.Description className="text-text-muted text-xs mb-4">Configure faction details and armoury</Dialog.Description>

          {/* Name */}
          <div className="mb-3">
            <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1.5">Name</label>
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 bg-bg-tertiary border border-border-default rounded-xl text-text-primary text-sm focus:outline-none focus:border-accent-gold-dim"
            />
          </div>

          {/* Team */}
          <div className="mb-3">
            <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1.5">Team</label>
            <div className="flex gap-2">
              {(['heaven', 'hell'] as const).map((t) => (
                <button key={t} type="button" onClick={() => setTeam(t)}
                  className={`flex-1 py-2 rounded-xl text-[12px] font-medium border transition-all cursor-pointer capitalize ${
                    team === t
                      ? t === 'heaven'
                        ? 'border-accent-gold/30 bg-accent-gold/10 text-accent-gold'
                        : 'border-accent-red/30 bg-accent-red/10 text-accent-red-bright'
                      : 'border-border-default bg-bg-tertiary text-text-muted hover:bg-bg-elevated'
                  }`}
                >
                  {t === 'heaven' ? '\u2720 Faithful' : '\u2666 Heretic'}
                </button>
              ))}
            </div>
          </div>

          {/* Flavour */}
          <div className="mb-3">
            <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1.5">Flavour Text</label>
            <textarea value={flavour} onChange={(e) => setFlavour(e.target.value)} rows={2}
              className="w-full px-3 py-2.5 bg-bg-tertiary border border-border-default rounded-xl text-text-primary text-sm focus:outline-none focus:border-accent-gold-dim resize-none"
            />
          </div>

          {/* Faction Rules */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] text-text-muted uppercase tracking-wider">Faction Rules</label>
              <button type="button" onClick={addRule} className="text-[11px] text-accent-gold bg-transparent border-none cursor-pointer font-medium">+ Add</button>
            </div>
            {rules.map((r, i) => (
              <div key={i} className="mb-2 p-2.5 bg-bg-tertiary rounded-lg border border-border-default">
                <input type="text" value={r.title} onChange={(e) => updateRule(i, 'title', e.target.value)}
                  placeholder="Rule title" className="w-full px-2 py-1.5 bg-bg-primary border border-border-default rounded-lg text-text-primary text-xs mb-1.5 focus:outline-none focus:border-accent-gold-dim" />
                <textarea value={r.description} onChange={(e) => updateRule(i, 'description', e.target.value)}
                  placeholder="Rule description" rows={2}
                  className="w-full px-2 py-1.5 bg-bg-primary border border-border-default rounded-lg text-text-primary text-xs mb-1.5 focus:outline-none focus:border-accent-gold-dim resize-none" />
                <button type="button" onClick={() => removeRule(i)} className="text-[10px] text-accent-red-bright bg-transparent border-none cursor-pointer">Remove</button>
              </div>
            ))}
          </div>

          {/* Model Armoury */}
          <div className="mb-4">
            <button type="button" onClick={() => setModelsExpanded(!modelsExpanded)}
              className="w-full flex items-center justify-between py-2 text-[11px] font-semibold uppercase tracking-widest text-text-muted bg-transparent border-none cursor-pointer">
              <span>Model Armoury ({modelList.length})</span>
              <span className="text-text-muted/50">{modelsExpanded ? '\u25B2' : '\u25BC'}</span>
            </button>
            {modelsExpanded && (
              <div className="animate-fade-in">
                {modelList.map((entry) => {
                  const model = models.find(m => m.id === entry.modelId);
                  return (
                    <div key={entry.modelId} className="p-2.5 bg-bg-tertiary rounded-lg border border-border-default mb-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-text-primary">{model?.name ?? entry.modelId}</span>
                        <button type="button" onClick={() => removeModelFromList(entry.modelId)}
                          className="text-[10px] text-accent-red-bright bg-transparent border-none cursor-pointer">Remove</button>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-[10px]">
                        <div>
                          <label className="text-text-muted block mb-0.5">Cost</label>
                          <input type="number" value={entry.cost} onChange={(e) => updateModelEntry(entry.modelId, 'cost', +e.target.value)}
                            className="w-full px-1.5 py-1 bg-bg-primary border border-border-default rounded text-text-primary text-[11px] focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-text-muted block mb-0.5">Type</label>
                          <select value={entry.costType} onChange={(e) => updateModelEntry(entry.modelId, 'costType', e.target.value)}
                            className="w-full px-1 py-1 bg-bg-primary border border-border-default rounded text-text-primary text-[11px] focus:outline-none">
                            <option value="ducats">Ducats</option>
                            <option value="glory">Glory</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-text-muted block mb-0.5">Min</label>
                          <input type="number" value={entry.limitMin} onChange={(e) => updateModelEntry(entry.modelId, 'limitMin', +e.target.value)}
                            className="w-full px-1.5 py-1 bg-bg-primary border border-border-default rounded text-text-primary text-[11px] focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-text-muted block mb-0.5">Max</label>
                          <input type="number" value={entry.limitMax} onChange={(e) => updateModelEntry(entry.modelId, 'limitMax', +e.target.value)}
                            className="w-full px-1.5 py-1 bg-bg-primary border border-border-default rounded text-text-primary text-[11px] focus:outline-none" />
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="flex gap-2">
                  {unlistedModels.length > 0 && (
                    <select onChange={(e) => { if (e.target.value) addModelToList(e.target.value); e.target.value = ''; }}
                      className="flex-1 px-2 py-1.5 bg-bg-tertiary border border-border-default rounded-lg text-text-muted text-[11px] focus:outline-none" defaultValue="">
                      <option value="" disabled>Add model...</option>
                      {unlistedModels.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  )}
                  <button type="button" onClick={() => onEditModel(faction.id)}
                    className="px-2 py-1.5 text-[11px] text-accent-gold bg-transparent border border-accent-gold/30 rounded-lg cursor-pointer hover:bg-accent-gold/10">
                    Create Model
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Equipment Armoury */}
          <div className="mb-5">
            <button type="button" onClick={() => setEquipExpanded(!equipExpanded)}
              className="w-full flex items-center justify-between py-2 text-[11px] font-semibold uppercase tracking-widest text-text-muted bg-transparent border-none cursor-pointer">
              <span>Equipment Armoury ({equipList.length})</span>
              <span className="text-text-muted/50">{equipExpanded ? '\u25B2' : '\u25BC'}</span>
            </button>
            {equipExpanded && (
              <div className="animate-fade-in">
                {equipList.map((entry) => {
                  const eq = equipment.find(e => e.id === entry.equipId);
                  return (
                    <div key={entry.equipId} className="p-2.5 bg-bg-tertiary rounded-lg border border-border-default mb-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-text-primary">{eq?.name ?? entry.equipId}</span>
                        <button type="button" onClick={() => removeEquipFromList(entry.equipId)}
                          className="text-[10px] text-accent-red-bright bg-transparent border-none cursor-pointer">Remove</button>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[10px]">
                        <div>
                          <label className="text-text-muted block mb-0.5">Cost</label>
                          <input type="number" value={entry.cost} onChange={(e) => updateEquipEntry(entry.equipId, 'cost', +e.target.value)}
                            className="w-full px-1.5 py-1 bg-bg-primary border border-border-default rounded text-text-primary text-[11px] focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-text-muted block mb-0.5">Type</label>
                          <select value={entry.costType} onChange={(e) => updateEquipEntry(entry.equipId, 'costType', e.target.value)}
                            className="w-full px-1 py-1 bg-bg-primary border border-border-default rounded text-text-primary text-[11px] focus:outline-none">
                            <option value="ducats">Ducats</option>
                            <option value="glory">Glory</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-text-muted block mb-0.5">Limit</label>
                          <input type="number" value={entry.limit} onChange={(e) => updateEquipEntry(entry.equipId, 'limit', +e.target.value)}
                            className="w-full px-1.5 py-1 bg-bg-primary border border-border-default rounded text-text-primary text-[11px] focus:outline-none" />
                        </div>
                      </div>
                    </div>
                  );
                })}
                {unlistedEquip.length > 0 && (
                  <select onChange={(e) => { if (e.target.value) addEquipToList(e.target.value); e.target.value = ''; }}
                    className="w-full px-2 py-1.5 bg-bg-tertiary border border-border-default rounded-lg text-text-muted text-[11px] focus:outline-none" defaultValue="">
                    <option value="" disabled>Add equipment...</option>
                    {unlistedEquip.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <button type="button" onClick={handleSave} disabled={!name.trim()}
            className="w-full py-3 bg-accent-gold/15 border border-accent-gold/30 rounded-xl text-accent-gold text-sm font-semibold hover:bg-accent-gold/25 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
            Save Faction
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
