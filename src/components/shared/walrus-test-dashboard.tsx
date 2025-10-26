'use client';

import { useState } from 'react';
import { useWalrusTest } from '@/hooks/useWalrusTest';
import { WalrusStatusCard } from '@/components/shared/walrus-status-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, Download, CheckCircle, XCircle } from 'lucide-react';

export function WalrusTestDashboard() {
  const { loading, result, testStore, testRetrieve, testExists, clearResult } = useWalrusTest();
  const [testData, setTestData] = useState({
    message: 'Merhaba! Bu Chimera Protocol Sui projesi için Walrus test mesajıdır.',
    user: 'test-user-001'
  });
  const [blobId, setBlobId] = useState('');
  const [exists, setExists] = useState<boolean | null>(null);

  const handleStore = async () => {
    const data = {
      type: 'test_data',
      timestamp: new Date().toISOString(),
      content: testData.message,
      user: testData.user,
      metadata: {
        version: '1.0',
        platform: 'Chimera Protocol Sui',
        testId: Math.random().toString(36).substring(7)
      }
    };

    await testStore(data);
  };

  const handleRetrieve = async () => {
    if (blobId) {
      await testRetrieve(blobId);
    }
  };

  const handleCheckExists = async () => {
    if (blobId) {
      const result = await testExists(blobId);
      setExists(result);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">🐋 Walrus Test Dashboard</h2>
        <p className="text-muted-foreground">
          Chimera Protocol Sui projesi için Walrus decentralized storage test paneli
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <WalrusStatusCard />
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Veri Saklama Testi
            </CardTitle>
            <CardDescription>
              Walrus'a test verisi saklayın
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Kullanıcı</label>
              <Input
                value={testData.user}
                onChange={(e) => setTestData({ ...testData, user: e.target.value })}
                placeholder="Kullanıcı adı"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Mesaj</label>
              <Textarea
                value={testData.message}
                onChange={(e) => setTestData({ ...testData, message: e.target.value })}
                placeholder="Test mesajı"
                rows={3}
              />
            </div>
            <Button 
              onClick={handleStore} 
              disabled={loading || !testData.message}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saklanıyor...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Walrus'a Sakla
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Veri Alma Testi
          </CardTitle>
          <CardDescription>
            Walrus'tan blob ID ile veri alın
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Blob ID</label>
            <Input
              value={blobId}
              onChange={(e) => setBlobId(e.target.value)}
              placeholder="Blob ID girin"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleRetrieve} 
              disabled={loading || !blobId}
              variant="outline"
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Alınıyor...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Veri Al
                </>
              )}
            </Button>
            <Button 
              onClick={handleCheckExists} 
              disabled={loading || !blobId}
              variant="outline"
            >
              Varlığını Kontrol Et
            </Button>
          </div>
          
          {exists !== null && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Blob Varlığı:</span>
              <Badge variant={exists ? "default" : "secondary"}>
                {exists ? (
                  <>
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Mevcut
                  </>
                ) : (
                  <>
                    <XCircle className="mr-1 h-3 w-3" />
                    Bulunamadı
                  </>
                )}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Test Sonucu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={result.success ? "default" : "destructive"}>
                  {result.success ? "Başarılı" : "Hatalı"}
                </Badge>
              </div>

              {result.blobId && (
                <div>
                  <label className="text-sm font-medium">Blob ID:</label>
                  <div className="mt-1 p-2 bg-muted rounded-md font-mono text-sm break-all">
                    {result.blobId}
                  </div>
                </div>
              )}

              {result.error && (
                <div>
                  <label className="text-sm font-medium text-red-500">Hata:</label>
                  <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded-md text-sm">
                    {result.error}
                  </div>
                </div>
              )}

              {result.data && (
                <div>
                  <label className="text-sm font-medium">Alınan Veri:</label>
                  <pre className="mt-1 p-3 bg-muted rounded-md text-sm overflow-auto max-h-60">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}

              {(result.size || result.cost) && (
                <div className="grid gap-2 md:grid-cols-2">
                  {result.size && (
                    <div>
                      <label className="text-sm font-medium">Boyut:</label>
                      <div className="text-sm text-muted-foreground">{result.size} bytes</div>
                    </div>
                  )}
                  {result.cost && (
                    <div>
                      <label className="text-sm font-medium">Maliyet:</label>
                      <div className="text-sm text-muted-foreground">{result.cost} units</div>
                    </div>
                  )}
                </div>
              )}

              <Button onClick={clearResult} variant="outline" size="sm">
                Sonucu Temizle
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}







