import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type HomeMode = 'portfolio' | 'paste_board';

/**
 * Reads (and optionally updates) the site-wide "home mode" stored in Supabase.
 * The mode decides what the site's main entry point ("/") displays:
 * the existing portfolio or the collaborative Paste Board.
 */
export const useSiteMode = () => {
  const [mode, setMode] = useState<HomeMode>('portfolio');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchMode = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('id, home_mode')
        .limit(1)
        .maybeSingle();

      if (active && data) {
        setSettingsId(data.id);
        setMode(data.home_mode === 'paste_board' ? 'paste_board' : 'portfolio');
      }
      if (active) setLoading(false);
    };

    fetchMode();
    return () => {
      active = false;
    };
  }, []);

  // Persists the chosen mode to Supabase (admin only, enforced by RLS).
  const updateMode = async (next: HomeMode) => {
    setUpdating(true);
    const previous = mode;
    setMode(next); // optimistic

    let query = supabase.from('site_settings').update({ home_mode: next });
    query = settingsId ? query.eq('id', settingsId) : query.neq('id', '');
    const { error } = await query;

    if (error) {
      setMode(previous); // rollback on failure
    }
    setUpdating(false);
    return { error };
  };

  return { mode, loading, updating, updateMode };
};
