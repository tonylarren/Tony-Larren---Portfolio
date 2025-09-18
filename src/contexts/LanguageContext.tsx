import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.projects': 'Projects',
    'nav.skills': 'Skills',
    'nav.contact': 'Contact',
    
    // Hero Section
    'hero.name': 'Tony Larren',
    'hero.tagline': 'Web & Mobile Developer',
    'hero.description': 'Passionate about creating beautiful, functional, and user-friendly digital experiences. Specializing in modern web and mobile applications.',
    'hero.cta': 'View Projects',
    'hero.downloadCV': 'Download CV',
    
    // About Section
    'about.title': 'About Me',
    'about.description': 'I\'m a passionate full-stack developer with 5+ years of experience creating digital solutions. I love turning complex problems into simple, beautiful designs. When I\'m not coding, you\'ll find me exploring new technologies and contributing to open-source projects.',
    'about.experience': 'Years of Experience',
    'about.projects': 'Projects Completed',
    'about.clients': 'Happy Clients',
    
    // Projects Section
    'projects.title': 'Featured Projects',
    'projects.description': 'Here are some of my recent projects that showcase my skills and experience.',
    'projects.viewLive': 'View Live',
    'projects.viewCode': 'View Code',
    'projects.about': 'About This Project',
    'projects.keyFeatures': 'Key Features',
    'projects.technologies': 'Technologies Used',
    'projects.techStack': 'Technical Stack',
    
    // Common
    'common.backToHome': 'Back to Home',
    
    // Skills Section
    'skills.title': 'Skills & Technologies',
    'skills.description': 'Technologies I work with to bring your ideas to life.',
    
    // Contact Section
    'contact.title': 'Get In Touch',
    'contact.description': 'Let\'s discuss your next project. I\'m always interested in new opportunities.',
    'contact.info.title': 'Contact Information',
    'contact.info.email': 'Email',
    'contact.info.phone': 'Phone',
    'contact.info.location': 'Location',
    'contact.social.title': 'Follow Me',
    'contact.form.name': 'Your Name',
    'contact.form.email': 'Your Email',
    'contact.form.message': 'Your Message',
    'contact.form.send': 'Send Message',
    'contact.form.success': 'Message sent successfully!',
    'contact.form.error': 'Error sending message. Please try again.',
    
    // Footer
    'footer.rights': 'All rights reserved.',
    'footer.builtWith': 'Built with React & Tailwind CSS',
  },
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.about': 'À Propos',
    'nav.projects': 'Projets',
    'nav.skills': 'Compétences',
    'nav.contact': 'Contact',
    
    // Hero Section
    'hero.name': 'Tony Larren',
    'hero.tagline': 'Développeur Web & Mobile',
    'hero.description': 'Passionné par la création d\'expériences numériques belles, fonctionnelles et conviviales. Spécialisé dans les applications web et mobiles modernes.',
    'hero.cta': 'Voir les Projets',
    'hero.downloadCV': 'Télécharger CV',
    
    // About Section
    'about.title': 'À Propos de Moi',
    'about.description': 'Je suis un développeur full-stack passionné avec plus de 5 ans d\'expérience dans la création de solutions numériques. J\'aime transformer des problèmes complexes en designs simples et beaux. Quand je ne code pas, vous me trouverez en train d\'explorer de nouvelles technologies et de contribuer à des projets open-source.',
    'about.experience': 'Années d\'Expérience',
    'about.projects': 'Projets Réalisés',
    'about.clients': 'Clients Satisfaits',
    
    // Projects Section
    'projects.title': 'Projets Sélectionnés',
    'projects.description': 'Voici quelques-uns de mes projets récents qui mettent en valeur mes compétences et mon expérience.',
    'projects.viewLive': 'Voir Démo',
    'projects.viewCode': 'Voir Code',
    'projects.about': 'À Propos de Ce Projet',
    'projects.keyFeatures': 'Fonctionnalités Clés',
    'projects.technologies': 'Technologies Utilisées',
    'projects.techStack': 'Stack Technique',
    
    // Common
    'common.backToHome': 'Retour à l\'Accueil',
    
    // Skills Section
    'skills.title': 'Compétences & Technologies',
    'skills.description': 'Technologies avec lesquelles je travaille pour donner vie à vos idées.',
    
    // Contact Section
    'contact.title': 'Prenons Contact',
    'contact.description': 'Discutons de votre prochain projet. Je suis toujours intéressé par de nouvelles opportunités.',
    'contact.info.title': 'Informations de Contact',
    'contact.info.email': 'Email',
    'contact.info.phone': 'Téléphone',
    'contact.info.location': 'Localisation',
    'contact.social.title': 'Suivez-moi',
    'contact.form.name': 'Votre Nom',
    'contact.form.email': 'Votre Email',
    'contact.form.message': 'Votre Message',
    'contact.form.send': 'Envoyer le Message',
    'contact.form.success': 'Message envoyé avec succès !',
    'contact.form.error': 'Erreur lors de l\'envoi. Veuillez réessayer.',
    
    // Footer
    'footer.rights': 'Tous droits réservés.',
    'footer.builtWith': 'Créé avec React & Tailwind CSS',
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'fr' : 'en');
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};