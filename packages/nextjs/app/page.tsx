"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { 
  ShoppingCartIcon, 
  UserIcon, 
  BellIcon, 
  WalletIcon, 
  CreditCardIcon,
  UserGroupIcon,
  SparklesIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { useContractEvents } from "~~/hooks/useContractEvents";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useState, useEffect } from "react";

const LandingPage: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [showSplash, setShowSplash] = useState(true);
  const [splashText, setSplashText] = useState("");
  const [splashOpacity, setSplashOpacity] = useState(0);

  // Initialize contract event listeners
  useContractEvents();

  useEffect(() => {
    // Splash screen animation sequence
    const timer1 = setTimeout(() => setSplashOpacity(1), 100);
    const timer2 = setTimeout(() => setSplashText("T"), 300);
    const timer3 = setTimeout(() => setSplashText("TO"), 600);
    const timer4 = setTimeout(() => setSplashText("TOM"), 900);
    const timer5 = setTimeout(() => setSplashText("TOMO"), 1200);
    const timer6 = setTimeout(() => setSplashOpacity(0), 2500);
    const timer7 = setTimeout(() => setShowSplash(false), 2800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearTimeout(timer6);
      clearTimeout(timer7);
    };
  }, []);

  if (showSplash) {
    return (
      <div 
        className="fixed inset-0 bg-gradient-to-br from-violet-800 via-purple-700 to-indigo-800 flex items-center justify-center z-50 transition-opacity duration-700"
        style={{ opacity: splashOpacity }}
      >
        <div className="text-center animate-fade-in">
          <div className="relative">
            {/* Animated logo background */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full w-32 h-32 mx-auto blur-xl opacity-50 animate-pulse"></div>
            
            {/* Main logo */}
            <div className="relative z-10">
              <div className="w-32 h-32 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-logo-pulse overflow-hidden">
                <img 
                  src="/logo.jpg" 
                  alt="TOMO Logo" 
                  className="h-20 w-20 object-cover rounded-full"
                />
              </div>
            </div>
          </div>
          
          {/* Animated text */}
          <h1 className="text-6xl md:text-8xl font-black text-white mb-4 tracking-tight transition-all duration-300 animate-text-reveal">
            {splashText}
          </h1>
          
          {/* Loading dots */}
          <div className="flex justify-center space-x-1 mt-4 animate-slide-up">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce-delayed" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce-delayed" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce-delayed" style={{ animationDelay: '300ms' }}></div>
          </div>
          
          {/* Tagline */}
          <p className="text-xl font-medium text-violet-200 mt-6 opacity-0 animate-pulse" style={{ animationDelay: '1500ms' }}>
            Make your payment split - in tomo way
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section with Splash Screen */}
      <div className="min-h-screen bg-gradient-to-br from-violet-800 via-purple-700 to-indigo-800 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-500 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob" style={{ animationDelay: '4s' }}></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          {/* Logo/Brand */}
          <div className="mb-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full w-24 h-24 blur-xl opacity-50 animate-pulse"></div>
              <div className="relative w-24 h-24 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl overflow-hidden">
                <img 
                  src="/logo.jpg" 
                  alt="TOMO Logo" 
                  className="h-16 w-16 object-cover rounded-full"
                />
              </div>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white mb-4 tracking-tight">TOMO</h1>
            <p className="text-2xl md:text-3xl font-bold text-violet-200 mb-8">Make your payment split - in tomo way</p>
          </div>

          {/* Tagline */}
          <p className="text-lg md:text-xl text-violet-100 mb-12 max-w-2xl mx-auto leading-relaxed">
            Experience seamless payment splitting on the Monad blockchain. 
            Split bills, share expenses, and manage group payments with ease.
          </p>

          {/* Connect Wallet Section */}
          <div className="mb-12">
            {!connectedAddress ? (
              <div className="space-y-4">
                <p className="text-violet-200 font-medium">Connect your wallet to get started</p>
                <div className="flex justify-center">
                  <RainbowKitCustomConnectButton />
                </div>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
                <p className="text-violet-200 font-medium mb-2">Connected Wallet:</p>
                <Address address={connectedAddress} />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {connectedAddress && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/buyer" 
                className="group bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-full flex items-center gap-3 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg"
              >
                <ShoppingCartIcon className="h-6 w-6" />
                Start Splitting
                <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <Link 
                href="/profile" 
                className="group bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-bold py-4 px-8 rounded-full flex items-center gap-3 transition-all duration-300 transform hover:scale-105 border border-white/20 hover:border-white/40"
              >
                <BellIcon className="h-6 w-6" />
                View Notifications
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-b from-indigo-800 to-purple-800 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Why Choose TOMO?
            </h2>
            <p className="text-xl text-violet-200 max-w-3xl mx-auto">
              Experience the future of payment splitting with blockchain technology
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-white/20 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <WalletIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Secure Payments</h3>
              <p className="text-violet-200 leading-relaxed">
                All transactions are secured by blockchain technology on the Monad network
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-white/20 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserGroupIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Group Splitting</h3>
              <p className="text-violet-200 leading-relaxed">
                Create groups, add friends, and split bills automatically with smart contracts
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-white/20 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <BellIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Instant Notifications</h3>
              <p className="text-violet-200 leading-relaxed">
                Get real-time notifications when someone creates a split or sends you money
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="bg-gradient-to-b from-purple-800 to-indigo-800 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-8">Ready to Get Started?</h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link 
              href="/buyer" 
              className="group bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-full flex items-center gap-3 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              Pay & Split
              <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <Link 
              href="/profile" 
              className="group bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-bold py-4 px-8 rounded-full flex items-center gap-3 transition-all duration-300 transform hover:scale-105 border border-white/20 hover:border-white/40"
            >
              <UserIcon className="h-6 w-6" />
              View Profile
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
