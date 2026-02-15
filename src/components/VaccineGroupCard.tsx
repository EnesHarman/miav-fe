import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import type { VaccineGroupResponse, VaccineHistoryItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Syringe, ChevronDown, ChevronUp, MapPin, AlertCircle, Trash2, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vaccineService } from '@/services/vaccines';
import { toast } from 'sonner';
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

interface VaccineGroupCardProps {
    group: VaccineGroupResponse;
    petId: number;
}

const VACCINE_LABELS: Record<string, string> = {
    CANINE_PARASITE: 'Parasite Prevention',
    CANINE_RABIES: 'Rabies',
    CANINE_MIXED: 'Mixed Vaccine (DHPP)',
    CANINE_BORDETELLA: 'Bordetella',
    FELINE_PARASITE: 'Parasite Prevention',
    FELINE_RABIES: 'Rabies',
    FELINE_MIXED: 'Mixed Vaccine (FVRCP)',
    FELINE_LEUKEMIA: 'Feline Leukemia',
};

const REACTION_COLORS = {
    NONE: 'bg-green-100 text-green-800 border-green-200',
    MILD: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    SEVERE: 'bg-red-100 text-red-800 border-red-200',
};

export function VaccineGroupCard({ group, petId }: VaccineGroupCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Sort history by date descending
    const sortedHistory = [...group.vaccineHistory].sort((a, b) =>
        new Date(b.administeredDate).getTime() - new Date(a.administeredDate).getTime()
    );

    const latestVaccine = sortedHistory[0];

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-3 bg-muted/30">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                            <Syringe className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">
                                {VACCINE_LABELS[group.vaccineType] || group.vaccineType}
                            </CardTitle>
                            {group.nextVaccineDate && (
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>Next Due: <span className="font-medium text-foreground">{format(parseISO(group.nextVaccineDate), 'MMM d, yyyy')}</span></span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="space-y-4">
                    {/* Latest Vaccine Entry (Always Visible) */}
                    {latestVaccine ? (
                        <VaccineHistoryRow item={latestVaccine} petId={petId} isLatest={true} />
                    ) : (
                        <p className="text-sm text-muted-foreground italic">No history available</p>
                    )}

                    {/* History List (Collapsible) */}
                    {sortedHistory.length > 1 && (
                        <div className="pt-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-between text-muted-foreground hover:text-foreground mb-2"
                                onClick={() => setIsExpanded(!isExpanded)}
                            >
                                <span>Previous History ({sortedHistory.length - 1})</span>
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>

                            {isExpanded && (
                                <div className="space-y-3 pl-4 border-l-2 border-muted animate-in slide-in-from-top-2 duration-200">
                                    {sortedHistory.slice(1).map((item) => (
                                        <VaccineHistoryRow key={item.id} item={item} petId={petId} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function VaccineHistoryRow({ item, petId, isLatest = false }: { item: VaccineHistoryItem, petId: number, isLatest?: boolean }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: () => vaccineService.deleteVaccine(petId, item.id),
        onMutate: () => setIsDeleting(true),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vaccines', petId] });
            toast.success('Vaccine record deleted successfully');
        },
        onError: (error: any) => {
            setIsDeleting(false);
            const message = error.response?.data?.message || 'Failed to delete vaccine record';
            toast.error(message);
        },
    });

    const handleDelete = () => {
        deleteMutation.mutate();
    };

    return (
        <div className={`relative ${!isLatest ? 'py-2' : ''}`}>
            <div className="flex items-start justify-between group">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                            {format(parseISO(item.administeredDate), 'MMMM d, yyyy')}
                        </span>
                        {item.reactionSeverity && item.reactionSeverity !== 'NONE' && (
                            <Badge variant="outline" className={`text-[10px] h-5 px-1.5 ${REACTION_COLORS[item.reactionSeverity]}`}>
                                {item.reactionSeverity}
                            </Badge>
                        )}
                    </div>

                    {item.vetClinicName && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {item.vetClinicName}
                        </div>
                    )}

                    {item.reactionNotes && (
                        <p className="text-xs text-muted-foreground mt-1 bg-muted/50 p-2 rounded-md">
                            <span className="font-semibold block mb-0.5">Reaction Notes:</span>
                            {item.reactionNotes}
                        </p>
                    )}
                </div>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive hover:bg-destructive/10"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete vaccine record?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete this vaccine record from {format(parseISO(item.administeredDate), 'MMM d, yyyy')}.
                                This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}
