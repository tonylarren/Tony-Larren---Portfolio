import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useLanguage } from '@/contexts/LanguageContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
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
  is_under_development?: boolean;
}

// Skeleton component for loading state
const ProjectSkeleton = () => (
  <Card className="overflow-hidden">
    <div className="w-full h-48 bg-muted animate-pulse rounded-md"></div>
    <CardContent className="p-6">
      <div className="h-6 bg-muted rounded animate-pulse mb-2 w-3/4"></div>
      <div className="h-4 bg-muted rounded animate-pulse mb-4 w-5/6"></div>
      <div className="flex gap-2 mb-4">
        <div className="h-6 w-16 bg-muted rounded animate-pulse"></div>
        <div className="h-6 w-20 bg-muted rounded animate-pulse"></div>
      </div>
      <div className="flex gap-3">
        <div className="h-8 bg-muted rounded animate-pulse flex-1"></div>
        <div className="h-8 bg-muted rounded animate-pulse flex-1"></div>
      </div>
    </CardContent>
  </Card>
);

const Projects = () => {
  const { t, language } = useLanguage();
  const { ref, isVisible } = useScrollAnimation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('is_visible', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
      } else {
        setProjects(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  return (
    <section id="projects" className="py-20">
      <div className="container mx-auto px-4">
        <div ref={ref} className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              {t('projects.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('projects.description')}
            </p>
          </div>

          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <CarouselItem key={i} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                    <ProjectSkeleton />
                  </CarouselItem>
                ))
              ) : projects.length === 0 ? (
                <CarouselItem className="pl-2 md:pl-4 basis-full">
                  <Card className="text-center p-8">
                    <CardContent>
                      <p className="text-muted-foreground">No projects available yet.</p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ) : (
                projects.map((project, index) => (
                  <CarouselItem key={project.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                    <Link to={`/project/${project.id}`}>
                      <Card
                        className={`group overflow-hidden shadow-soft hover:shadow-card transition-all duration-500 delay-${index * 100} cursor-pointer ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                          }`}
                      >
                        <div className="relative overflow-hidden">
                          <img
                            src={project.images[0] || '/placeholder.svg'}
                            alt={project.title}
                            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>

                        <CardContent className="p-6">
                          <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                            {project.title}
                          </h3>
                          <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                            {language === 'fr'
                              ? (project.description_fr || project.description)
                              : (project.description_en || project.description)
                            }
                          </p>

                          {/* Tags */}
                          {project.technologies && project.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {project.technologies.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 bg-primary-light text-primary text-xs rounded-full font-medium"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Buttons */}
                          {/* Buttons */}
                          <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
                            {project.is_under_development ? (
                              <Button
                                size="sm"
                                className="flex-1 bg-gray-400 text-white cursor-not-allowed"
                                disabled
                              >
                                {t('projects.underDevelopment')}
                              </Button>
                            ) : (
                              <>
                                {project.live_demo_link && (
                                  <Button
                                    size="sm"
                                    className="flex-1 bg-primary hover:bg-primary-hover text-white"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      window.open(project.live_demo_link, '_blank');
                                    }}
                                  >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    {t('projects.viewLive')}
                                  </Button>
                                )}
                                {project.github_link && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 border-primary text-primary hover:bg-primary hover:text-white"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      window.open(project.github_link, '_blank');
                                    }}
                                  >
                                    <Github className="w-4 h-4 mr-2" />
                                    {t('projects.viewCode')}
                                  </Button>
                                )}
                              </>
                            )}
                          </div>

                          {/* Buttons */}
                        </CardContent>
                      </Card>
                    </Link>
                  </CarouselItem>
                ))
              )}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default Projects;
