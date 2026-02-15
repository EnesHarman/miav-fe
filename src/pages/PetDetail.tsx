import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { petService } from '@/services/pets';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeft,
  Cat,
  Dog,
  PawPrint,
  Calendar,
  Scale,
  FileText,
  ImageIcon,
  Info,
  Activity,
  Trash2,
  Loader2,
  Syringe
} from 'lucide-react';
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
} from "@/components/ui/alert-dialog";
import { differenceInYears, differenceInMonths, parseISO, format } from 'date-fns';
import { AddGrowthRecordDialog } from '@/components/AddGrowthRecordDialog';
import { PetGrowthCharts } from '@/components/PetGrowthCharts';
import { ChatInterface } from '@/components/ChatInterface';
import { VaccineList } from '@/components/VaccineList';

const speciesIcons = {
  CAT: Cat,
  DOG: Dog,
  OTHER: PawPrint,
};

export default function PetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: pet, isLoading, error } = useQuery({
    queryKey: ['pet', id],
    queryFn: () => petService.getPetById(Number(id)),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => petService.deletePet(Number(id)),
    onMutate: () => setIsDeleting(true),
    onSuccess: () => {
      toast.success("Pet deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      navigate('/');
    },
    onError: (error) => {
      setIsDeleting(false);
      console.error("Failed to delete pet:", error);
      toast.error("Failed to delete pet. Please try again.");
    }
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return null;
    const birth = parseISO(birthDate);
    const years = differenceInYears(new Date(), birth);
    const months = differenceInMonths(new Date(), birth) % 12;

    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''}${months > 0 ? `, ${months} month${months > 1 ? 's' : ''}` : ''}`;
    }
    return `${months} month${months > 1 ? 's' : ''}`;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </Layout>
    );
  }

  if (error || !pet) {
    return (
      <Layout>
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold mb-2">Pet not found</h2>
          <p className="text-muted-foreground mb-4">
            The pet you're looking for doesn't exist or you don't have access.
          </p>
          <Button onClick={() => navigate('/')}>Go Back Home</Button>
        </div>
      </Layout>
    );
  }

  const Icon = speciesIcons[pet.species];
  const age = calculateAge(pet.birthDate);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            <ChatInterface
              petId={Number(pet.id)}
              petName={pet.name}
              petImage={pet.profilePictureUrl || pet.images?.[0]?.url}
            />

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Pet
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete <strong>{pet.name}</strong> and remove all associated data, including growth records and photos.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 to-accent">
          <div className="flex flex-col md:flex-row items-center gap-6 p-8">
            <Avatar className="h-40 w-40 rounded-3xl border-4 border-background shadow-xl">
              <AvatarImage
                src={pet.profilePictureUrl || pet.images?.[0]?.url}
                alt={pet.name}
                className="object-cover"
              />
              <AvatarFallback className="rounded-3xl bg-card">
                <Icon className="h-16 w-16 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>

            <div className="text-center md:text-left space-y-3 flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h1 className="text-4xl font-bold text-foreground">{pet.name}</h1>
                <Badge variant="secondary" className="text-sm">
                  <Icon className="mr-1 h-4 w-4" />
                  {pet.species}
                </Badge>
                {pet.gender && (
                  <Badge variant="outline">
                    {pet.gender === 'MALE' ? '♂️' : '♀️'} {pet.gender}
                  </Badge>
                )}
                {pet.neutered && (
                  <Badge variant="outline">Neutered</Badge>
                )}
              </div>

              {pet.breed && (
                <p className="text-lg text-muted-foreground">{pet.breed}</p>
              )}

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                {age && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {age} old
                  </span>
                )}
                {pet.currentWeight && (
                  <span className="flex items-center gap-1">
                    <Scale className="h-4 w-4" />
                    {pet.currentWeight} kg
                  </span>
                )}
              </div>
            </div>

            <div className="flex-shrink-0">
              <AddGrowthRecordDialog petId={pet.id} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="info" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="info" className="gap-2">
              <Info className="h-4 w-4" />
              Information
            </TabsTrigger>
            <TabsTrigger value="health" className="gap-2">
              <Activity className="h-4 w-4" />
              Health & Growth
            </TabsTrigger>
            <TabsTrigger value="vaccines" className="gap-2">
              <Syringe className="h-4 w-4" />
              Vaccines
            </TabsTrigger>
            <TabsTrigger value="gallery" className="gap-2">
              <ImageIcon className="h-4 w-4" />
              Gallery ({pet.images?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            {/* Bio */}
            {pet.bio && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    About {pet.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{pet.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Details Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Species</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-medium">{pet.species}</p>
                </CardContent>
              </Card>

              {pet.breed && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Breed</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-medium">{pet.breed}</p>
                  </CardContent>
                </Card>
              )}

              {pet.birthDate && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Birth Date</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-medium">
                      {format(parseISO(pet.birthDate), 'MMMM d, yyyy')}
                    </p>
                  </CardContent>
                </Card>
              )}

              {pet.currentWeight && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Weight</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-medium">{pet.currentWeight} kg</p>
                  </CardContent>
                </Card>
              )}

              {pet.chipNumber && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Chip Number</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-medium font-mono">{pet.chipNumber}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="health" className="space-y-4">
            <PetGrowthCharts petId={Number(pet.id)} />
          </TabsContent>

          <TabsContent value="vaccines" className="space-y-4">
            <VaccineList petId={Number(pet.id)} petSpecies={pet.species} />
          </TabsContent>

          <TabsContent value="gallery">
            {pet.images && pet.images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {pet.images.map((image) => (
                  <div
                    key={image.id}
                    className="relative aspect-square rounded-xl overflow-hidden bg-muted group"
                  >
                    <img
                      src={image.url}
                      alt={image.description || `${pet.name} photo`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    {image.isProfile && (
                      <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                        Profile
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                  <h3 className="font-semibold mb-1">No photos yet</h3>
                  <p className="text-sm text-muted-foreground">
                    This pet doesn't have any photos in the gallery
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
