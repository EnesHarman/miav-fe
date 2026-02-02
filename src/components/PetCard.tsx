import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
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

const speciesLabels: Record<string, string> = {
  CAT: 'Kedi',
  DOG: 'Köpek',
  OTHER: 'Diğer',
};

export function PetCard({ pet }: PetCardProps) {
  const Icon = speciesIcons[pet.species] ?? PawPrint;
  const label = speciesLabels[pet.species] ?? 'Diğer';
  const imageUrl = pet.profilePictureUrl || pet.images?.[0]?.url;

  return (
    <Card className="group overflow-hidden rounded-2xl border border-[#402E2A]/10 bg-white/90 shadow-sm transition hover:shadow-md">
      <CardContent className="p-0">
        <Link to={`/pets/${pet.id}`} className="flex flex-col">
          {/* Üst: büyük fotoğraf alanı */}
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FDF8F5]">
            <Avatar className="h-full w-full rounded-none">
              <AvatarImage
                src={imageUrl}
                alt={pet.name}
                className="object-cover"
              />
              <AvatarFallback className="rounded-none bg-[#E67E66]/10 text-[#E67E66]">
                <Icon className="h-16 w-16" />
              </AvatarFallback>
            </Avatar>
            <span className="absolute right-3 top-3 rounded-lg border border-[#402E2A]/10 bg-white/90 px-2 py-1 text-xs font-medium text-[#402E2A]/80 backdrop-blur-sm">
              {label}
            </span>
          </div>
          {/* Alt: isim ve kısa bilgi */}
          <div className="flex items-center justify-between gap-3 p-4">
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold text-lg text-[#402E2A]">{pet.name}</h3>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0 text-sm text-[#402E2A]/70">
                {pet.breed && <span className="truncate">{pet.breed}</span>}
                {pet.currentWeight != null && (
                  <span>{pet.currentWeight} kg</span>
                )}
              </div>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-[#402E2A]/40 transition group-hover:translate-x-0.5 group-hover:text-[#E67E66]" />
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
