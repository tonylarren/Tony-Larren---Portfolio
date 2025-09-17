import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Github,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Project {
  id: string;
  title: string;
  description: string;
  images: string[];
  live_demo_link: string | null;
  github_link: string | null;
  created_at: string;
  is_visible: boolean;
}

const AdminProjects = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/admin');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: "Error",
          description: "Failed to fetch projects",
          variant: "destructive"
        });
      } else {
        setProjects(data || []);
      }
      setLoadingData(false);
    } catch (error) {
      console.error('Error:', error);
      setLoadingData(false);
    }
  };

  const deleteProject = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error deleting project:', error);
        toast({
          title: "Error",
          description: "Failed to delete project",
          variant: "destructive"
        });
      } else {
        setProjects(projects.filter(p => p.id !== id));
        toast({
          title: "Success",
          description: "Project deleted successfully"
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive"
      });
    }
    setDeletingId(null);
  };

  const toggleVisibility = async (id: string, currentVisibility: boolean) => {
    setTogglingId(id);
    try {
      const { error } = await supabase
        .from('projects')
        .update({ is_visible: !currentVisibility })
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error updating project visibility:', error);
        toast({
          title: "Error",
          description: "Failed to update project visibility",
          variant: "destructive"
        });
      } else {
        setProjects(projects.map(p => 
          p.id === id ? { ...p, is_visible: !currentVisibility } : p
        ));
        toast({
          title: "Success",
          description: `Project ${!currentVisibility ? 'shown' : 'hidden'} in portfolio`
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to update project visibility",
        variant: "destructive"
      });
    }
    setTogglingId(null);
  };

  if (loading || loadingData) {
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Project Management</h1>
              <p className="text-muted-foreground">Manage your portfolio projects</p>
            </div>
            <Button onClick={() => navigate('/admin/projects/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {projects.length === 0 ? (
          <Card>
            <CardHeader className="text-center">
              <CardTitle>No Projects Yet</CardTitle>
              <CardDescription>
                Start building your portfolio by adding your first project
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => navigate('/admin/projects/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>Projects Overview</CardTitle>
                <CardDescription>
                  Total projects: {projects.length}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Projects Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Images</TableHead>
                        <TableHead>Links</TableHead>
                        <TableHead>Visibility</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projects.map((project) => (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">
                            {project.title}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <p className="truncate">{project.description}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {project.images.length} images
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {project.live_demo_link && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  asChild
                                >
                                  <a
                                    href={project.live_demo_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                </Button>
                              )}
                              {project.github_link && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  asChild
                                >
                                  <a
                                    href={project.github_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Github className="h-3 w-3" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={project.is_visible}
                                onCheckedChange={() => toggleVisibility(project.id, project.is_visible)}
                                disabled={togglingId === project.id}
                              />
                              <div className="flex items-center">
                                {project.is_visible ? (
                                  <Eye className="h-4 w-4 text-green-600" />
                                ) : (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(project.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/admin/projects/edit/${project.id}`)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Project</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{project.title}"? 
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteProject(project.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      disabled={deletingId === project.id}
                                    >
                                      {deletingId === project.id ? (
                                        <>
                                          <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                          Deleting...
                                        </>
                                      ) : (
                                        'Delete'
                                      )}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProjects;