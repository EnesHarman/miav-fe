import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { petService } from '@/services/pets';
import { Layout } from '@/components/Layout';
import { PetCard } from '@/components/PetCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PawPrint, Plus, Cat, Dog } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  
  const { data: pets, isLoading } = useQuery({
    queryKey: ['pets'],
    queryFn: petService.getMyPets,
  });

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {greeting()}, {user?.firstName || 'Pet Parent'}! 🐾
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your furry friends
            </p>
          </div>
          <Button asChild size="lg" className="gap-2">
            <Link to="/add-pet">
              <Plus className="h-5 w-5" />
              Add New Pet
            </Link>
          </Button>
        </div>

        {/* Pet Stats */}
        {!isLoading && pets && pets.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-card rounded-2xl p-4 border">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
                  <PawPrint className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pets.length}</p>
                  <p className="text-sm text-muted-foreground">Total Pets</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-2xl p-4 border">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Cat className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {pets.filter(p => p.species === 'CAT').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Cats</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-2xl p-4 border">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10">
                  <Dog className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {pets.filter(p => p.species === 'DOG').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Dogs</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-2xl p-4 border">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <PawPrint className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {pets.filter(p => p.species === 'OTHER').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Other</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pets List */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Pets</h2>
          
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
          ) : pets && pets.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {pets.map((pet) => (
                <PetCard key={pet.id} pet={pet} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-card rounded-2xl border">
              <div className="flex justify-center mb-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent">
                  <PawPrint className="h-10 w-10 text-accent-foreground" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">No pets yet</h3>
              <p className="text-muted-foreground mb-6">
                Start by adding your first furry friend!
              </p>
              <Button asChild>
                <Link to="/add-pet">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Pet
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
