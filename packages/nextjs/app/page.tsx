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

const LandingPage: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  // Initialize contract event listeners
  useContractEvents();

  return (
    <>
      {/* Hero Section with Splash Screen */}
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          {/* Logo/Brand */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full mb-6">
              <SparklesIcon className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white mb-4 tracking-tight">
              TOMO
            </h1>
            <p className="text-2xl md:text-3xl font-bold text-purple-200 mb-8">
              Make your payment split - in tomo way
            </p>
          </div>

          {/* Tagline */}
          <p className="text-lg md:text-xl text-purple-100 mb-12 max-w-2xl mx-auto leading-relaxed">
            Experience seamless payment splitting on the Monad blockchain. 
            Split bills, share expenses, and manage group payments with ease.
          </p>

          {/* Connect Wallet Section */}
          <div className="mb-12">
            {!connectedAddress ? (
              <div className="space-y-4">
                <p className="text-purple-200 font-medium">Connect your wallet to get started</p>
                <div className="flex justify-center">
                  <RainbowKitCustomConnectButton />
                </div>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
                <p className="text-purple-200 font-medium mb-2">Connected Wallet:</p>
                <Address address={connectedAddress} />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {connectedAddress && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/buyer"
                className="group bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center gap-3"
              >
                <ShoppingCartIcon className="h-6 w-6" />
                Start Splitting
                <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                href="/profile"
                className="group bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 border-2 border-white/20 hover:border-white/40 flex items-center gap-3"
              >
                <BellIcon className="h-6 w-6" />
                View Notifications
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-b from-indigo-900 to-purple-900 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Why Choose TOMO?
            </h2>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto">
              Experience the future of payment splitting with blockchain technology
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-white/20 transition-all duration-300">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <WalletIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Secure Payments</h3>
              <p className="text-purple-200 leading-relaxed">
                All transactions are secured by blockchain technology on the Monad network
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-white/20 transition-all duration-300">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserGroupIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Group Splitting</h3>
              <p className="text-purple-200 leading-relaxed">
                Create groups, add friends, and split bills automatically with smart contracts
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-white/20 transition-all duration-300">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <CreditCardIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Instant Notifications</h3>
              <p className="text-purple-200 leading-relaxed">
                Get real-time notifications when someone creates a split or sends you money
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="bg-gradient-to-b from-purple-900 to-indigo-900 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-white mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-purple-200">Choose your action below</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Link
              href="/buyer"
              className="group bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-2xl p-8 text-center transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              <ShoppingCartIcon className="h-12 w-12 text-white mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">Pay & Split</h3>
              <p className="text-purple-100 mb-6">
                Send payments and create split groups with your friends
              </p>
              <div className="inline-flex items-center gap-2 text-white font-semibold">
                Get Started
                <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/profile"
              className="group bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-2xl p-8 text-center transition-all duration-300 border-2 border-white/20 hover:border-white/40"
            >
              <BellIcon className="h-12 w-12 text-white mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">Profile & Notifications</h3>
              <p className="text-purple-100 mb-6">
                View your profile, manage notifications, and handle pending payments
              </p>
              <div className="inline-flex items-center gap-2 text-white font-semibold">
                View Profile
                <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
