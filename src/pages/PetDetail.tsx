import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { petService } from '@/services/pets';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Cat, Dog, PawPrint, Calendar, Scale, FileText, ImageIcon, Info } from 'lucide-react';
import { differenceInYears, differenceInMonths, parseISO, format } from 'date-fns';

const speciesIcons = {
  CAT: Cat,
  DOG: Dog,
  OTHER: PawPrint,
};

export default function PetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: pet, isLoading, error } = useQuery({
    queryKey: ['pet', id],
    queryFn: () => petService.getPetById(Number(id)),
    enabled: !!id,
  });

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
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

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

            <div className="text-center md:text-left space-y-3">
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
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="info" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
            <TabsTrigger value="info" className="gap-2">
              <Info className="h-4 w-4" />
              Information
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
