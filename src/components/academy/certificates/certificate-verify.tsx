'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store/app-store';
import type { Certificate } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Award,
  Search,
  Shield,
  CheckCircle2,
  XCircle,
  User,
  BookOpen,
  CalendarDays,
  FileText,
  ArrowLeft,
  QrCode,
} from 'lucide-react';
import { toast } from 'sonner';

export function CertificateVerify() {
  const { verifyCredential, navigate, selectedCredentialId } = useAppStore();
  const [credentialId, setCredentialId] = useState(selectedCredentialId ?? '');
  const [result, setResult] = useState<Certificate | null | 'not_found'>(null);
  const [searching, setSearching] = useState(false);

  const handleVerify = async () => {
    if (!credentialId.trim()) {
      toast.error('Please enter a certificate ID.');
      return;
    }
    setSearching(true);
    const found = await verifyCredential(credentialId.trim());
    setResult(found ?? 'not_found');
    setSearching(false);
    if (found) {
      toast.success('Certificate verified successfully!');
    } else {
      toast.error('Invalid certificate.');
    }
  };

  const isValid = result && result !== 'not_found';

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('certificates')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Certificate Verification
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Verify the authenticity of a Marokand Humo Academy certificate
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label htmlFor="credential-input" className="text-sm font-medium">
                Certificate ID
              </label>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="credential-input"
                  placeholder="Enter certificate ID (e.g., MHA-XXXXXXXX)"
                  value={credentialId}
                  onChange={(e) => setCredentialId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                  className="pl-9"
                />
              </div>
              <Button onClick={handleVerify} disabled={searching} className="gap-1.5">
                <Shield className="h-4 w-4" /> Verify
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              The certificate ID can be found on the certificate or shared by the certificate holder.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Result */}
      {result && (
        <Card className={`border-2 ${isValid ? 'border-emerald-500/30' : 'border-red-500/30'}`}>
          <CardContent className="p-6">
            {isValid ? (
              <div className="space-y-6">
                {/* Valid Header */}
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-emerald-500">Valid</h3>
                    <p className="text-sm text-muted-foreground">
                      This credential has been verified as authentic.
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <User className="h-3 w-3" /> Student name
                    </div>
                    <p className="text-sm font-medium">{result.userName}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <BookOpen className="h-3 w-3" /> Course
                    </div>
                    <p className="text-sm font-medium">{result.courseName}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDays className="h-3 w-3" /> Issued date
                    </div>
                    <p className="text-sm font-medium">{new Date(result.issuedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Award className="h-3 w-3" /> Score
                    </div>
                    <p className="text-sm font-medium">{result.score}%</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <FileText className="h-3 w-3" /> Certificate ID
                    </div>
                    <p className="text-sm font-mono">{result.credentialId}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Shield className="h-3 w-3" /> Status
                    </div>
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
                    </Badge>
                  </div>
                </div>

                {/* QR Code Placeholder */}
                <div className="flex items-center justify-center p-6">
                  <div className="h-32 w-32 border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center gap-2">
                    <QrCode className="h-10 w-10 text-muted-foreground/50" />
                    <span className="text-xs text-muted-foreground">QR Code</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-500">Invalid certificate</h3>
                  <p className="text-sm text-muted-foreground">
                    No approved certificate matches this certificate ID. Please check the ID and try again.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No result yet */}
      {!result && (
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <div className="h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center">
            <Award className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm text-center">
            Enter a certificate ID to verify a certificate&apos;s authenticity.
          </p>
        </div>
      )}
    </div>
  );
}
