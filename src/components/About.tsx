import React, { useEffect, useState } from 'react';
import profileImage from '@/assets/profile-image.jpg';
import { useLanguage } from '@/contexts/LanguageContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { supabase } from '@/integrations/supabase/client';

interface ProfileData {
  name: string;
  description: string;
  description_en?: string;
  description_fr?: string;
  years_experience: number;
  projects_count: number;
  profile_image?: string;
}

const About = () => {
  const { t, language } = useLanguage();
  const { ref, isVisible } = useScrollAnimation();
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('name, description, description_en, description_fr, years_experience, projects_count, profile_image')
        .maybeSingle();

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const stats = [
    { key: 'about.experience', value: '5+' },
    { key: 'about.projects', value: '50+' },
    { key: 'about.clients', value: '25+' },
  ];

  return (
    <section id="about" className="py-20 section-bg">
      <div className="container mx-auto px-4">
        <div ref={ref} className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              {t('about.title')}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Profile Image */}
            <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
              <div className="relative">
                <div className="w-80 h-80 mx-auto rounded-2xl overflow-hidden shadow-card">
                  <img
                    src={profile?.profile_image || profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 hero-gradient rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">TL</span>
                </div>
              </div>
            </div>

            {/* About Content */}
            <div className={`transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {language === 'fr' 
                  ? (profile?.description_fr || profile?.description || t('about.description'))
                  : (profile?.description_en || profile?.description || t('about.description'))
                }
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {profile?.years_experience || 3}+
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t('about.experience')}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {profile?.projects_count || 12}+
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t('about.projects')}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">50+</div>
                  <div className="text-sm text-muted-foreground">
                    {t('about.clients')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;