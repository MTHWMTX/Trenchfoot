import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useHomebrewRulesets } from '../hooks';
import { createRuleset, deleteRuleset } from '../actions';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';

export function HomebrewHub() {
  const rulesets = useHomebrewRulesets();
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createRuleset(newName.trim());
    setNewName('');
    setCreating(false);
  };

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Homebrew</h1>
          <p className="text-text-muted text-xs mt-0.5">Custom rulesets and content</p>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="px-3 py-2 bg-accent-gold/15 border border-accent-gold/30 rounded-xl text-accent-gold text-xs font-semibold hover:bg-accent-gold/25 transition-colors cursor-pointer"
        >
          + New Ruleset
        </button>
      </div>

      {/* Inline create */}
      {creating && (
        <div className="mb-4 p-4 bg-bg-secondary border border-border-default rounded-xl animate-fade-in">
          <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1.5">Ruleset Name</label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="My Custom Rules"
            className="w-full px-3 py-2.5 bg-bg-tertiary border border-border-default rounded-xl text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent-gold-dim mb-3"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setCreating(false); setNewName(''); }}
              className="flex-1 py-2 bg-bg-tertiary border border-border-default rounded-xl text-text-secondary text-xs font-semibold hover:bg-bg-elevated transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={!newName.trim()}
              className="flex-1 py-2 bg-accent-gold/15 border border-accent-gold/30 rounded-xl text-accent-gold text-xs font-semibold hover:bg-accent-gold/25 transition-colors cursor-pointer disabled:opacity-40"
            >
              Create
            </button>
          </div>
        </div>
      )}

      {/* Ruleset list */}
      {rulesets.length === 0 && !creating && (
        <div className="text-center py-16">
          <div className="text-3xl mb-3 opacity-30">&#9881;</div>
          <p className="text-text-muted text-sm mb-1">No homebrew rulesets yet</p>
          <p className="text-text-muted text-xs">Create a ruleset to start adding custom factions, models, and equipment.</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {rulesets.map((rs) => (
          <div key={rs.id} className="flex items-center gap-2">
            <Link
              to={`/homebrew/${rs.id}`}
              className="flex-1 p-4 bg-bg-secondary border border-border-default rounded-xl hover:border-accent-gold/20 hover:bg-bg-tertiary transition-all no-underline"
            >
              <div className="font-semibold text-[13px] text-text-primary">{rs.name}</div>
              <div className="text-text-muted text-[10px] mt-1">
                v{rs.version} &middot; Updated {rs.updatedAt.toLocaleDateString()}
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setDeleteTarget(rs.id)}
              className="p-2 text-text-muted hover:text-accent-red-bright transition-colors bg-transparent border-none cursor-pointer rounded-lg hover:bg-accent-red/10"
              aria-label="Delete ruleset"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete Ruleset"
        description="This will permanently delete this ruleset and all its factions, models, equipment, and abilities."
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={() => { if (deleteTarget) deleteRuleset(deleteTarget); }}
      />
    </div>
  );
}
