import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Upload, Eye, EyeOff, Trash2, Edit } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Skill {
  id: string;
  name: string;
  category: string;
  logo_url: string | null;
  is_visible: boolean;
  sort_order: number;
}

const AdminSkills = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    logo_file: null as File | null,
    is_visible: true
  });

  const categories = [
    'Frontend Development',
    'Backend Development',
    'Mobile Development',
    'Database & Cloud',
    'Tools & DevOps'
  ];

  useEffect(() => {
    if (user) {
      fetchSkills();
    }
  }, [user]);

  const fetchSkills = async () => {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('user_id', user?.id)
        .order('category', { ascending: true })
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setSkills(data || []);
    } catch (error) {
      console.error('Error fetching skills:', error);
      toast.error('Failed to fetch skills');
    } finally {
      setLoading(false);
    }
  };

  const uploadLogo = async (file: File): Promise<string | null> => {
    if (!user) return null;
    
    setUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('skill-logos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('skill-logos')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
      return null;
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      let logoUrl = null;
      if (formData.logo_file) {
        logoUrl = await uploadLogo(formData.logo_file);
        if (!logoUrl) return;
      }

      const skillData = {
        user_id: user.id,
        name: formData.name,
        category: formData.category,
        logo_url: logoUrl,
        is_visible: formData.is_visible,
        sort_order: skills.filter(s => s.category === formData.category).length
      };

      if (editingSkill) {
        const { error } = await supabase
          .from('skills')
          .update(skillData)
          .eq('id', editingSkill.id);
        
        if (error) throw error;
        toast.success('Skill updated successfully');
      } else {
        const { error } = await supabase
          .from('skills')
          .insert([skillData]);
        
        if (error) throw error;
        toast.success('Skill added successfully');
      }

      setFormData({ name: '', category: '', logo_file: null, is_visible: true });
      setEditingSkill(null);
      setShowAddDialog(false);
      fetchSkills();
    } catch (error) {
      console.error('Error saving skill:', error);
      toast.error('Failed to save skill');
    }
  };

  const toggleVisibility = async (skill: Skill) => {
    try {
      const { error } = await supabase
        .from('skills')
        .update({ is_visible: !skill.is_visible })
        .eq('id', skill.id);

      if (error) throw error;
      toast.success(`Skill ${!skill.is_visible ? 'shown' : 'hidden'}`);
      fetchSkills();
    } catch (error) {
      console.error('Error updating skill visibility:', error);
      toast.error('Failed to update skill visibility');
    }
  };

  const deleteSkill = async (skillId: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;

    try {
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', skillId);

      if (error) throw error;
      toast.success('Skill deleted successfully');
      fetchSkills();
    } catch (error) {
      console.error('Error deleting skill:', error);
      toast.error('Failed to delete skill');
    }
  };

  const startEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      category: skill.category,
      logo_file: null,
      is_visible: skill.is_visible
    });
    setShowAddDialog(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>;
  }

  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Skills Management</h1>
              <p className="text-muted-foreground">Manage your skills and technologies</p>
            </div>
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingSkill(null);
                setFormData({ name: '', category: '', logo_file: null, is_visible: true });
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Skill
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingSkill ? 'Edit Skill' : 'Add New Skill'}</DialogTitle>
                <DialogDescription>
                  {editingSkill ? 'Update the skill information.' : 'Add a new skill to your portfolio.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Skill Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., React, Python, etc."
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="logo">Logo (SVG preferred)</Label>
                  <Input
                    id="logo"
                    type="file"
                    accept=".svg,.png,.jpg,.jpeg,.webp"
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      logo_file: e.target.files?.[0] || null 
                    }))}
                    className="cursor-pointer"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="visible"
                    checked={formData.is_visible}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_visible: checked }))}
                  />
                  <Label htmlFor="visible">Visible on portfolio</Label>
                </div>
                
                <Button type="submit" disabled={uploadingLogo} className="w-full">
                  {uploadingLogo ? 'Uploading...' : editingSkill ? 'Update Skill' : 'Add Skill'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-8">
          {categories.map(category => {
            const categorySkills = groupedSkills[category] || [];
            return (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {category}
                    <Badge variant="secondary">{categorySkills.length} skills</Badge>
                  </CardTitle>
                  <CardDescription>
                    Manage skills in the {category.toLowerCase()} category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {categorySkills.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No skills in this category yet.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categorySkills.map(skill => (
                        <div
                          key={skill.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {skill.logo_url && (
                              <img
                                src={skill.logo_url}
                                alt={skill.name}
                                className="w-8 h-8 object-contain"
                              />
                            )}
                            <div>
                              <p className="font-medium">{skill.name}</p>
                              <div className="flex items-center gap-2">
                                {skill.is_visible ? (
                                  <Badge variant="default" className="text-xs">Visible</Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-xs">Hidden</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleVisibility(skill)}
                            >
                              {skill.is_visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEdit(skill)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteSkill(skill.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminSkills;