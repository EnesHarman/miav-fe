import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { consultationService } from '@/services/consultations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Bot, User, MessageSquareText } from 'lucide-react';
import { format } from 'date-fns';
import { ConsultationSummaryResponse } from '@/types';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatInterfaceProps {
    petId: number;
    petName: string;
    petImage?: string;
}

export function ChatInterface({ petId, petName, petImage }: ChatInterfaceProps) {
    const [message, setMessage] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const isFirstRender = useRef(true);
    const queryClient = useQueryClient();

    const { data: consultations, isLoading } = useQuery({
        queryKey: ['consultations', petId],
        queryFn: () => consultationService.getConsultations(petId),
        enabled: isOpen,
    });

    const mutation = useMutation({
        mutationFn: (userMessage: string) =>
            consultationService.createConsultation(petId, { userMessage, imageUrls: [] }),
        onSuccess: (data) => {
            setMessage('');
            queryClient.setQueryData<ConsultationSummaryResponse[]>(['consultations', petId], (old) => {
                const newSummary: ConsultationSummaryResponse = {
                    id: data.id,
                    userMessage: data.userMessage,
                    aiResponsePreview: data.aiResponse, // Use full response as preview for now
                    aiResponse: data.aiResponse, // Store full response
                    urgencyLevel: data.urgencyLevel,
                    confidenceScore: data.confidenceScore,
                    imageCount: data.imageUrls?.length || 0,
                    createdAt: data.createdAt
                };
                if (!old) return [newSummary];
                return [...old, newSummary];
            });
        },
        onError: (error) => {
            console.error('Failed to send message:', error);
            toast.error('Failed to send message. Please try again.');
        }
    });

    useEffect(() => {
        if (isOpen && scrollRef.current) {
            const isInitial = isFirstRender.current;
            isFirstRender.current = false;

            setTimeout(() => {
                scrollRef.current?.scrollTo({
                    top: scrollRef.current.scrollHeight,
                    behavior: isInitial ? 'instant' : 'smooth'
                });
            }, 100);
        }

        // Reset ref when closed to ensure next open is instant
        return () => {
            if (!isOpen) isFirstRender.current = true;
        };
    }, [isOpen, consultations, mutation.isPending]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;
        mutation.mutate(message);
    };

    // Sort consultations by date (oldest first)
    const sortedConsultations = consultations?.slice().sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <MessageSquareText className="h-4 w-4" />
                    Ask AI Vet
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Bot className="h-6 w-6 text-primary" />
                        AI Consultation for {petName}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden relative bg-muted/30">
                    <div className="absolute inset-0 overflow-y-auto p-6 scroll-smooth" ref={scrollRef}>
                        <div className="space-y-8 pb-4 max-w-3xl mx-auto">
                            {isLoading ? (
                                <div className="flex justify-center p-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : sortedConsultations?.length === 0 ? (
                                <div className="text-center text-muted-foreground py-16">
                                    <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Bot className="h-10 w-10 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">Start a Consultation</h3>
                                    <p className="max-w-md mx-auto">
                                        Ask questions about {petName}'s health, diet, or behavior.
                                        The AI Assistant will provide detailed advice and recommendations.
                                    </p>
                                </div>
                            ) : (
                                sortedConsultations?.map((consultation) => (
                                    <div key={consultation.id} className="space-y-6">
                                        {/* User Message */}
                                        <div className="flex flex-row-reverse gap-4 items-start">
                                            <Avatar className="h-10 w-10 border-2 border-background shadow-sm shrink-0 mt-1">
                                                {petImage ? (
                                                    <AvatarImage src={petImage} />
                                                ) : (
                                                    <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                                                )}
                                            </Avatar>
                                            <div className="space-y-1 max-w-[75%]">
                                                <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-none px-6 py-4 shadow-md">
                                                    <p className="text-base leading-relaxed whitespace-pre-wrap break-words">{consultation.userMessage}</p>
                                                </div>
                                                <span className="text-xs text-muted-foreground block text-right pr-1">
                                                    {format(new Date(consultation.createdAt), 'MMM d, h:mm a')}
                                                </span>
                                            </div>
                                        </div>

                                        {/* AI Response */}
                                        <div className="flex gap-4 items-start">
                                            <Avatar className="h-10 w-10 border-2 border-background shadow-sm bg-primary/10 shrink-0 mt-1">
                                                <AvatarFallback><Bot className="h-5 w-5 text-primary" /></AvatarFallback>
                                            </Avatar>
                                            <div className="space-y-2 w-full max-w-[85%]">
                                                <div className="bg-card border rounded-2xl rounded-tl-none px-6 py-5 shadow-sm">
                                                    <div className="prose prose-slate dark:prose-invert max-w-none text-base break-words">
                                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                            {consultation.aiResponse || consultation.aiResponsePreview}
                                                        </ReactMarkdown>
                                                    </div>

                                                    <div className="flex flex-wrap items-center justify-between mt-4 pt-4 border-t gap-2">
                                                        <div className="flex gap-2">
                                                            {consultation.urgencyLevel && (
                                                                <Badge variant={getUrgencyVariant(consultation.urgencyLevel)} className="text-xs">
                                                                    {consultation.urgencyLevel}
                                                                </Badge>
                                                            )}
                                                            {consultation.confidenceScore > 0 && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    {(consultation.confidenceScore * 100).toFixed(0)}% confident
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <span className="text-xs text-muted-foreground font-medium">
                                                            AI Assistant
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}

                            {mutation.isPending && (
                                <div className="space-y-6">
                                    {/* Creating outgoing User Message temporarily */}
                                    <div className="flex flex-row-reverse gap-4 items-start">
                                        <Avatar className="h-10 w-10 border-2 border-background shadow-sm shrink-0 mt-1">
                                            {petImage ? (
                                                <AvatarImage src={petImage} />
                                            ) : (
                                                <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                                            )}
                                        </Avatar>
                                        <div className="space-y-1 max-w-[75%]">
                                            <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-none px-6 py-4 shadow-md opacity-70">
                                                <p className="text-base leading-relaxed whitespace-pre-wrap">{message}</p>
                                            </div>
                                            <span className="text-xs text-muted-foreground block text-right pr-1">Sending...</span>
                                        </div>
                                    </div>

                                    {/* AI Thinking Indicator */}
                                    <div className="flex gap-4 items-start">
                                        <Avatar className="h-10 w-10 border-2 border-background shadow-sm bg-primary/10 shrink-0 mt-1">
                                            <AvatarFallback><Bot className="h-5 w-5 text-primary" /></AvatarFallback>
                                        </Avatar>
                                        <div className="bg-card border rounded-2xl rounded-tl-none px-6 py-5 shadow-sm flex flex-col gap-3 min-w-[200px]">
                                            <div className="flex items-center gap-2 text-primary font-medium">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Running Analysis...
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-2 w-full bg-muted rounded-full animate-pulse" />
                                                <div className="h-2 w-3/4 bg-muted rounded-full animate-pulse" />
                                            </div>
                                            <span className="text-xs text-muted-foreground mt-1">This usually takes 10-20 seconds.</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t bg-background mt-auto">
                    <form onSubmit={handleSubmit} className="flex gap-4 max-w-3xl mx-auto w-full">
                        <Input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Ask about diet, symptoms, behavior..."
                            disabled={mutation.isPending}
                            className="flex-1 h-12 text-base"
                            autoFocus
                        />
                        <Button type="submit" size="lg" className="h-12 w-12 p-0 shrink-0" disabled={mutation.isPending || !message.trim()}>
                            <Send className="h-5 w-5" />
                        </Button>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function getUrgencyVariant(level: string): "default" | "secondary" | "destructive" | "outline" {
    switch (level?.toLowerCase()) {
        case 'high':
        case 'critical':
            return 'destructive';
        case 'medium':
        case 'moderate':
            return 'secondary';
        case 'low':
            return 'outline';
        default:
            return 'default';
    }
}
