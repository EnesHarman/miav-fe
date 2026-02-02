import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { petService } from '@/services/pets';
import { Layout } from '@/components/Layout';
import { PetCard } from '@/components/PetCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: pets, isLoading } = useQuery({
    queryKey: ['pets'],
    queryFn: petService.getMyPets,
  });

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi günler';
    return 'İyi akşamlar';
  };

  // Sadece kedi ve köpek
  const petsFiltered = pets?.filter((p) => p.species === 'CAT' || p.species === 'DOG') ?? [];
  const addCardCount = Math.max(2, 4 - petsFiltered.length);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#402E2A]/70">
              {greeting()}, {user?.firstName || 'Patili aile'} 👋
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#402E2A] sm:text-4xl">
              Patili ailenle neler var?
            </h1>
            <p className="mt-2 max-w-lg text-[#402E2A]/75">
              Evcil dostlarının bilgilerini buradan yönetebilir, yeni arkadaş ekleyebilirsin.
            </p>
          </div>
          <Link
            to="/add-pet"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#E67E66] px-5 py-3 text-base font-medium text-white shadow-md transition hover:bg-[#E67E66]/90 hover:shadow-lg"
          >
            <Plus className="h-5 w-5" />
            Yeni Evcil Hayvan Ekle
          </Link>
        </div>

        {/* Evcil dostlar — her zaman dolu: pet kartları + "ekle" kartları */}
        <section>
          <h2 className="mb-5 text-xl font-semibold text-[#402E2A]">Evcil dostların</h2>

          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-[280px] rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {petsFiltered.map((pet) => (
                <PetCard key={pet.id} pet={pet} />
              ))}
              {Array.from({ length: addCardCount }).map((_, i) => (
                <Link
                  key={`add-${i}`}
                  to="/add-pet"
                  className="group flex min-h-[280px] flex-col overflow-hidden rounded-2xl border-2 border-dashed border-[#402E2A]/15 bg-white/60 transition hover:border-[#E67E66]/40 hover:bg-[#FDF8F5]"
                >
                  <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#E67E66]/10 transition group-hover:bg-[#E67E66]/20">
                      <Plus className="h-10 w-10 text-[#E67E66]" />
                    </div>
                    <span className="text-center text-sm font-medium text-[#402E2A]/80 group-hover:text-[#E67E66]">
                      Evcil hayvan ekle
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
