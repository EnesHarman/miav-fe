import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2, Plus, Upload, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { petService } from '@/services/pets';
import { storageService } from '@/services/storage';
import { CreateGrowthRecordRequest } from '@/types';

const formSchema = z.object({
    date: z.date({
        required_error: "A date is required.",
    }),
    weight: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Weight must be a positive number.",
    }),
    // Photo URL is optional and will be filled after upload
    photoUrl: z.string().optional(),
    notes: z.string().optional(),
    moodScore: z.number().min(1).max(5).optional(),
    appetiteScore: z.number().min(1).max(3).optional(),
});

interface AddGrowthRecordDialogProps {
    petId: number;
    trigger?: React.ReactNode;
}

export function AddGrowthRecordDialog({ petId, trigger }: AddGrowthRecordDialogProps) {
    const [open, setOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            date: new Date(),
            weight: "",
            photoUrl: "",
            notes: "",
            moodScore: 3,
            appetiteScore: 2,
        },
    });

    const mutation = useMutation({
        mutationFn: async (values: z.infer<typeof formSchema>) => {
            let finalPhotoUrl = values.photoUrl;

            // Upload file if selected
            if (selectedFile) {
                try {
                    const uploadResponse = await storageService.uploadFile(selectedFile);
                    finalPhotoUrl = uploadResponse.url;
                } catch (error) {
                    console.error("File upload failed:", error);
                    throw new Error("Failed to upload image");
                }
            }

            // Convert form values to API request format
            const requestData: CreateGrowthRecordRequest = {
                date: format(values.date, 'yyyy-MM-dd'),
                weight: Number(values.weight),
                photoUrl: finalPhotoUrl || undefined,
                notes: values.notes || undefined,
                moodScore: values.moodScore,
                appetiteScore: values.appetiteScore,
            };

            return petService.addGrowthRecord(petId, requestData);
        },
        onSuccess: () => {
            toast.success("Growth record added successfully!");
            queryClient.invalidateQueries({ queryKey: ['pet-growth', petId] });
            queryClient.invalidateQueries({ queryKey: ['pet', String(petId)] });
            setOpen(false);
            form.reset();
            setSelectedFile(null);
            setPreviewUrl(null);
        },
        onError: (error) => {
            console.error('Failed to add growth record:', error);
            toast.error(error instanceof Error ? error.message : "Failed to add growth record. Please try again.");
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        mutation.mutate(values);
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Record
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add Growth Record</DialogTitle>
                    <DialogDescription>
                        Track your pet's growth, mood, and health daily.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">

                        <div className="grid grid-cols-2 gap-4 items-start">
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal h-10",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date > new Date() || date < new Date("1900-01-01")
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="weight"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Weight (kg)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="0.0" {...field} type="number" step="0.01" className="h-10" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormItem>
                            <FormLabel>Photo (Optional)</FormLabel>
                            <FormControl>
                                <div className="space-y-3">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                    />

                                    {!selectedFile ? (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full h-24 border-dashed"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <Upload className="h-8 w-8" />
                                                <span>Click to upload photo</span>
                                            </div>
                                        </Button>
                                    ) : (
                                        <div className="relative rounded-md overflow-hidden border">
                                            <img
                                                src={previewUrl || ''}
                                                alt="Preview"
                                                className="w-full h-48 object-cover"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-2 right-2 h-8 w-8 rounded-full"
                                                onClick={removeFile}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </FormControl>
                            <FormDescription>
                                Upload a photo of your pet to track visual progress.
                            </FormDescription>
                        </FormItem>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="moodScore"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mood Score ({field.value}/5)</FormLabel>
                                        <FormControl>
                                            <Slider
                                                min={1}
                                                max={5}
                                                step={1}
                                                defaultValue={[field.value || 3]}
                                                onValueChange={(vals) => field.onChange(vals[0])}
                                                className="py-4"
                                            />
                                        </FormControl>
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Sad (1)</span>
                                            <span>Happy (5)</span>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="appetiteScore"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Appetite Score ({field.value}/3)</FormLabel>
                                        <FormControl>
                                            <Slider
                                                min={1}
                                                max={3}
                                                step={1}
                                                defaultValue={[field.value || 2]}
                                                onValueChange={(vals) => field.onChange(vals[0])}
                                                className="py-4"
                                            />
                                        </FormControl>
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Low (1)</span>
                                            <span>High (3)</span>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Any observations today?"
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Save Record
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
