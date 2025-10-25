'use client';

import { useState, useEffect } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { SuiWalletButton } from '@/components/SuiWalletButton';
import { SuiMarketCard } from '@/components/SuiMarketCard';
import { createMarket, getAllMarkets, Market, MARKET_TYPE_CUSTOM, MARKET_TYPE_PRICE } from '@/lib/sui-client';
import { useMarketWalrusStorage } from '@/hooks/useWalrusStorage';
import { toast } from 'sonner';
import { Plus, RefreshCw } from 'lucide-react';

export default function SuiMarketsPage() {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { storeMarket } = useMarketWalrusStorage();
  const connected = !!currentAccount;
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    optionA: '',
    optionB: '',
    category: 0,
    endTime: '',
    minBet: '0.1',
    maxBet: '10',
    imageUrl: '',
    marketType: MARKET_TYPE_CUSTOM,
    targetPrice: '0',
    priceAbove: true,
  });

  const loadMarkets = async () => {
    setIsLoading(true);
    try {
      const allMarkets = await getAllMarkets();
      setMarkets(allMarkets);
    } catch (error) {
      console.error('Error loading markets:', error);
      toast.error('Failed to load markets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMarkets();
  }, []);

  const handleCreateMarket = async () => {
    if (!connected) {
      toast.error('Please connect your wallet');
      return;
    }

    // Validation
    if (!formData.title || !formData.description || !formData.optionA || !formData.optionB) {
      toast.error('Please fill in all required fields');
      return;
    }

    const endTime = new Date(formData.endTime).getTime();
    if (endTime <= Date.now()) {
      toast.error('End time must be in the future');
      return;
    }

    const minBet = parseFloat(formData.minBet);
    const maxBet = parseFloat(formData.maxBet);
    if (isNaN(minBet) || isNaN(maxBet) || minBet <= 0 || maxBet < minBet) {
      toast.error('Invalid bet amounts');
      return;
    }

    if (formData.marketType === MARKET_TYPE_PRICE) {
      const targetPrice = parseFloat(formData.targetPrice);
      if (isNaN(targetPrice) || targetPrice <= 0) {
        toast.error('Invalid target price for price-based market');
        return;
      }
    }

    setIsCreating(true);
    try {
      await createMarket(
        formData.title,
        formData.description,
        formData.optionA,
        formData.optionB,
        formData.category,
        endTime,
        Math.floor(minBet * 1e9), // Convert to MIST
        Math.floor(maxBet * 1e9), // Convert to MIST
        formData.imageUrl,
        formData.marketType,
        Math.floor(parseFloat(formData.targetPrice) * 1e8), // Price with 8 decimals
        formData.priceAbove,
        { signAndExecuteTransaction }
      );

      // Store market data to Walrus decentralized storage
      const marketData = {
        id: `market-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: formData.title,
        description: formData.description,
        category: formData.category.toString(),
        endDate: new Date(endTime * 1000).toISOString(),
        options: {
          A: formData.optionA,
          B: formData.optionB
        },
        totalVolume: 0,
        totalBets: 0,
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        createdBy: currentAccount?.address || 'unknown',
        metadata: {
          suiTransaction: true,
          marketType: formData.marketType,
          minBet: Math.floor(minBet * 1e9),
          maxBet: Math.floor(maxBet * 1e9),
          targetPrice: Math.floor(parseFloat(formData.targetPrice) * 1e8),
          priceAbove: formData.priceAbove,
          imageUrl: formData.imageUrl
        }
      };

      // Store to Walrus (async, don't wait for it)
      storeMarket(marketData).then((result) => {
        if (result) {
          console.log('✅ Market stored to Walrus:', result);
        }
      }).catch((error) => {
        console.error('❌ Failed to store market to Walrus:', error);
        // Don't show error to user as the market was created successfully on Sui
      });

      toast.success('Market created successfully!');
      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        optionA: '',
        optionB: '',
        category: 0,
        endTime: '',
        minBet: '0.1',
        maxBet: '10',
        imageUrl: '',
        marketType: MARKET_TYPE_CUSTOM,
        targetPrice: '0',
        priceAbove: true,
      });
      loadMarkets();
    } catch (error) {
      console.error('Error creating market:', error);
      toast.error('Failed to create market');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Sui Prediction Markets</h1>
          <p className="text-muted-foreground mt-2">
            Decentralized prediction markets on Sui blockchain
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={loadMarkets}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <SuiWalletButton />
        </div>
      </div>

      {/* Create Market Button */}
      {connected && (
        <div className="mb-6">
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New Market
          </Button>
        </div>
      )}

      {/* Create Market Form */}
      {showCreateForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create New Prediction Market</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Market Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Will Bitcoin reach $150,000 by end of 2024?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category.toString()}
                  onValueChange={(value) => setFormData({ ...formData, category: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Cryptocurrency</SelectItem>
                    <SelectItem value="1">Sports</SelectItem>
                    <SelectItem value="2">Politics</SelectItem>
                    <SelectItem value="3">Technology</SelectItem>
                    <SelectItem value="4">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of the market conditions..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="optionA">Option A *</Label>
                <Input
                  id="optionA"
                  value={formData.optionA}
                  onChange={(e) => setFormData({ ...formData, optionA: e.target.value })}
                  placeholder="Yes / Above / Win"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="optionB">Option B *</Label>
                <Input
                  id="optionB"
                  value={formData.optionB}
                  onChange={(e) => setFormData({ ...formData, optionB: e.target.value })}
                  placeholder="No / Below / Lose"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minBet">Min Bet (SUI)</Label>
                <Input
                  id="minBet"
                  type="number"
                  value={formData.minBet}
                  onChange={(e) => setFormData({ ...formData, minBet: e.target.value })}
                  min="0.01"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxBet">Max Bet (SUI)</Label>
                <Input
                  id="maxBet"
                  type="number"
                  value={formData.maxBet}
                  onChange={(e) => setFormData({ ...formData, maxBet: e.target.value })}
                  min="0.01"
                  step="0.01"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL (optional)</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Market Type Selection */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="marketType"
                  checked={formData.marketType === MARKET_TYPE_PRICE}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, marketType: checked ? MARKET_TYPE_PRICE : MARKET_TYPE_CUSTOM })
                  }
                />
                <Label htmlFor="marketType">Price-based market (requires oracle)</Label>
              </div>

              {formData.marketType === MARKET_TYPE_PRICE && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="targetPrice">Target Price</Label>
                    <Input
                      id="targetPrice"
                      type="number"
                      value={formData.targetPrice}
                      onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
                      placeholder="150000"
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Price Direction</Label>
                    <Select
                      value={formData.priceAbove.toString()}
                      onValueChange={(value) => setFormData({ ...formData, priceAbove: value === 'true' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Above Target (Option A wins if price ≥ target)</SelectItem>
                        <SelectItem value="false">Below Target (Option A wins if price ≤ target)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleCreateMarket}
                disabled={isCreating}
                className="flex-1"
              >
                {isCreating ? 'Creating...' : 'Create Market'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Markets List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading markets...</p>
          </div>
        ) : markets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No markets found</p>
            {connected && (
              <p className="text-sm text-muted-foreground mt-2">
                Create the first market to get started!
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {markets.map((market) => (
              <SuiMarketCard
                key={market.id}
                market={market}
                onUpdate={loadMarkets}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}