import { useQuery } from '@tanstack/react-query';
import { vaccineService } from '@/services/vaccines';
import type { Species } from '@/types';
import { VaccineGroupCard } from './VaccineGroupCard';
import { AddVaccineDialog } from './AddVaccineDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Syringe } from 'lucide-react';

interface VaccineListProps {
    petId: number;
    petSpecies: Species;
}

export function VaccineList({ petId, petSpecies }: VaccineListProps) {
    const { data: response, isLoading } = useQuery({
        queryKey: ['vaccines', petId],
        queryFn: () => vaccineService.getVaccines(petId),
    });

    const vaccineGroups = response?.vaccineGroups;

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex justify-end">
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <Skeleton className="h-48" />
                    <Skeleton className="h-48" />
                    <Skeleton className="h-48" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <AddVaccineDialog petId={petId} petSpecies={petSpecies} />
            </div>

            {vaccineGroups && vaccineGroups.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {vaccineGroups.map((group) => (
                        <VaccineGroupCard key={group.vaccineType} group={group} petId={petId} />
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="py-16 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                <Syringe className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </div>
                        <h3 className="font-semibold mb-1">No vaccine records yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Start tracking your pet's vaccination history
                        </p>
                        <AddVaccineDialog petId={petId} petSpecies={petSpecies} />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
