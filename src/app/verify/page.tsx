'use client';

import { CertificateVerify } from '@/components/academy/certificates/certificate-verify';
import { Footer } from '@/components/academy/shared/footer';
import { Header } from '@/components/academy/shared/header';

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <CertificateVerify />
      </main>
      <Footer />
    </div>
  );
}
