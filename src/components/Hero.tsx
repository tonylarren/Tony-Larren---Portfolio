import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  name: string;
  title?: string;
  short_bio_en?: string;
  short_bio_fr?: string;
  cv_en?: string;
  cv_fr?: string;
}

const Hero = () => {
  const { t, language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    setIsVisible(true);
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('name, title, short_bio_en, short_bio_fr, cv_en, cv_fr')
        .maybeSingle();

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  /*
  const handleDownloadCV = () => {
    const cvUrl = language === 'fr' ? profile?.cv_fr : profile?.cv_en;
    if (cvUrl) {
      window.open(cvUrl, '_blank');
    } else {
      console.log('CV not available for selected language');
    }
  };
  *
  const handleDownloadCV = () => {
    const cvUrl = language === 'fr' ? profile?.cv_fr : profile?.cv_en;
    if (cvUrl) {
      const link = document.createElement('a');
      link.href = cvUrl;
      // Optional: set a filename for the download
      link.download = language === 'fr' ? 'CV_Tony_Larren_FR.pdf' : 'CV_Tony_Larren_EN.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.log('CV not available for selected language');
    }
  };
  */
  const handleDownloadCV = async () => {
    const cvUrl = language === 'fr' ? profile?.cv_fr : profile?.cv_en;
    if (!cvUrl) {
      console.log('CV not available for selected language');
      return;
    }
  
    try {
      const response = await fetch(cvUrl);
      if (!response.ok) throw new Error('Network response was not ok');
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
  
      const link = document.createElement('a');
      link.href = url;
      link.download = language === 'fr' ? 'CV_Tony_Larren_FR.pdf' : 'CV_Tony_Larren_EN.pdf';
      document.body.appendChild(link);
      link.click();
  
      // Clean up
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download CV:', error);
    }
  };
  

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 hero-gradient opacity-5"></div>
      
      {/* Content */}
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground">
           Tony Larren
          </h1>
          
          <p className="text-xl md:text-2xl text-primary font-semibold mb-4">
            {profile?.title || t('hero.tagline')}
          </p>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            {language === 'fr' 
              ? (profile?.short_bio_fr || profile?.short_bio_en || t('hero.description'))
              : (profile?.short_bio_en || t('hero.description'))
            }
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              size="lg"
              onClick={() => scrollToSection('projects')}
              className="hero-gradient text-white border-0 hover:shadow-card transition-all duration-300 px-8 py-3 text-lg font-semibold"
            >
              {t('hero.cta')}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={handleDownloadCV}
              className="border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 px-8 py-3 text-lg font-semibold"
            >
              <Download className="w-5 h-5 mr-2" />
              {t('hero.downloadCV')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;