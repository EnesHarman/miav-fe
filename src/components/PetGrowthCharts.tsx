import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    Legend
} from 'recharts';
import { Activity, AlertCircle, TrendingUp } from 'lucide-react';

import { petService } from '@/services/pets';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

interface PetGrowthChartsProps {
    petId: number;
}

export function PetGrowthCharts({ petId }: PetGrowthChartsProps) {
    const { data: records, isLoading } = useQuery({
        queryKey: ['pet-growth', petId],
        queryFn: () => petService.getGrowthHistory(petId),
    });

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-[300px] w-full rounded-xl" />
                <Skeleton className="h-[300px] w-full rounded-xl" />
            </div>
        );
    }

    // Filter records that have the necessary data and sort by date
    const cleanRecords = records
        ?.filter(r => r.date)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];

    if (cleanRecords.length < 3) {
        return (
            <Alert className="bg-muted/50 border-dashed">
                <Activity className="h-4 w-4" />
                <AlertTitle>Not enough data yet</AlertTitle>
                <AlertDescription>
                    Tracking your pet's growth requires at least 3 records.
                    Please add more daily records to see the charts.
                </AlertDescription>
            </Alert>
        );
    }

    // Format data for charts
    const chartData = cleanRecords.map(record => ({
        ...record,
        formattedDate: format(parseISO(record.date), 'MMM d'),
        // Ensure scores are present (defaults if missing)
        moodScore: record.moodScore ?? 0,
        appetiteScore: record.appetiteScore ?? 0,
    }));

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                {/* Weight Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            Weight History
                        </CardTitle>
                        <CardDescription>Weight tracking over time (kg)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                                    <XAxis
                                        dataKey="formattedDate"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                        dy={10}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                        unit="kg"
                                        domain={['auto', 'auto']}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--popover))',
                                            borderRadius: '8px',
                                            border: '1px solid hsl(var(--border))',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}
                                        labelStyle={{ color: 'hsl(var(--popover-foreground))', fontWeight: 'bold', marginBottom: '4px' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="weight"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorWeight)"
                                        name="Weight"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Wellness Chart (Mood & Appetite) */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Activity className="h-4 w-4 text-primary" />
                            Wellness Trends
                        </CardTitle>
                        <CardDescription>Mood (1-5) and Appetite (1-3) scores</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                                    <XAxis
                                        dataKey="formattedDate"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                        dy={10}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--popover))',
                                            borderRadius: '8px',
                                            border: '1px solid hsl(var(--border))',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Line
                                        type="monotone"
                                        dataKey="moodScore"
                                        name="Mood"
                                        stroke="#8884d8"
                                        strokeWidth={2}
                                        dot={{ r: 4, fill: '#8884d8' }}
                                        activeDot={{ r: 6 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="appetiteScore"
                                        name="Appetite"
                                        stroke="#82ca9d"
                                        strokeWidth={2}
                                        dot={{ r: 4, fill: '#82ca9d' }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
