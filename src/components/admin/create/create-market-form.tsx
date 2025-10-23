/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useChimeraProtocol } from "@/hooks/useChimeraProtocol";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Check, Upload, Loader2, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface CreateMarketFormProps {
  onSubmit?: (result: {
    success: boolean;
    transactionId?: string;
    marketId?: number;
    error?: string;
  }) => void;
  isLoading?: boolean;
}

type CategoryOption = { value: number; label: string; emoji: string; description: string };

const MARKET_CATEGORIES: CategoryOption[] = [
  { value: 0, label: "Sports",         emoji: "⚽", description: "Sports events, games, tournaments" },
  { value: 1, label: "Entertainment",  emoji: "🎬", description: "Movies, music, awards, celebrities" },
  { value: 2, label: "Technology",     emoji: "💻", description: "Product launches, tech developments" },
  { value: 3, label: "Economics",      emoji: "💰", description: "Market movements, economic indicators" },
  { value: 4, label: "Weather",        emoji: "🌤️", description: "Weather predictions, natural events" },
  { value: 5, label: "Crypto",         emoji: "🪙", description: "Cryptocurrency price predictions" },
  { value: 6, label: "Politics",       emoji: "🏳️", description: "Elections, policy decisions, government" },
  { value: 7, label: "Breaking News",  emoji: "📰", description: "Current events and breaking news" },
  { value: 8, label: "Other",          emoji: "❓", description: "Miscellaneous predictions" },
];

const uploadToCloudinary = async (file: File): Promise<string> => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary not configured. Please check environment variables.");
  }
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: formData });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || `Upload failed with status ${response.status}`);
  return data.secure_url as string;
};

export function CreateMarketForm({ onSubmit, isLoading: externalLoading = false }: CreateMarketFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { address, isConnected } = useAccount();
  const { createMarket, isPending, isConfirming, isConfirmed, hash } = useChimeraProtocol();

  const [formData, setFormData] = useState({
    question: "",
    optionA: "",
    optionB: "",
    category: -1,
    endDate: "",
    endTime: "",
    resolutionSource: "",
    rules: "",
    imageURI: "",
    minBet: "1",
    maxBet: "1000",
    marketType: 1, // 0 = PriceDirection, 1 = CustomEvent
    pythPriceId: "",
    targetPrice: "",
    priceAbove: true,
    isBreakingNews: false,
    isPublic: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      toast.error("Please select a PNG or JPEG image file only.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) {
      toast.error("Cloudinary not configured. Please check environment variables.");
      return;
    }
    try {
      setIsUploadingImage(true);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      const imageUrl = await uploadToCloudinary(file);
      setFormData((prev) => ({ ...prev, imageURI: imageUrl }));
      toast.success("Image uploaded successfully!");
    } catch (error: any) {
      toast.error(error?.message || "Failed to upload image. Please try again.");
      setImagePreview("");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();
  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, imageURI: "" }));
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.question.trim()) newErrors.question = "Question is required";
    if (formData.question.length < 10) newErrors.question = "Question must be at least 10 characters";
    if (formData.question.length > 500) newErrors.question = "Question must be less than 500 characters";
    if (!formData.optionA.trim()) newErrors.optionA = "Option A is required";
    if (!formData.optionB.trim()) newErrors.optionB = "Option B is required";
    if (formData.optionA === formData.optionB) newErrors.optionB = "Options must be different";
    if (formData.category === -1) newErrors.category = "Category is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.endDate) newErrors.endDate = "End date is required";
    if (!formData.endTime) newErrors.endTime = "End time is required";
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
    const now = new Date();
    const minEndTime = new Date(now.getTime() + 60 * 60 * 1000);
    if (endDateTime <= minEndTime) newErrors.endDate = "Market must end at least 1 hour from now";
    const durationHours = (endDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (durationHours > 720) newErrors.endDate = "Market duration cannot exceed 30 days";
    if (!formData.resolutionSource.trim()) newErrors.resolutionSource = "Resolution source is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    const minBet = parseFloat(formData.minBet);
    const maxBet = parseFloat(formData.maxBet);
    if (isNaN(minBet) || minBet < 0.01) newErrors.minBet = "Minimum bet must be at least 0.01 PYUSD";
    if (isNaN(maxBet) || maxBet < minBet) newErrors.maxBet = "Maximum bet must be greater than minimum bet";
    if (maxBet > 100000) newErrors.maxBet = "Maximum bet cannot exceed 100,000 PYUSD";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;
    switch (step) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
    }
    if (isValid) setStep(step + 1);
  };

  const handleBack = () => setStep(step - 1);

  const handleSubmit = async () => {
    if (!validateStep3()) return;
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      onSubmit?.({ success: false, error: "Wallet not connected" });
    } else {
      try {
        setIsSubmitting(true);
        const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
        
        await createMarket({
          title: formData.question.trim(),
          description: formData.rules.trim() || formData.question.trim(),
          optionA: formData.optionA.trim(),
          optionB: formData.optionB.trim(),
          category: formData.category,
          endTime: Math.floor(endDateTime.getTime() / 1000),
          minBet: formData.minBet,
          maxBet: formData.maxBet,
          imageUrl: formData.imageURI.trim(),
          marketType: formData.marketType,
          pythPriceId: formData.pythPriceId,
          targetPrice: formData.targetPrice,
          priceAbove: formData.priceAbove,
        });

        // Wait for confirmation
        if (hash) {
          toast.success("Market creation transaction submitted!");
          onSubmit?.({ success: true, transactionId: hash });
          router.push("/admin");
        }
      } catch (error: any) {
        toast.error(error?.message || "Failed to create market");
        onSubmit?.({ success: false, error: error?.message || "Failed to create market" });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const loading = isSubmitting || externalLoading || isPending || isConfirming;

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6 border-2 border-gray-700/50 rounded-xl bg-gradient-to-br from-[#0A0C14]/50 to-[#151923]/30 backdrop-blur-sm">
      <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/png,image/jpeg" className="hidden" />

      {!isConnected && (
        <Alert className="bg-yellow-500/10 border-yellow-500/30">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-yellow-400">Please connect your wallet to create markets.</AlertDescription>
        </Alert>
      )}

      {(!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) && (
        <Alert className="bg-orange-500/10 border-orange-500/30">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-orange-400">
            <div>
              <p className="font-medium">Cloudinary not configured</p>
              <p className="text-sm mt-1">Image upload will not work. Manual URL entry is still available. Check console for setup instructions.</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${stepNumber < step ? "bg-yellow-500 text-white" : stepNumber === step ? "bg-[#eab308] text-white" : "bg-gray-700 text-gray-400"}`}>
              {stepNumber < step ? <Check className="h-4 w-4" /> : stepNumber}
            </div>
            {stepNumber < 4 && <div className={`w-12 h-0.5 mx-2 ${stepNumber < step ? "bg-yellow-500" : "bg-gray-700"}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
          <CardHeader>
            <CardTitle className="text-white">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="question" className="text-gray-300">Market Question *</Label>
              <Input
                id="question"
                placeholder="Will Bitcoin reach $100,000 by end of 2025?"
                value={formData.question}
                onChange={(e) => setFormData((prev) => ({ ...prev, question: e.target.value }))}
                className={`bg[#0A0C14] border-gray-700 text-white placeholder:text-gray-500 focus:border-[#eab308] ${errors.question ? "border-red-500" : ""}`}
              />
              {errors.question && <p className="text-sm text-red-400">{errors.question}</p>}
              <p className="text-xs text-gray-400">{formData.question.length}/500 characters</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="optionA" className="text-gray-300">Option A *</Label>
                <Input
                  id="optionA"
                  placeholder="Yes"
                  value={formData.optionA}
                  onChange={(e) => setFormData((prev) => ({ ...prev, optionA: e.target.value }))}
                  className={`bg[#0A0C14] border-gray-700 text-white placeholder:text-gray-500 focus:border-[#eab308] ${errors.optionA ? "border-red-500" : ""}`}
                />
                {errors.optionA && <p className="text-sm text-red-400">{errors.optionA}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="optionB" className="text-gray-300">Option B *</Label>
                <Input
                  id="optionB"
                  placeholder="No"
                  value={formData.optionB}
                  onChange={(e) => setFormData((prev) => ({ ...prev, optionB: e.target.value }))}
                  className={`bg[#0A0C14] border-gray-700 text-white placeholder:text-gray-500 focus:border-[#eab308] ${errors.optionB ? "border-red-500" : ""}`}
                />
                {errors.optionB && <p className="text-sm text-red-400">{errors.optionB}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-gray-300">Category *</Label>
              <Select value={formData.category === -1 ? "" : formData.category.toString()} onValueChange={(value: string) => setFormData((prev) => ({ ...prev, category: parseInt(value) }))}>
                <SelectTrigger className={`bg[#0A0C14] border-gray-700 text-white focus:border-[#eab308] ${errors.category ? "border-red-500" : ""}`}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1F2C] border-gray-700">
                  {MARKET_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value.toString()} className="text-white hover:bg-[#0A0C14]">
                      <div className="flex items-center space-x-2">
                        <span>{category.emoji}</span>
                        <span>{category.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-red-400">{errors.category}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageURI" className="text-gray-300">Market Image (Optional)</Label>
              {formData.question.toLowerCase().includes('bitcoin') || formData.question.toLowerCase().includes('btc') ? (
                <div className="mb-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setFormData(prev => ({ ...prev, imageURI: '/bitcoin.png' }))}
                    className="text-xs border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                  >
                    Use Bitcoin Logo
                  </Button>
                </div>
              ) : null}
              {(imagePreview || formData.imageURI) && (
                <div className="relative">
                  <div className="relative w-full h-48 bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                    <Image src={imagePreview || formData.imageURI} alt="Market preview" className="w-full h-full object-cover" width={100} height={100} />
                    <Button type="button" variant="outline" size="sm" onClick={handleRemoveImage} className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 border-red-500 text-white">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              <div className="flex space-x-2">
                <Input
                  id="imageURI"
                  placeholder="https://example.com/image.jpg or click upload"
                  value={formData.imageURI}
                  onChange={(e) => setFormData((prev) => ({ ...prev, imageURI: e.target.value }))}
                  className="bg[#0A0C14] border-gray-700 text-white placeholder:text-gray-500 focus:border-[#eab308]"
                />
                <Button type="button" variant="outline" onClick={handleUploadClick} disabled={isUploadingImage} className="border-gray-700 text-gray-300 hover:bg-[#1A1F2C] hover:border-[#eab308] min-w-[120px]">
                  {isUploadingImage ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-400">
                <ImageIcon className="h-3 w-3" />
                <span>Supports PNG or JPEG up to 5MB. Images will be hosted on Cloudinary.</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isBreakingNews" className="text-gray-300">Breaking News</Label>
                <p className="text-xs text-gray-400">Mark this market as breaking news for higher visibility</p>
              </div>
              <Switch id="isBreakingNews" checked={formData.isBreakingNews} onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isBreakingNews: checked }))} />
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
          <CardHeader>
            <CardTitle className="text-white">Timeline & Resolution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-gray-300">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                  min={new Date().toISOString().split("T")[0]}
                  className={`bg[#0A0C14] border-gray-700 text-white focus:border-[#eab308] ${errors.endDate ? "border-red-500" : ""}`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime" className="text-gray-300">End Time *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
                  className={`bg[#0A0C14] border-gray-700 text-white focus:border-[#eab308] ${errors.endTime ? "border-red-500" : ""}`}
                />
              </div>
            </div>
            {(errors.endDate || errors.endTime) && <p className="text-sm text-red-400">{errors.endDate || errors.endTime}</p>}

            <div className="space-y-2">
              <Label htmlFor="resolutionSource" className="text-gray-300">Resolution Source *</Label>
              <Input
                id="resolutionSource"
                placeholder="CoinGecko, Reuters, Official Government Website, etc."
                value={formData.resolutionSource}
                onChange={(e) => setFormData((prev) => ({ ...prev, resolutionSource: e.target.value }))}
                className={`bg[#0A0C14] border-gray-700 text-white placeholder:text-gray-500 focus:border-[#eab308] ${errors.resolutionSource ? "border-red-500" : ""}`}
              />
              {errors.resolutionSource && <p className="text-sm text-red-400">{errors.resolutionSource}</p>}
              <p className="text-xs text-gray-400">Specify the authoritative source that will be used for resolution</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rules" className="text-gray-300">Resolution Rules*</Label>
              <Textarea
                id="rules"
                placeholder="Detailed rules for how this market will be resolved, including edge cases..."
                value={formData.rules}
                onChange={(e) => setFormData((prev) => ({ ...prev, rules: e.target.value }))}
                className="min-h-24 bg[#0A0C14] border-gray-700 text-white placeholder:text-gray-500 focus:border-[#eab308]"
              />
              <p className="text-xs text-gray-400">Clear resolution criteria help prevent disputes</p>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
          <CardHeader>
            <CardTitle className="text-white">Market Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minBet" className="text-gray-300">Minimum Bet (PYUSD) *</Label>
                <Input
                  id="minBet"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="1"
                  value={formData.minBet}
                  onChange={(e) => setFormData((prev) => ({ ...prev, minBet: e.target.value }))}
                  className={`bg[#0A0C14] border-gray-700 text-white placeholder:text-gray-500 focus:border-[#eab308] ${errors.minBet ? "border-red-500" : ""}`}
                />
                {errors.minBet && <p className="text-sm text-red-400">{errors.minBet}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxBet" className="text-gray-300">Maximum Bet (PYUSD) *</Label>
                <Input
                  id="maxBet"
                  type="number"
                  step="1"
                  min="1"
                  placeholder="1000"
                  value={formData.maxBet}
                  onChange={(e) => setFormData((prev) => ({ ...prev, maxBet: e.target.value }))}
                  className={`bg[#0A0C14] border-gray-700 text-white placeholder:text-gray-500 focus:border-[#eab308] ${errors.maxBet ? "border-red-500" : ""}`}
                />
                {errors.maxBet && <p className="text-sm text-red-400">{errors.maxBet}</p>}
              </div>
            </div>

            <div className="bg-[#0A0C14] p-4 rounded-lg border border-gray-800/50">
              <h4 className="font-medium mb-2 text-white">Contract Information</h4>
              <div className="text-sm text-gray-400 space-y-1">
                <p>• <strong className="text-gray-300">Network:</strong> Hedera Testnet</p>
                <p>• <strong className="text-gray-300">Your Address:</strong> {address || "-"}</p>
                <p>• <strong className="text-gray-300">Fees:</strong> TBD (testnet)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
          <CardHeader>
            <CardTitle className="text-white">Review & Confirm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-white">Market Question</h4>
                <p className="text-sm text-gray-400">{formData.question}</p>
              </div>
              <div>
                <h4 className="font-semibold text-white">Options</h4>
                <div className="flex space-x-2">
                  <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">{formData.optionA}</Badge>
                  <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">{formData.optionB}</Badge>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-white">Category</h4>
                <Badge variant="outline" className="bg-[#eab308]/20 text-[#eab308] border-[#eab308]/30">
                  {MARKET_CATEGORIES.find((cat) => cat.value === formData.category)?.label}
                </Badge>
              </div>
              {formData.imageURI && (
                <div>
                  <h4 className="font-semibold text-white">Market Image</h4>
                  <div className="w-32 h-20 bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                    <Image width={100} height={100} src={formData.imageURI} alt="Market image" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
              <div>
                <h4 className="font-semibold text-white">Trading Period</h4>
                <p className="text-sm text-gray-400">Ends {new Date(`${formData.endDate}T${formData.endTime}`).toLocaleString()}</p>
              </div>
              {formData.rules && (
                <div>
                  <h4 className="font-semibold text-white">Resolution Rules</h4>
                  <p className="text-sm text-gray-400">{formData.rules}</p>
                </div>
              )}
              <div>
                <h4 className="font-semibold text-white">Betting Limits</h4>
                <p className="text-sm text-gray-400">{formData.minBet} - {formData.maxBet} PYUSD</p>
              </div>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-400">Important Notice</p>
                  <p className="text-gray-400">Creating market on Hedera Testnet with ChimeraAI smart contract.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack} disabled={step === 1 || loading} className="border-gray-700 text-gray-300 hover:bg-[#1A1F2C] hover:text-white">Back</Button>
        <div className="space-x-2">
          {step < 4 ? (
            <Button onClick={handleNext} disabled={loading} className="bg-gradient-to-r from-[#eab308] to-[#ca8a04] hover:from-[#ca8a04] hover:to-[#a16207] text-white">Next</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading || !isConnected} className="bg-gradient-to-r from-[#eab308] to-[#ca8a04] hover:from-[#ca8a04] hover:to-[#a16207] text-white">
              {loading ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating Market...</>) : ("Create Market")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}


