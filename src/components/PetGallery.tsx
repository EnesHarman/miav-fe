import { useState, useCallback, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { petService } from '@/services/pets';
import type { PetImage } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Upload,
    Trash2,
    Star,
    ImageIcon,
    Loader2,
    X,
    CheckCircle2,
} from 'lucide-react';

interface PetGalleryProps {
    petId: number;
    images: PetImage[];
}

interface PreviewFile {
    file: File;
    preview: string;
}

export function PetGallery({ petId, images }: PetGalleryProps) {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Upload state
    const [pendingFiles, setPendingFiles] = useState<PreviewFile[]>([]);
    const [description, setDescription] = useState('');
    const [isDragOver, setIsDragOver] = useState(false);

    // Delete confirmation state
    const [imageToDelete, setImageToDelete] = useState<PetImage | null>(null);

    // ── Mutations ──────────────────────────────────────────────────────────────

    const uploadMutation = useMutation({
        mutationFn: (files: File[]) => petService.addPetImages(petId, files, description || undefined),
        onSuccess: () => {
            toast.success('Images uploaded successfully!');
            setPendingFiles([]);
            setDescription('');
            queryClient.invalidateQueries({ queryKey: ['pet', String(petId)] });
        },
        onError: () => {
            toast.error('Failed to upload images. Please try again.');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (imageId: number) => petService.deletePetImage(petId, imageId),
        onSuccess: () => {
            toast.success('Image deleted.');
            setImageToDelete(null);
            queryClient.invalidateQueries({ queryKey: ['pet', String(petId)] });
        },
        onError: () => {
            toast.error('Failed to delete image. Please try again.');
            setImageToDelete(null);
        },
    });

    const setProfileMutation = useMutation({
        mutationFn: (imageId: number) => petService.setProfileImage(petId, imageId),
        onSuccess: () => {
            toast.success('Profile picture updated!');
            queryClient.invalidateQueries({ queryKey: ['pet', String(petId)] });
        },
        onError: () => {
            toast.error('Failed to update profile picture. Please try again.');
        },
    });

    // ── File handling ──────────────────────────────────────────────────────────

    const addFiles = useCallback((newFiles: File[]) => {
        const imageFiles = newFiles.filter((f) => f.type.startsWith('image/'));
        const previews: PreviewFile[] = imageFiles.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        setPendingFiles((prev) => [...prev, ...previews].slice(0, 10));
    }, []);

    const removePreview = (index: number) => {
        setPendingFiles((prev) => {
            const next = [...prev];
            URL.revokeObjectURL(next[index].preview);
            next.splice(index, 1);
            return next;
        });
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        addFiles(Array.from(e.dataTransfer.files));
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            addFiles(Array.from(e.target.files));
            e.target.value = '';
        }
    };

    const handleUpload = () => {
        if (pendingFiles.length === 0) return;
        uploadMutation.mutate(pendingFiles.map((pf) => pf.file));
    };

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-6">
            {/* ── Upload Section ── */}
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Upload New Photos
                    </h3>

                    {/* Drop zone */}
                    <div
                        onDrop={handleDrop}
                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                        onDragLeave={() => setIsDragOver(false)}
                        onClick={() => fileInputRef.current?.click()}
                        className={`
              border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
              ${isDragOver
                                ? 'border-primary bg-primary/5 scale-[1.01]'
                                : 'border-border hover:border-primary/50 hover:bg-accent/30'
                            }
            `}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleFileInput}
                        />
                        <div className="flex flex-col items-center gap-2">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${isDragOver ? 'bg-primary/20' : 'bg-accent'}`}>
                                <Upload className={`h-6 w-6 transition-colors ${isDragOver ? 'text-primary' : 'text-accent-foreground'}`} />
                            </div>
                            {isDragOver ? (
                                <p className="text-primary font-medium">Drop images here…</p>
                            ) : (
                                <>
                                    <p className="font-medium">Drag & drop images here</p>
                                    <p className="text-sm text-muted-foreground">or click to select files</p>
                                </>
                            )}
                            <p className="text-xs text-muted-foreground">JPEG, PNG, WebP, GIF — up to 10 files</p>
                        </div>
                    </div>

                    {/* Pending previews */}
                    {pendingFiles.length > 0 && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                {pendingFiles.map((pf, index) => (
                                    <div key={pf.preview} className="relative group aspect-square rounded-xl overflow-hidden bg-muted">
                                        <img
                                            src={pf.preview}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removePreview(index); }}
                                            className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Optional description */}
                            <div className="space-y-1">
                                <Label htmlFor="img-description" className="text-sm">
                                    Description <span className="text-muted-foreground">(optional)</span>
                                </Label>
                                <Input
                                    id="img-description"
                                    placeholder="e.g. Summer walk in the park"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <Button
                                onClick={handleUpload}
                                disabled={uploadMutation.isPending}
                                className="w-full gap-2"
                            >
                                {uploadMutation.isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Uploading {pendingFiles.length} image{pendingFiles.length > 1 ? 's' : ''}…
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="h-4 w-4" />
                                        Upload {pendingFiles.length} image{pendingFiles.length > 1 ? 's' : ''}
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ── Gallery Grid ── */}
            {images && images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((image) => {
                        const isSettingProfile = setProfileMutation.isPending && setProfileMutation.variables === image.id;
                        const isDeleting = deleteMutation.isPending && deleteMutation.variables === image.id;

                        return (
                            <div
                                key={image.id}
                                className="relative aspect-square rounded-xl overflow-hidden bg-muted group"
                            >
                                <img
                                    src={image.url}
                                    alt={image.description || 'Pet photo'}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />

                                {/* Loading overlay */}
                                {(isSettingProfile || isDeleting) && (
                                    <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    </div>
                                )}

                                {/* Profile badge */}
                                {image.profile && (
                                    <span className="absolute top-2 left-2 flex items-center gap-1 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium shadow">
                                        <Star className="h-3 w-3 fill-current" />
                                        Profile
                                    </span>
                                )}

                                {/* Hover action overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                                <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    {/* Set as profile */}
                                    {!image.profile && (
                                        <button
                                            title="Set as profile picture"
                                            onClick={() => setProfileMutation.mutate(image.id)}
                                            disabled={setProfileMutation.isPending || deleteMutation.isPending}
                                            className="h-8 w-8 rounded-full bg-background/90 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors shadow disabled:opacity-50"
                                        >
                                            <Star className="h-4 w-4" />
                                        </button>
                                    )}

                                    {/* Delete */}
                                    <button
                                        title="Delete image"
                                        onClick={() => setImageToDelete(image)}
                                        disabled={deleteMutation.isPending || setProfileMutation.isPending}
                                        className="h-8 w-8 rounded-full bg-background/90 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors shadow disabled:opacity-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Description tooltip */}
                                {image.description && (
                                    <div className="absolute bottom-2 left-2 right-12 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <p className="text-white text-xs truncate drop-shadow">{image.description}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
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
                            Upload photos above to build your pet's gallery
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* ── Delete Confirmation Dialog ── */}
            <AlertDialog open={!!imageToDelete} onOpenChange={(open) => !open && setImageToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this photo?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. The photo will be permanently removed from the gallery.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    {imageToDelete && (
                        <div className="my-2 rounded-xl overflow-hidden aspect-video bg-muted">
                            <img
                                src={imageToDelete.url}
                                alt="To be deleted"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => imageToDelete && deleteMutation.mutate(imageToDelete.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            Delete Photo
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
