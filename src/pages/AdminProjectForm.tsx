import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  X, 
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ProjectFormData {
  title: string;
  description: string;
  description_en: string;
  description_fr: string;
  images: string[];
  live_demo_link: string;
  github_link: string;
  technologies: string[];
  key_features: string[];
  about_project: string;
  about_project_en: string;
  about_project_fr: string;
  is_visible: boolean;
}

const AdminProjectForm = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    description_en: '',
    description_fr: '',
    images: [],
    live_demo_link: '',
    github_link: '',
    technologies: [],
    key_features: [],
    about_project: '',
    about_project_en: '',
    about_project_fr: '',
    is_visible: true
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [loadingProject, setLoadingProject] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/admin');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (isEdit && user) {
      fetchProject();
    }
  }, [isEdit, user, id]);

  const fetchProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching project:', error);
        toast({
          title: "Error",
          description: "Project not found",
          variant: "destructive"
        });
        navigate('/admin/projects');
      } else {
        setFormData({
          title: data.title,
          description: data.description,
          description_en: data.description_en || data.description || '',
          description_fr: data.description_fr || data.description || '',
          images: data.images || [],
          live_demo_link: data.live_demo_link || '',
          github_link: data.github_link || '',
          technologies: data.technologies || [],
          key_features: data.key_features || [],
          about_project: data.about_project || '',
          about_project_en: data.about_project_en || data.about_project || '',
          about_project_fr: data.about_project_fr || data.about_project || '',
          is_visible: data.is_visible ?? true
        });
      }
      setLoadingProject(false);
    } catch (error) {
      console.error('Error:', error);
      setLoadingProject(false);
    }
  };

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('project-images')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: urlData } = supabase.storage
      .from('project-images')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      const uploadPromises = Array.from(files).map(file => uploadImage(file));
      const imageUrls = await Promise.all(uploadPromises);
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...imageUrls]
      }));
      
      toast({
        title: "Success",
        description: `${imageUrls.length} image(s) uploaded successfully`
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Error",
        description: "Failed to upload images",
        variant: "destructive"
      });
    }
    setUploadingImages(false);
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Title and description are required');
      setIsLoading(false);
      return;
    }

    try {
      const projectData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        description_en: formData.description_en.trim(),
        description_fr: formData.description_fr.trim(),
        images: formData.images,
        live_demo_link: formData.live_demo_link.trim() || null,
        github_link: formData.github_link.trim() || null,
        technologies: formData.technologies,
        key_features: formData.key_features,
        about_project: formData.about_project.trim(),
        about_project_en: formData.about_project_en.trim(),
        about_project_fr: formData.about_project_fr.trim(),
        is_visible: formData.is_visible,
        user_id: user?.id
      };

      if (isEdit) {
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', id)
          .eq('user_id', user?.id);

        if (error) {
          throw error;
        }

        toast({
          title: "Success",
          description: "Project updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('projects')
          .insert([projectData]);

        if (error) {
          throw error;
        }

        toast({
          title: "Success",
          description: "Project created successfully"
        });
      }

      navigate('/admin/projects');
    } catch (error) {
      console.error('Error saving project:', error);
      setError('Failed to save project. Please try again.');
      toast({
        title: "Error",
        description: "Failed to save project",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  if (loading || loadingProject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/admin/projects')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Projects
            </Button>
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {isEdit ? 'Edit Project' : 'Add New Project'}
            </h1>
            <p className="text-muted-foreground">
              {isEdit ? 'Update your project details' : 'Create a new portfolio project'}
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>{isEdit ? 'Edit Project' : 'Project Details'}</CardTitle>
            <CardDescription>
              Fill in the information about your project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter project title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Short Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief project description (used as fallback)"
                  rows={2}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="description_en">Description (English) *</Label>
                  <Textarea
                    id="description_en"
                    value={formData.description_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
                    placeholder="Describe your project in English"
                    rows={3}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description_fr">Description (French) *</Label>
                  <Textarea
                    id="description_fr"
                    value={formData.description_fr}
                    onChange={(e) => setFormData(prev => ({ ...prev, description_fr: e.target.value }))}
                    placeholder="Décrivez votre projet en français"
                    rows={3}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="about_project">About This Project (Fallback)</Label>
                <Textarea
                  id="about_project"
                  value={formData.about_project}
                  onChange={(e) => setFormData(prev => ({ ...prev, about_project: e.target.value }))}
                  placeholder="Brief project details (used as fallback)"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="about_project_en">About Project (English)</Label>
                  <Textarea
                    id="about_project_en"
                    value={formData.about_project_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, about_project_en: e.target.value }))}
                    placeholder="Detailed project description, purpose, and development process in English..."
                    rows={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="about_project_fr">About Project (French)</Label>
                  <Textarea
                    id="about_project_fr"
                    value={formData.about_project_fr}
                    onChange={(e) => setFormData(prev => ({ ...prev, about_project_fr: e.target.value }))}
                    placeholder="Description détaillée du projet, son objectif et le processus de développement en français..."
                    rows={6}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="technologies">Technologies Used</Label>
                <Textarea
                  id="technologies"
                  value={formData.technologies.join(', ')}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    technologies: e.target.value.split(',').map(tech => tech.trim()).filter(Boolean)
                  }))}
                  placeholder="React, Node.js, PostgreSQL, Tailwind CSS..."
                  rows={3}
                />
                <p className="text-sm text-muted-foreground">
                  Enter technologies separated by commas
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="key_features">Key Features</Label>
                <Textarea
                  id="key_features"
                  value={formData.key_features.join(', ')}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    key_features: e.target.value.split(',').map(feature => feature.trim()).filter(Boolean)
                  }))}
                  placeholder="User Authentication, Real-time Updates, Responsive Design..."
                  rows={3}
                />
                <p className="text-sm text-muted-foreground">
                  Enter key features separated by commas
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="live_demo_link">Live Demo URL</Label>
                <Input
                  id="live_demo_link"
                  type="url"
                  value={formData.live_demo_link}
                  onChange={(e) => setFormData(prev => ({ ...prev, live_demo_link: e.target.value }))}
                  placeholder="https://your-project-demo.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="github_link">GitHub Repository URL</Label>
                <Input
                  id="github_link"
                  type="url"
                  value={formData.github_link}
                  onChange={(e) => setFormData(prev => ({ ...prev, github_link: e.target.value }))}
                  placeholder="https://github.com/username/repository"
                />
              </div>

              <div className="space-y-4">
                <Label>Project Images</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <div className="mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={uploadingImages}
                        onClick={() => document.getElementById('image-upload')?.click()}
                      >
                        {uploadingImages ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Images
                          </>
                        )}
                      </Button>
                      <input
                        id="image-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Upload multiple images to showcase your project
                    </p>
                  </div>
                </div>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Project image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/projects')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEdit ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {isEdit ? 'Update Project' : 'Create Project'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminProjectForm;