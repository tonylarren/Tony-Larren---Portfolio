import React, { useState } from 'react';
import { Mail, Github, Linkedin, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { supabase } from '@/integrations/supabase/client';

const Contact = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { ref, isVisible } = useScrollAnimation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: formData.name,
          email: formData.email,
          message: formData.message,
        },
      });

      if (error) throw error;
      
      toast({
        title: t('contact.form.success'),
        description: 'I\'ll get back to you as soon as possible.',
      });

      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error sending contact email:', error);
      toast({
        title: t('contact.form.error'),
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      label: t('contact.info.email'),
      value: 'larrentony@gmail.com',
      href: 'mailto:larrentony@gmail.com',
    },
    {
      icon: Phone,
      label: t('contact.info.phone'),
      value: '+261 34 46 164 10',
      href: '#',
    },
    {
      icon: MapPin,
      label: t('contact.info.location'),
      value: 'Antananarivo, Madagascar',
      href: 'https://www.google.com/maps?q=Antananarivo,+Madagascar',
    },
  ];

  const socialLinks = [
    {
      icon: Github,
      label: 'GitHub',
      href: 'https://github.com/tonylarren',
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      href: 'https://linkedin.com/in/johndeveloper',
    },
    {
      icon: Mail,
      label: 'Email',
      href: 'mailto:larrentony@gmail.com',
    },
  ];

  return (
    <section id="contact" className="py-20">
      <div className="container mx-auto px-4">
        <div ref={ref} className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              {t('contact.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('contact.description')}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <Card className={`shadow-card transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Input
                      type="text"
                      name="name"
                      placeholder={t('contact.form.name')}
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="h-12"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <Input
                      type="email"
                      name="email"
                      placeholder={t('contact.form.email')}
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="h-12"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <Textarea
                      name="message"
                      placeholder={t('contact.form.message')}
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary-hover text-white py-3 text-lg font-semibold"
                  >
                    {isSubmitting ? 'Sending...' : t('contact.form.send')}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className={`transition-all duration-1000 delay-400 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}>
              {/* Contact Details */}
              <div className="mb-8">
                <h3 className="text-2xl font-semibold mb-6 text-foreground">
                  {t('contact.info.title')}
                </h3>
                <div className="space-y-4">
                  {contactInfo.map((info) => (
                    <a
                    target="_blank"
                      key={info.label}
                      href={info.href}
                      className="flex items-center space-x-4 text-muted-foreground hover:text-primary transition-colors duration-200 p-3 rounded-lg hover:bg-primary-light"
                    >
                      <info.icon className="w-5 h-5" />
                      <div>
                        <div className="font-medium">{info.label}</div>
                        <div className="text-sm">{info.value}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h3 className="text-2xl font-semibold mb-6 text-foreground">
                  {t('contact.social.title')}
                </h3>
                <div className="flex space-x-4">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-primary-light text-primary rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110"
                    >
                      <social.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;