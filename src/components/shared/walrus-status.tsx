"use client";

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    CheckCircle,
    XCircle,
    Loader2,
    RefreshCw,
    Database,
    Globe,
    Copy,
    ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

interface WalrusStatusProps {
    className?: string;
}

export function WalrusStatus({ className }: WalrusStatusProps) {
    const [publisherStatus, setPublisherStatus] = useState<'checking' | 'online' | 'offline'>('checking');
    const [aggregatorStatus, setAggregatorStatus] = useState<'checking' | 'online' | 'offline'>('checking');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const publisherUrl = process.env.NEXT_PUBLIC_WALRUS_PUBLISHER_URL || 'https://publisher-devnet.walrus.space';
    const aggregatorUrl = process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL || 'https://aggregator-devnet.walrus.space';

    const checkStatus = async () => {
        setIsRefreshing(true);

        // Check publisher status
        try {
            const publisherResponse = await fetch(`${publisherUrl}/v1/info`, {
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            });
            setPublisherStatus(publisherResponse.ok ? 'online' : 'offline');
        } catch {
            setPublisherStatus('offline');
        }

        // Check aggregator status
        try {
            const aggregatorResponse = await fetch(`${aggregatorUrl}/v1/info`, {
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            });
            setAggregatorStatus(aggregatorResponse.ok ? 'online' : 'offline');
        } catch {
            setAggregatorStatus('offline');
        }

        setIsRefreshing(false);
    };

    useEffect(() => {
        checkStatus();
    }, []);

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'online': return <CheckCircle className="h-4 w-4 text-green-400" />;
            case 'offline': return <XCircle className="h-4 w-4 text-red-400" />;
            case 'checking': return <Loader2 className="h-4 w-4 animate-spin text-yellow-400" />;
            default: return <XCircle className="h-4 w-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'offline': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'checking': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    return (
        <Card className={`bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50 ${className}`}>
            <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Database className="h-5 w-5 text-purple-400" />
                        <span>Walrus Network Status</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={checkStatus}
                        disabled={isRefreshing}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                    >
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Publisher Status */}
                <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                    <div className="flex items-center space-x-3">
                        {getStatusIcon(publisherStatus)}
                        <div>
                            <p className="text-white font-medium">Publisher</p>
                            <p className="text-xs text-gray-400">Data storage endpoint</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(publisherStatus)}>
                            {publisherStatus.toUpperCase()}
                        </Badge>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(publisherUrl, 'Publisher URL')}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                        >
                            <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(publisherUrl, '_blank')}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                        >
                            <ExternalLink className="h-3 w-3" />
                        </Button>
                    </div>
                </div>

                {/* Aggregator Status */}
                <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                    <div className="flex items-center space-x-3">
                        {getStatusIcon(aggregatorStatus)}
                        <div>
                            <p className="text-white font-medium">Aggregator</p>
                            <p className="text-xs text-gray-400">Data retrieval endpoint</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(aggregatorStatus)}>
                            {aggregatorStatus.toUpperCase()}
                        </Badge>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(aggregatorUrl, 'Aggregator URL')}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                        >
                            <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(aggregatorUrl, '_blank')}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                        >
                            <ExternalLink className="h-3 w-3" />
                        </Button>
                    </div>
                </div>

                {/* Overall Status */}
                <div className="pt-2 border-t border-gray-700/50">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Overall Status</span>
                        <Badge className={
                            publisherStatus === 'online' && aggregatorStatus === 'online'
                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                : publisherStatus === 'checking' || aggregatorStatus === 'checking'
                                    ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                        }>
                            {publisherStatus === 'online' && aggregatorStatus === 'online'
                                ? 'OPERATIONAL'
                                : publisherStatus === 'checking' || aggregatorStatus === 'checking'
                                    ? 'CHECKING'
                                    : 'DEGRADED'
                            }
                        </Badge>
                    </div>
                </div>

                {/* Network Info */}
                <div className="text-xs text-gray-500 space-y-1">
                    <p>• Walrus Devnet - Decentralized storage network</p>
                    <p>• Chat messages and bet history stored permanently</p>
                    <p>• Data retrievable via blob ID from any Walrus node</p>
                    <p>• Automatic fallback to mock mode when network unavailable</p>
                    <p>• Retry logic with exponential backoff for reliability</p>
                    {(publisherStatus === 'offline' && aggregatorStatus === 'offline') && (
                        <p className="text-yellow-400">• Currently using mock storage for testing</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}