"use client";

import { useParams } from 'next/navigation';
import MarketDetailPage from '@/components/market/market-detail-page';

export default function Page() {
  const params = useParams();
  const marketId = params.id as string;
  
  return <MarketDetailPage key={marketId} />;
}
