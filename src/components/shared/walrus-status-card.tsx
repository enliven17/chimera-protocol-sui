'use client';

import { useState } from 'react';
import { useWalrusTest } from '@/hooks/useWalrusTest';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Database, Wifi, WifiOff } from 'lucide-react';

export function WalrusStatusCard() {
  const { testStatus, loading } = useWalrusTest();
  const [status, setStatus] = useState<any>(null);

  const checkStatus = async () => {
    const result = await testStatus();
    setStatus(result);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Walrus Durumu
        </CardTitle>
        <CardDescription>
          Walrus decentralized storage sistem durumu
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={checkStatus} 
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Kontrol Ediliyor...
              </>
            ) : (
              'Durumu Kontrol Et'
            )}
          </Button>

          {status && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">HTTP API:</span>
                <Badge variant={status.httpApiAvailable ? "default" : "secondary"}>
                  {status.httpApiAvailable ? (
                    <>
                      <Wifi className="mr-1 h-3 w-3" />
                      Online
                    </>
                  ) : (
                    <>
                      <WifiOff className="mr-1 h-3 w-3" />
                      Offline
                    </>
                  )}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Mod:</span>
                <Badge variant={status.mockMode ? "secondary" : "default"}>
                  {status.mockMode ? "Mock Mode" : "Live Mode"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Durum:</span>
                <Badge variant={status.status === 'online' ? "default" : "secondary"}>
                  {status.status === 'online' ? (
                    <>
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Çalışıyor
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-1 h-3 w-3" />
                      Mock Mode
                    </>
                  )}
                </Badge>
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p>• HTTP API offline olduğunda otomatik olarak mock mode'a geçer</p>
            <p>• Mock mode'da veriler geçici olarak saklanır</p>
            <p>• Walrus CLI ile doğrudan erişim mümkündür</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}







