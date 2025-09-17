import React, { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, toggleLanguage, language } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { key: 'nav.home', href: 'home' },
    { key: 'nav.about', href: 'about' },
    { key: 'nav.projects', href: 'projects' },
    { key: 'nav.skills', href: 'skills' },
    { key: 'nav.contact', href: 'contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'nav-blur shadow-soft py-2' : 'py-4'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-primary">
            TL
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => scrollToSection(item.href)}
                className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
              >
                {t(item.key)}
              </button>
            ))}
          </div>

          {/* Theme and Language Toggle */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="p-2 font-medium"
            >
              <Globe className="h-4 w-4 mr-1" />
              {language.toUpperCase()}
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border">
            <div className="flex flex-col space-y-3 pt-4">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => scrollToSection(item.href)}
                  className="text-left text-foreground hover:text-primary transition-colors duration-200 font-medium py-2"
                >
                  {t(item.key)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;