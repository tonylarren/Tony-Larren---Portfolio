import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { supabase } from '@/integrations/supabase/client';


interface Skill {
  id: string;
  name: string;
  category: string;
  logo_url: string | null;
  is_visible: boolean;
  sort_order: number;
}

const Skills = () => {
  const { t } = useLanguage();
  const { ref, isVisible } = useScrollAnimation();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('is_visible', true)
        .order('category', { ascending: true })
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setSkills(data || []);
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="skills" className="py-20 section-bg">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              {t('skills.title')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('skills.description')}
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="skills" className="py-20 section-bg">
      <div className="container mx-auto px-4">
        <div ref={ref} className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              {t('skills.title')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('skills.description')}
            </p>
          </div>
  
          {/* Grid of All Skills */}
          {skills.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No skills added yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 max-w-6xl mx-auto">
              {skills.map((skill, index) => (
                <div
                  key={skill.id}
                  className={`group flex flex-col items-center p-4 rounded-xl bg-primary-light hover:bg-primary transition-all duration-300 cursor-default ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {skill.logo_url ? (
                    <img 
                      src={skill.logo_url} 
                      alt={skill.name}
                      className="w-10 h-10 object-contain mb-2 transition-all duration-300 group-hover:brightness-0 group-hover:invert"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mb-2 transition-colors duration-300 group-hover:bg-white/20">
                      <span className="text-primary group-hover:text-white font-bold text-xs">
                        {skill.name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-sm font-medium text-primary group-hover:text-white text-center leading-tight">
                    {skill.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Skills;