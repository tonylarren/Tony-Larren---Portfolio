import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Globe, Check, Loader2, CloudOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import Footer from '@/components/Footer';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const AUTOSAVE_DELAY = 700;

// Textarea that grows with its content so long articles stay fully visible.
const AutoTextarea = ({
  value,
  onChange,
  placeholder,
  minHeight,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  minHeight: string;
}) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    resize();
  }, [value, resize]);

  return (
    <Textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onInput={resize}
      placeholder={placeholder}
      spellCheck={false}
      className={`${minHeight} resize-none overflow-hidden text-base leading-relaxed p-4 md:p-6 whitespace-pre-wrap shadow-soft`}
    />
  );
};

const PasteBoard = () => {
  const { t, toggleLanguage, language } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [article, setArticle] = useState('');
  const [contenu, setContenu] = useState('');
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<SaveStatus>('idle');

  const rowId = useRef<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirty = useRef(false);

  // Load the single shared document on mount.
  useEffect(() => {
    let active = true;

    const load = async () => {
      const { data } = await supabase
        .from('paste_board')
        .select('id, article, contenu')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (active && data) {
        rowId.current = data.id;
        setArticle(data.article ?? '');
        setContenu(data.contenu ?? '');
      }
      if (active) setLoading(false);
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback(async (nextArticle: string, nextContenu: string) => {
    setStatus('saving');

    // Update the existing row, or create it if the seed row is somehow missing.
    let error;
    if (rowId.current) {
      ({ error } = await supabase
        .from('paste_board')
        .update({ article: nextArticle, contenu: nextContenu })
        .eq('id', rowId.current));
    } else {
      const { data, error: insertError } = await supabase
        .from('paste_board')
        .insert({ article: nextArticle, contenu: nextContenu })
        .select('id')
        .maybeSingle();
      error = insertError;
      if (data) rowId.current = data.id;
    }

    if (error) {
      setStatus('error');
    } else {
      dirty.current = false;
      setStatus('saved');
    }
  }, []);

  // Debounced autosave whenever the content changes after initial load.
  useEffect(() => {
    if (loading) return;
    if (!dirty.current) return;

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      persist(article, contenu);
    }, AUTOSAVE_DELAY);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [article, contenu, loading, persist]);

  const handleArticleChange = (v: string) => {
    dirty.current = true;
    setArticle(v);
  };

  const handleContenuChange = (v: string) => {
    dirty.current = true;
    setContenu(v);
  };

  const statusView = () => {
    switch (status) {
      case 'saving':
        return (
          <span className="flex items-center text-muted-foreground">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {t('paste.saving')}
          </span>
        );
      case 'saved':
        return (
          <span className="flex items-center text-primary">
            <Check className="h-4 w-4 mr-2" />
            {t('paste.saved')}
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center text-destructive">
            <CloudOff className="h-4 w-4 mr-2" />
            {t('paste.saveError')}
          </span>
        );
      default:
        return <span className="h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header — mirrors the portfolio navigation styling */}
      <nav className="fixed top-0 left-0 right-0 z-50 nav-blur shadow-soft py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl font-bold text-primary">
              TL
            </Link>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={toggleTheme} className="p-2">
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>

              <Button variant="ghost" size="sm" onClick={toggleLanguage} className="p-2 font-medium">
                <Globe className="h-4 w-4 mr-1" />
                {language.toUpperCase()}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-28 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Title */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              {t('paste.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('paste.subtitle')}
            </p>
          </div>

          {loading ? (
            <div className="min-h-[40vh] flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-10">
              {/* Article */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-2xl font-semibold text-foreground">
                    {t('paste.article')}
                  </label>
                </div>
                <AutoTextarea
                  value={article}
                  onChange={handleArticleChange}
                  placeholder={t('paste.articlePlaceholder')}
                  minHeight="min-h-[140px]"
                />
              </section>

              {/* Contenu */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-2xl font-semibold text-foreground">
                    {t('paste.contenu')}
                  </label>
                </div>
                <AutoTextarea
                  value={contenu}
                  onChange={handleContenuChange}
                  placeholder={t('paste.contenuPlaceholder')}
                  minHeight="min-h-[360px]"
                />
              </section>

              {/* Save status */}
              <div className="text-sm text-right min-h-[1.25rem]">{statusView()}</div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PasteBoard;
