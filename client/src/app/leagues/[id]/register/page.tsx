'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { 
  ArrowLeft, Trophy, Calendar, MapPin, Users, DollarSign, 
  CreditCard, CheckCircle, AlertCircle, Clock, Shield, Lock
} from 'lucide-react';

const sportEmojis: Record<string, string> = {
  golf: '⛳',
  pickleball: '🏓',
  bowling: '🎳',
  softball: '🥎',
  tennis: '🎾',
  soccer: '⚽',
  default: '🏆'
};

export default function LeagueRegisterPage() {
  const params = useParams();
  const router = useRouter();
  const leagueId = params.id as string;
  const { user, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [paymentOption, setPaymentOption] = useState<'full' | 'installment'>('full');

  const league = {
    id: leagueId,
    name: 'Monday Night Golf League',
    sport: 'golf',
    venue: 'Desert Ridge Golf Club',
    address: 'Phoenix, AZ',
    dayOfWeek: 'Mondays',
    time: '5:30 PM',
    startDate: 'Feb 3, 2025',
    endDate: 'Apr 21, 2025',
    price: 450,
    earlyBirdPrice: 400,
    isEarlyBird: true,
    registered: 28,
    capacity: 32,
    spotsLeft: 4,
    seasonWeeks: 12,
    whatsIncluded: [
      '12 weeks of competitive play',
      'GHIN handicap integration',
      'Flight-based competition',
      'Weekly prizes',
      'End-of-season championship',
      'Online scoring & leaderboards'
    ]
  };

  const currentPrice = league.isEarlyBird ? league.earlyBirdPrice : league.price;
  const installmentPrice = Math.ceil(currentPrice / 3);

  const handleRegister = async () => {
    if (!user) {
      router.push(`/login?redirect=/leagues/${leagueId}/register`);
      return;
    }

    if (!agreedToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          league_id: parseInt(leagueId),
          payment_type: paymentOption,
          success_url: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/payment/cancel?league_id=${leagueId}`
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to create checkout session');
      }

      const { checkout_url } = await response.json();
      window.location.href = checkout_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -my-8 bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            href={`/leagues/${leagueId}`} 
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to League
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center text-3xl">
              {sportEmojis[league.sport] || sportEmojis.default}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Register for League</h1>
              <p className="text-gray-500">{league.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {!user && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-900">Sign in required</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    You need to be signed in to register for this league.
                  </p>
                  <Link 
                    href={`/login?redirect=/leagues/${leagueId}/register`}
                    className="inline-block mt-2 text-sm font-medium text-amber-800 underline"
                  >
                    Sign in now
                  </Link>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">League Details</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{league.venue}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{league.dayOfWeek} at {league.time}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{league.startDate} - {league.endDate}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{league.spotsLeft} spots remaining</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">What's Included</h2>
              <ul className="space-y-2">
                {league.whatsIncluded.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Payment Options</h2>
              <div className="space-y-3">
                <label 
                  className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    paymentOption === 'full' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="full"
                      checked={paymentOption === 'full'}
                      onChange={() => setPaymentOption('full')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <span className="font-medium text-gray-900">Pay in Full</span>
                      <p className="text-sm text-gray-500">One-time payment</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900">${currentPrice}</span>
                </label>

                <label 
                  className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    paymentOption === 'installment' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="installment"
                      checked={paymentOption === 'installment'}
                      onChange={() => setPaymentOption('installment')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <span className="font-medium text-gray-900">3 Monthly Payments</span>
                      <p className="text-sm text-gray-500">Split into 3 installments</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900">${installmentPrice}/mo</span>
                </label>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 mt-1 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-600">
                  I agree to the <Link href="#" className="text-blue-600 underline">Terms and Conditions</Link>, 
                  including the <Link href="#" className="text-blue-600 underline">Cancellation Policy</Link> and 
                  <Link href="#" className="text-blue-600 underline"> Waiver of Liability</Link>.
                </span>
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-700">{error}</span>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
              <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 text-sm border-b border-gray-200 pb-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">{league.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{league.seasonWeeks} weeks</span>
                </div>
                {league.isEarlyBird && (
                  <div className="flex justify-between text-green-600">
                    <span>Early Bird Discount</span>
                    <span>-${league.price - league.earlyBirdPrice}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between font-bold text-lg mb-6">
                <span>Total</span>
                <span>${currentPrice}</span>
              </div>

              <button
                onClick={handleRegister}
                disabled={loading || !user}
                className="w-full py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Proceed to Payment
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
                <Lock className="w-3 h-3" />
                Secured by Stripe
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-start gap-2 text-xs text-gray-500">
                  <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    Your payment is secure and protected. Cancel for a full refund up to 14 days before the season starts.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
