"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePredictionContract } from "@/hooks/use-prediction-contract";
import { OwnerOnly } from "@/components/auth/owner-only";
import { toast } from "sonner";
import { Loader2, Plus, Calendar, DollarSign, Image as ImageIcon } from "lucide-react";

const CATEGORIES = [
  { value: 0, label: "Sports" },
  { value: 1, label: "Politics" },
  { value: 2, label: "Technology" },
  { value: 3, label: "Entertainment" },
  { value: 4, label: "Finance" },
  { value: 5, label: "Other" },
];

export default function CreateMarketPage() {
  const router = useRouter();
  const { createMarket, isLoading } = usePredictionContract();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    optionA: "",
    optionB: "",
    category: "",
    endDate: "",
    endTime: "",
    minBet: "0.01",
    maxBet: "100",
    imageUrl: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.description || !formData.optionA || !formData.optionB) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.endDate || !formData.endTime) {
      toast.error("Please set an end date and time");
      return;
    }

    if (!formData.category) {
      toast.error("Please select a category");
      return;
    }

    // Create end timestamp
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
    const endTimestamp = Math.floor(endDateTime.getTime() / 1000);

    // Check if end time is in the future
    if (endTimestamp <= Math.floor(Date.now() / 1000)) {
      toast.error("End time must be in the future");
      return;
    }

    try {
      console.log("🏗️ Creating market with data:", {
        ...formData,
        endTimestamp,
      });

      await createMarket({
        title: formData.title,
        description: formData.description,
        optionA: formData.optionA,
        optionB: formData.optionB,
        category: parseInt(formData.category),
        endTime: endTimestamp,
        minBet: formData.minBet,
        maxBet: formData.maxBet,
        imageUrl: formData.imageUrl || "",
      });

      toast.success("Market created successfully!");
      router.push("/markets");
      
    } catch (error: any) {
      console.error("❌ Failed to create market:", error);
      // Error is already handled in the hook
    }
  };

  return (
    <OwnerOnly>
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Create New Market</h1>
              <p className="text-gray-400">
                Create a new prediction market for users to trade on (Admin Only)
              </p>
            </div>

            {/* Form */}
            <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Plus className="h-5 w-5 text-[#eab308]" />
                  <span>Market Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title" className="text-gray-300">
                        Market Title *
                      </Label>
                      <Input
                        id="title"
                        placeholder="e.g., Will Bitcoin reach $100,000 by end of 2024?"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-[#eab308] focus:ring-[#eab308]/20"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-gray-300">
                        Description *
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Provide detailed information about the market conditions and resolution criteria..."
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-[#eab308] focus:ring-[#eab308]/20 min-h-[100px]"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="imageUrl" className="text-gray-300">
                        Image URL (Optional)
                      </Label>
                      <div className="relative">
                        <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="imageUrl"
                          placeholder="https://example.com/image.jpg"
                          value={formData.imageUrl}
                          onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                          className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-[#eab308] focus:ring-[#eab308]/20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="optionA" className="text-gray-300">
                        Option A *
                      </Label>
                      <Input
                        id="optionA"
                        placeholder="e.g., Yes"
                        value={formData.optionA}
                        onChange={(e) => handleInputChange("optionA", e.target.value)}
                        className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-[#eab308] focus:ring-[#eab308]/20"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="optionB" className="text-gray-300">
                        Option B *
                      </Label>
                      <Input
                        id="optionB"
                        placeholder="e.g., No"
                        value={formData.optionB}
                        onChange={(e) => handleInputChange("optionB", e.target.value)}
                        className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-[#eab308] focus:ring-[#eab308]/20"
                        required
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <Label htmlFor="category" className="text-gray-300">
                      Category *
                    </Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white focus:border-[#eab308] focus:ring-[#eab308]/20">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category.value} value={category.value.toString()} className="text-white hover:bg-gray-700">
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* End Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="endDate" className="text-gray-300">
                        End Date *
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="endDate"
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => handleInputChange("endDate", e.target.value)}
                          className="pl-10 bg-gray-800/50 border-gray-700 text-white focus:border-[#eab308] focus:ring-[#eab308]/20"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="endTime" className="text-gray-300">
                        End Time *
                      </Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => handleInputChange("endTime", e.target.value)}
                        className="bg-gray-800/50 border-gray-700 text-white focus:border-[#eab308] focus:ring-[#eab308]/20"
                        required
                      />
                    </div>
                  </div>

                  {/* Betting Limits */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minBet" className="text-gray-300">
                        Minimum Bet (PYUSD)
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="minBet"
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={formData.minBet}
                          onChange={(e) => handleInputChange("minBet", e.target.value)}
                          className="pl-10 bg-gray-800/50 border-gray-700 text-white focus:border-[#eab308] focus:ring-[#eab308]/20"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="maxBet" className="text-gray-300">
                        Maximum Bet (PYUSD)
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="maxBet"
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={formData.maxBet}
                          onChange={(e) => handleInputChange("maxBet", e.target.value)}
                          className="pl-10 bg-gray-800/50 border-gray-700 text-white focus:border-[#eab308] focus:ring-[#eab308]/20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex space-x-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      className="flex-1 bg-gray-800/30 border-gray-700 text-gray-300 hover:bg-gray-700/50 hover:text-white"
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-[#eab308] to-[#ca8a04] hover:from-[#ca8a04] hover:to-[#a16207] text-white shadow-lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Creating Market...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Plus className="h-4 w-4" />
                          <span>Create Market</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </OwnerOnly>
  );
}
