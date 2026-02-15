import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { vaccineService } from '@/services/vaccines';
import type { VaccineType, ReactionSeverity, Species } from '@/types';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Syringe } from 'lucide-react';

const vaccineSchema = z.object({
    vaccineType: z.string(),
    administeredDate: z.string().min(1, 'Date is required'),
    vetClinicName: z.string().max(200).optional(),
    reactionSeverity: z.enum(['NONE', 'MILD', 'SEVERE']).optional(),
    reactionNotes: z.string().max(500).optional(),
});

type VaccineFormData = z.infer<typeof vaccineSchema>;

interface AddVaccineDialogProps {
    petId: number;
    petSpecies: Species;
}

const CANINE_VACCINES: { value: VaccineType; label: string }[] = [
    { value: 'CANINE_PARASITE', label: 'Parasite Prevention' },
    { value: 'CANINE_RABIES', label: 'Rabies' },
    { value: 'CANINE_MIXED', label: 'Mixed Vaccine (DHPP)' },
    { value: 'CANINE_BORDETELLA', label: 'Bordetella (Kennel Cough)' },
];

const FELINE_VACCINES: { value: VaccineType; label: string }[] = [
    { value: 'FELINE_PARASITE', label: 'Parasite Prevention' },
    { value: 'FELINE_RABIES', label: 'Rabies' },
    { value: 'FELINE_MIXED', label: 'Mixed Vaccine (FVRCP)' },
    { value: 'FELINE_LEUKEMIA', label: 'Feline Leukemia (FeLV)' },
];

export function AddVaccineDialog({ petId, petSpecies }: AddVaccineDialogProps) {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const vaccineOptions = petSpecies === 'DOG' ? CANINE_VACCINES : FELINE_VACCINES;

    const form = useForm<VaccineFormData>({
        resolver: zodResolver(vaccineSchema),
        defaultValues: {
            vaccineType: '',
            administeredDate: '',
            vetClinicName: '',
            reactionSeverity: 'NONE',
            reactionNotes: '',
        },
    });

    const addMutation = useMutation({
        mutationFn: (data: VaccineFormData) =>
            vaccineService.addVaccine(petId, {
                vaccineType: data.vaccineType as VaccineType,
                administeredDate: data.administeredDate,
                vetClinicName: data.vetClinicName,
                reactionSeverity: data.reactionSeverity as ReactionSeverity,
                reactionNotes: data.reactionNotes,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vaccines', petId] });
            toast.success('Vaccine record added successfully!');
            form.reset();
            setOpen(false);
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to add vaccine record';
            toast.error(message);
        },
    });

    const onSubmit = (data: VaccineFormData) => {
        addMutation.mutate(data);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Vaccine
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Syringe className="h-5 w-5" />
                        Add Vaccine Record
                    </DialogTitle>
                    <DialogDescription>
                        Record a new vaccine administration for your pet
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="vaccineType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Vaccine Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select vaccine type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {vaccineOptions.map((vaccine) => (
                                                <SelectItem key={vaccine.value} value={vaccine.value}>
                                                    {vaccine.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="administeredDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Administered Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="vetClinicName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Veterinary Clinic (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Dr. Smith's Veterinary Clinic" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="reactionSeverity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reaction Severity</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select reaction severity" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="NONE">None</SelectItem>
                                            <SelectItem value="MILD">Mild</SelectItem>
                                            <SelectItem value="SEVERE">Severe</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="reactionNotes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reaction Notes (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Any observed reactions or notes..."
                                            className="resize-none"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={addMutation.isPending}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={addMutation.isPending}>
                                {addMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Add Vaccine
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
