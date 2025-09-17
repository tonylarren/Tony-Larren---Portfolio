import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface Project {
  id: string;
  title: string;
  description: string;
  description_en?: string;
  description_fr?: string;
  images: string[];
  live_demo_link: string | null;
  github_link: string | null;
  technologies?: string[];
  key_features?: string[];
  about_project?: string;
  about_project_en?: string;
  about_project_fr?: string;
  is_visible: boolean;
}

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchProject(id);
    }
  }, [id]);

  const fetchProject = async (projectId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching project:', error);
        setError('Failed to load project');
      } else if (!data) {
        setError('Project not found');
      } else {
        setProject(data);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to load project');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {error || 'Project not found'}
          </h1>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.backToHome')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.backToHome')}
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {project.title}
              </h1>
              <p className="text-lg text-muted-foreground">
                {language === 'fr' 
                  ? (project.description_fr || project.description)
                  : (project.description_en || project.description)
                }
              </p>
            </div>
            
            <div className="flex gap-3 flex-shrink-0">
              {project.live_demo_link && (
                <Button
                  className="bg-primary hover:bg-primary-hover text-white"
                  onClick={() => window.open(project.live_demo_link, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {t('projects.viewLive')}
                </Button>
              )}
              {project.github_link && (
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={() => window.open(project.github_link, '_blank')}
                >
                  <Github className="w-4 h-4 mr-2" />
                  {t('projects.viewCode')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Image Carousel */}
        <section className="mb-12">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {project.images.length > 0 ? (
                project.images.map((image, index) => (
                  <CarouselItem key={index}>
                    <Card className="border-0">
                      <CardContent className="p-0">
                        <img
                          src={image}
                          alt={`${project.title} - Image ${index + 1}`}
                          className="w-full h-64 md:h-96 lg:h-[500px] object-cover rounded-lg"
                        />
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))
              ) : (
                <CarouselItem>
                  <Card className="border-0">
                    <CardContent className="p-0">
                      <div className="w-full h-64 md:h-96 lg:h-[500px] bg-muted rounded-lg flex items-center justify-center">
                        <p className="text-muted-foreground">No images available</p>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              )}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </section>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Project Details */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  {t('projects.about')}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {language === 'fr' 
                    ? (project.about_project_fr || project.about_project || project.description_fr || project.description)
                    : (project.about_project_en || project.about_project || project.description_en || project.description)
                  }
                </p>
                
                {project.key_features && project.key_features.length > 0 && (
                  <>
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      {t('projects.keyFeatures')}
                    </h3>
                    <ul className="space-y-2">
                      {project.key_features.map((feature, index) => (
                        <li key={index} className="flex items-center text-muted-foreground">
                          <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Project Info Sidebar */}
          <div className="space-y-6">
            {/* Technologies */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  {t('projects.technologies')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.technologies && project.technologies.length > 0 ? (
                    project.technologies.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-primary-light text-primary text-sm rounded-full font-medium"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">No technologies specified</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tech Stack */}
            {project.technologies && project.technologies.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    {t('projects.techStack')}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {project.technologies.join(', ')}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectDetail;