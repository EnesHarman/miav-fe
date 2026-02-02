import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { petService } from '@/services/pets';
import { Layout } from '@/components/Layout';
import { ImageUploader } from '@/components/ImageUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, PawPrint, ChevronRight, ChevronLeft, ImageIcon, FileText, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { Species, Gender } from '@/types';

const petSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  species: z.enum(['CAT', 'DOG', 'OTHER'] as const),
  breed: z.string().max(50).optional(),
  gender: z.enum(['MALE', 'FEMALE'] as const).optional(),
  birthDate: z.string().optional(),
  weight: z.coerce.number().min(0).max(500).optional(),
  bio: z.string().max(500).optional(),
  neutered: z.boolean().default(false),
  chipNumber: z.string().max(50).optional(),
});

type PetFormData = z.infer<typeof petSchema>;

export default function AddPetPage() {
  const [step, setStep] = useState(1);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm<PetFormData>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      name: '',
      species: 'CAT',
      breed: '',
      gender: undefined,
      birthDate: '',
      weight: undefined,
      bio: '',
      neutered: false,
      chipNumber: '',
    },
  });

  const createPetMutation = useMutation({
    mutationFn: petService.createPet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      toast.success('Pet created successfully!');
      navigate('/');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create pet';
      toast.error(message);
    },
  });

  const onSubmit = (data: PetFormData) => {
    createPetMutation.mutate({
      name: data.name,
      species: data.species,
      breed: data.breed,
      gender: data.gender,
      birthDate: data.birthDate,
      weight: data.weight,
      bio: data.bio,
      neutered: data.neutered,
      chipNumber: data.chipNumber,
      imageUrls: uploadedUrls.length > 0 ? uploadedUrls : undefined,
    });
  };

  const canProceedToStep2 = uploadedUrls.length > 0;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Add New Pet</h1>
          <p className="text-muted-foreground mt-1">
            Tell us about your furry friend
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              <ImageIcon className="h-4 w-4" />
              <span className="text-sm font-medium">Photos</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">Details</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              <Check className="h-4 w-4" />
              <span className="text-sm font-medium">Confirm</span>
            </div>
          </div>
        </div>

        {/* Step 1: Image Upload */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Upload Photos
              </CardTitle>
              <CardDescription>
                Add some photos of your pet. The first image will be the profile picture.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ImageUploader
                uploadedUrls={uploadedUrls}
                onUrlsChange={setUploadedUrls}
                maxFiles={5}
              />
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => navigate('/')}>
                  Cancel
                </Button>
                <Button onClick={() => setStep(2)}>
                  {canProceedToStep2 ? 'Continue' : 'Skip Photos'}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Pet Details */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PawPrint className="h-5 w-5" />
                Pet Details
              </CardTitle>
              <CardDescription>
                Fill in your pet's information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(() => setStep(3))} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Boncuk" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="species"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Species *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select species" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="CAT">🐱 Cat</SelectItem>
                              <SelectItem value="DOG">🐕 Dog</SelectItem>
                              <SelectItem value="OTHER">🐾 Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="breed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Breed</FormLabel>
                          <FormControl>
                            <Input placeholder="British Shorthair" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="MALE">Male</SelectItem>
                              <SelectItem value="FEMALE">Female</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Birth Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
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
                            <Input type="number" step="0.1" placeholder="4.5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about your pet's personality..."
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="chipNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Chip Number</FormLabel>
                          <FormControl>
                            <Input placeholder="123456789012345" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="neutered"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Neutered/Spayed</FormLabel>
                            <FormDescription>
                              Check if your pet has been neutered or spayed
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setStep(1)}>
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button type="submit">
                      Review
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="h-5 w-5" />
                Confirm & Create
              </CardTitle>
              <CardDescription>
                Review your pet's information before creating
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preview */}
              <div className="bg-muted/50 rounded-xl p-6 space-y-4">
                {uploadedUrls.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {uploadedUrls.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`Pet photo ${i + 1}`}
                        className="h-20 w-20 rounded-xl object-cover flex-shrink-0"
                      />
                    ))}
                  </div>
                )}
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{form.getValues('name')}</h3>
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    <span className="bg-background px-2 py-1 rounded-full">
                      {form.getValues('species')}
                    </span>
                    {form.getValues('breed') && (
                      <span className="bg-background px-2 py-1 rounded-full">
                        {form.getValues('breed')}
                      </span>
                    )}
                    {form.getValues('gender') && (
                      <span className="bg-background px-2 py-1 rounded-full">
                        {form.getValues('gender')}
                      </span>
                    )}
                    {form.getValues('weight') && (
                      <span className="bg-background px-2 py-1 rounded-full">
                        {form.getValues('weight')} kg
                      </span>
                    )}
                    {form.getValues('neutered') && (
                      <span className="bg-background px-2 py-1 rounded-full">
                        Neutered
                      </span>
                    )}
                  </div>
                  {form.getValues('bio') && (
                    <p className="text-muted-foreground">{form.getValues('bio')}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Edit Details
                </Button>
                <Button
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={createPetMutation.isPending}
                >
                  {createPetMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <PawPrint className="mr-2 h-4 w-4" />
                      Create Pet
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
