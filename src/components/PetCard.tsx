import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Cat, Dog, PawPrint, ChevronRight } from 'lucide-react';
import type { Pet } from '@/types';

interface PetCardProps {
  pet: Pet;
}

const speciesIcons = {
  CAT: Cat,
  DOG: Dog,
  OTHER: PawPrint,
};

const speciesColors = {
  CAT: 'bg-primary/10 text-primary',
  DOG: 'bg-secondary/10 text-secondary',
  OTHER: 'bg-muted text-muted-foreground',
};

export function PetCard({ pet }: PetCardProps) {
  const Icon = speciesIcons[pet.species];

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <CardContent className="p-0">
        <div className="flex items-center gap-4 p-4">
          <Avatar className="h-20 w-20 rounded-2xl">
            <AvatarImage 
              src={pet.profilePictureUrl || pet.images?.[0]?.url} 
              alt={pet.name}
              className="object-cover"
            />
            <AvatarFallback className="rounded-2xl bg-accent">
              <Icon className="h-8 w-8 text-accent-foreground" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg text-foreground">{pet.name}</h3>
              <Badge variant="secondary" className={speciesColors[pet.species]}>
                <Icon className="mr-1 h-3 w-3" />
                {pet.species}
              </Badge>
            </div>
            {pet.breed && (
              <p className="text-sm text-muted-foreground">{pet.breed}</p>
            )}
            {pet.currentWeight && (
              <p className="text-sm text-muted-foreground">{pet.currentWeight} kg</p>
            )}
          </div>

          <Button variant="ghost" size="icon" asChild>
            <Link to={`/pets/${pet.id}`}>
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
