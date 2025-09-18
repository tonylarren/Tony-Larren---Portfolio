import React from 'react';
import { Github, Linkedin, Mail, Heart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      icon: Github,
      label: 'GitHub',
      href: 'https://github.com/tonylarren',
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      href: '#',
    },
    {
      icon: Mail,
      label: 'Email',
      href: 'mailto:larrentony@gmail.com',
    },
  ];

  const quickLinks = [
    { key: 'nav.home', href: 'home' },
    { key: 'nav.about', href: 'about' },
    { key: 'nav.projects', href: 'projects' },
    { key: 'nav.skills', href: 'skills' },
    { key: 'nav.contact', href: 'contact' },
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="text-2xl font-bold text-primary mb-4">
              Tony Larren
            </div>
            <p className="text-muted-foreground mb-4">
              {t('hero.tagline')}
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-primary-light text-primary rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Quick Links
            </h3>
            <div className="space-y-2">
              {quickLinks.map((link) => (
                <button
                  key={link.key}
                  onClick={() => scrollToSection(link.href)}
                  className="block text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  {t(link.key)}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Contact
            </h3>
            <div className="space-y-2 text-muted-foreground">
              <p>larrentony@gmail.com</p>
              <p>+261 34 46 164 10</p>
              <p>Antananarivo, Madagascar</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-8 flex justify-center items-center">
          <p className="text-muted-foreground text-sm">
            © {currentYear} Tony Larren. {t('footer.rights')}
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;