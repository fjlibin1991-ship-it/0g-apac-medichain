'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function HomePage() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">M</span>
            </div>
            <span className="text-2xl font-bold text-primary-700">MediChain</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/consultation" className="text-gray-600 hover:text-primary-600 transition">
              Consultation
            </Link>
            <Link href="/health-records" className="text-gray-600 hover:text-primary-600 transition">
              Health Records
            </Link>
            <Link href="/researcher" className="text-gray-600 hover:text-primary-600 transition">
              Researcher Dashboard
            </Link>
          </nav>

          <div>
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                <Button variant="outline" onClick={() => disconnect()}>
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => connect({ connector: connectors[0] })}
                disabled={isConnecting}
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-secondary-100 text-secondary-700 text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-secondary-500 rounded-full mr-2 animate-pulse"></span>
            0G APAC Hackathon - Social Impact Track
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Privacy-First AI<br />
            <span className="text-primary-600">Health Advisor</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Empowering community health workers in underserved regions with 
            AI-powered symptom analysis, encrypted patient records, and 
            anonymous epidemiology tracking.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/consultation">
              <Button size="lg" className="text-lg px-8">
                Start Consultation
              </Button>
            </Link>
            <Link href="/health-records">
              <Button variant="outline" size="lg" className="text-lg px-8">
                Access Health Records
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Symptom Analysis</h3>
              <p className="text-gray-600">
                Community health workers use AI-powered questionnaires to assess 
                symptoms and generate health advisories based on clinical patterns.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition">
              <div className="w-14 h-14 bg-secondary-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Encrypted Health Records</h3>
              <p className="text-gray-600">
                Patient health records are encrypted with AES-256-GCM. 
                Patients hold their own decryption keys - your data, your control.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition">
              <div className="w-14 h-14 bg-accent-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Anonymous Epidemiology</h3>
              <p className="text-gray-600">
                Aggregated, anonymized health data feeds public health insights 
                without exposing individual patients. Research for good.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-8">Built on 0G Infrastructure</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-4 border rounded-lg">
              <div className="font-semibold text-primary-600">0G Storage</div>
              <div className="text-sm text-gray-500">Encrypted KV + Log</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="font-semibold text-secondary-600">0G Compute</div>
              <div className="text-sm text-gray-500">AI Inference</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="font-semibold text-accent-600">0G Agent ID</div>
              <div className="text-sm text-gray-500">Health Worker Credentials</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="font-semibold text-gray-700">Solidity</div>
              <div className="text-sm text-gray-500">Smart Contracts</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t bg-gray-50">
        <div className="container mx-auto max-w-6xl text-center text-gray-500 text-sm">
          <p>MediChain - 0G APAC Hackathon 2025 | Social Impact Track</p>
          <p className="mt-2">Privacy-First AI Health Advisor for Underserved Regions</p>
        </div>
      </footer>
    </div>
  );
}

export default function Page() {
  return <HomePage />;
}
