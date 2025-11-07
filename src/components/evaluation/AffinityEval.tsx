import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Grid3x3, Plus, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AffinityGroup {
  name: string;
  ideas: string[];
}

interface AffinityEvalProps {
  problematica: string;
  ideas: string[];
  onComplete: (data: { groups: AffinityGroup[] }) => void;
}

export const AffinityEval = ({ problematica, ideas, onComplete }: AffinityEvalProps) => {
  const [groups, setGroups] = useState<AffinityGroup[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [unassignedIdeas, setUnassignedIdeas] = useState<string[]>(ideas);

  const handleCreateGroup = () => {
    if (newGroupName.trim() && groups.length < 8) {
      setGroups([...groups, { name: newGroupName.trim(), ideas: [] }]);
      setNewGroupName('');
    }
  };

  const handleAssignIdea = (idea: string, groupIndex: number) => {
    const updatedGroups = [...groups];
    updatedGroups[groupIndex].ideas.push(idea);
    setGroups(updatedGroups);
    setUnassignedIdeas(unassignedIdeas.filter(i => i !== idea));
  };

  const handleRemoveIdea = (idea: string, groupIndex: number) => {
    const updatedGroups = [...groups];
    updatedGroups[groupIndex].ideas = updatedGroups[groupIndex].ideas.filter(i => i !== idea);
    setGroups(updatedGroups);
    setUnassignedIdeas([...unassignedIdeas, idea]);
  };

  const handleDeleteGroup = (groupIndex: number) => {
    const group = groups[groupIndex];
    setUnassignedIdeas([...unassignedIdeas, ...group.ideas]);
    setGroups(groups.filter((_, i) => i !== groupIndex));
  };

  const handleSubmit = () => {
    if (groups.length >= 2 && unassignedIdeas.length === 0) {
      onComplete({ groups });
    }
  };

  const isComplete = groups.length >= 2 && unassignedIdeas.length === 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Grid3x3 className="h-5 w-5 text-primary" />
            <CardTitle>🧩 Diagrama de Afinidad</CardTitle>
          </div>
          <CardDescription>Agrupa las ideas por categorías relacionadas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              <strong>Problemática:</strong> {problematica}
              <br />
              Organiza las {ideas.length} ideas en grupos por afinidad temática.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Nombre del grupo (ej: Tecnología, Capacitación...)"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCreateGroup();
                  }
                }}
                maxLength={50}
              />
              <Button 
                onClick={handleCreateGroup}
                disabled={!newGroupName.trim() || groups.length >= 8}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Crea al menos 2 grupos (máximo 8)
            </p>
          </div>

          {unassignedIdeas.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Ideas sin asignar ({unassignedIdeas.length}):</h4>
              <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                {unassignedIdeas.map((idea, index) => (
                  <Badge 
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {idea.substring(0, 40)}{idea.length > 40 ? '...' : ''}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {groups.map((group, groupIndex) => (
            <Card key={groupIndex} className="border-2">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">{group.name}</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteGroup(groupIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2 min-h-[60px] p-2 bg-muted/30 rounded">
                    {group.ideas.map((idea, ideaIndex) => (
                      <Badge 
                        key={ideaIndex}
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleRemoveIdea(idea, groupIndex)}
                      >
                        {idea.substring(0, 40)}{idea.length > 40 ? '...' : ''}
                      </Badge>
                    ))}
                    {group.ideas.length === 0 && (
                      <p className="text-xs text-muted-foreground">Arrastra ideas aquí o haz clic en ellas</p>
                    )}
                  </div>
                  {unassignedIdeas.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {unassignedIdeas.slice(0, 3).map((idea, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => handleAssignIdea(idea, groupIndex)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {idea.substring(0, 20)}...
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {!isComplete 
            ? `Crea grupos y asigna todas las ideas` 
            : '✓ Diagrama de afinidad completado'}
        </p>
        <Button onClick={handleSubmit} disabled={!isComplete} size="lg">
          Continuar
        </Button>
      </div>
    </div>
  );
};
