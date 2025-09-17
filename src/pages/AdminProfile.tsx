import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  Loader2,
  User,
  FileText
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ProfileFormData {
  name: string;
  title: string;
  short_bio_en: string;
  short_bio_fr: string;
  description_en: string;
  description_fr: string;
  about: string;
  years_experience: number;
  projects_count: number;
  profile_image: string | null;
  cv_en: string | null;
  cv_fr: string | null;
}

const AdminProfile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    title: '',
    short_bio_en: '',
    short_bio_fr: '',
    description_en: '',
    description_fr: '',
    about: '',
    years_experience: 0,
    projects_count: 0,
    profile_image: null,
    cv_en: null,
    cv_fr: null
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingCVs, setUploadingCVs] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/admin');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // If no profile exists, keep default values
      } else {
        setFormData({
          name: data.name || '',
          title: data.title || '',
          short_bio_en: data.short_bio_en || '',
          short_bio_fr: data.short_bio_fr || '',
          description_en: data.description_en || '',
          description_fr: data.description_fr || '',
          about: data.about || '',
          years_experience: data.years_experience || 0,
          projects_count: data.projects_count || 0,
          profile_image: data.profile_image,
          cv_en: data.cv_en,
          cv_fr: data.cv_fr
        });
      }
      setLoadingProfile(false);
    } catch (error) {
      console.error('Error:', error);
      setLoadingProfile(false);
    }
  };

  const uploadFile = async (file: File, bucket: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const imageUrl = await uploadFile(file, 'profile-images');
      setFormData(prev => ({ ...prev, profile_image: imageUrl }));
      toast({
        title: "Success",
        description: "Profile image uploaded successfully"
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive"
      });
    }
    setUploadingImage(false);
  };

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>, language: 'en' | 'fr') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCVs(true);
    try {
      const cvUrl = await uploadFile(file, 'cvs');
      setFormData(prev => ({ 
        ...prev, 
        [language === 'en' ? 'cv_en' : 'cv_fr']: cvUrl 
      }));
      toast({
        title: "Success",
        description: `CV (${language.toUpperCase()}) uploaded successfully`
      });
    } catch (error) {
      console.error('Error uploading CV:', error);
      toast({
        title: "Error",
        description: "Failed to upload CV",
        variant: "destructive"
      });
    }
    setUploadingCVs(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!formData.name.trim() || !formData.short_bio_en.trim()) {
      setError('Name and short bio (English) are required');
      setIsLoading(false);
      return;
    }

    try {
      const profileData = {
        name: formData.name.trim(),
        title: formData.title.trim(),
        short_bio_en: formData.short_bio_en.trim(),
        short_bio_fr: formData.short_bio_fr.trim(),
        description_en: formData.description_en.trim(),
        description_fr: formData.description_fr.trim(),
        about: formData.about.trim(),
        years_experience: formData.years_experience,
        projects_count: formData.projects_count,
        profile_image: formData.profile_image,
        cv_en: formData.cv_en,
        cv_fr: formData.cv_fr,
        user_id: user?.id
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'user_id' });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Profile updated successfully"
      });

      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile. Please try again.');
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  if (loading || loadingProfile) {
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
              onClick={() => navigate('/admin/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Profile Management</h1>
            <p className="text-muted-foreground">
              Update your personal information and portfolio details
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              This information will be displayed on your portfolio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Profile Image */}
              <div className="space-y-4">
                <Label>Profile Image</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={formData.profile_image || undefined} />
                    <AvatarFallback>
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploadingImage}
                      onClick={() => document.getElementById('image-upload')?.click()}
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Image
                        </>
                      )}
                    </Button>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Recommended: Square image, at least 400x400px
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Professional Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Full Stack Developer, UI/UX Designer"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="short_bio_en">Short Bio (English) *</Label>
                  <Textarea
                    id="short_bio_en"
                    value={formData.short_bio_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, short_bio_en: e.target.value }))}
                    placeholder="Brief description for hero section (English)"
                    rows={2}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="short_bio_fr">Short Bio (French)</Label>
                  <Textarea
                    id="short_bio_fr"
                    value={formData.short_bio_fr}
                    onChange={(e) => setFormData(prev => ({ ...prev, short_bio_fr: e.target.value }))}
                    placeholder="Brève description pour la section héros (français)"
                    rows={2}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="description_en">About Me (English) *</Label>
                  <Textarea
                    id="description_en"
                    value={formData.description_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
                    placeholder="Tell visitors about yourself in English"
                    rows={4}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description_fr">About Me (French) *</Label>
                  <Textarea
                    id="description_fr"
                    value={formData.description_fr}
                    onChange={(e) => setFormData(prev => ({ ...prev, description_fr: e.target.value }))}
                    placeholder="Parlez de vous aux visiteurs en français"
                    rows={4}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="about">Additional Details</Label>
                <Textarea
                  id="about"
                  value={formData.about}
                  onChange={(e) => setFormData(prev => ({ ...prev, about: e.target.value }))}
                  placeholder="Additional information about your background, interests, etc."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="years_experience">Years of Experience</Label>
                  <Input
                    id="years_experience"
                    type="number"
                    min="0"
                    value={formData.years_experience}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      years_experience: parseInt(e.target.value) || 0 
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projects_count">Projects Completed</Label>
                  <Input
                    id="projects_count"
                    type="number"
                    min="0"
                    value={formData.projects_count}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      projects_count: parseInt(e.target.value) || 0 
                    }))}
                  />
                </div>
              </div>

              {/* CV Upload Section */}
              <div className="space-y-4">
                <Label>CV/Resume Files</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">English CV</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingCVs}
                        onClick={() => document.getElementById('cv-en-upload')?.click()}
                      >
                        {uploadingCVs ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <FileText className="h-3 w-3" />
                        )}
                      </Button>
                      {formData.cv_en ? (
                        <Button size="sm" variant="link" asChild>
                          <a href={formData.cv_en} target="_blank" rel="noopener noreferrer">
                            View CV
                          </a>
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground">No file uploaded</span>
                      )}
                    </div>
                    <input
                      id="cv-en-upload"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleCVUpload(e, 'en')}
                      className="hidden"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">French CV</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingCVs}
                        onClick={() => document.getElementById('cv-fr-upload')?.click()}
                      >
                        {uploadingCVs ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <FileText className="h-3 w-3" />
                        )}
                      </Button>
                      {formData.cv_fr ? (
                        <Button size="sm" variant="link" asChild>
                          <a href={formData.cv_fr} target="_blank" rel="noopener noreferrer">
                            View CV
                          </a>
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground">No file uploaded</span>
                      )}
                    </div>
                    <input
                      id="cv-fr-upload"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleCVUpload(e, 'fr')}
                      className="hidden"
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload your CV in PDF or Word format
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/dashboard')}
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
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Profile
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

export default AdminProfile;
