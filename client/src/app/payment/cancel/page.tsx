'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  AlertTriangle, Clock, CreditCard, ArrowRight, 
  Loader2, AlertCircle, RefreshCw, BookmarkPlus,
  Users, Calendar, MapPin, Flame
} from 'lucide-react';
import { api } from '@/lib/api';

interface SessionDetails {
  session_id: string;
  payment_status: string;
  session_status?: string;
  status: string;
  is_expired?: boolean;
  amount_total: number | null;
  currency: string | null;
  customer_email: string | null;
  payment_intent: string | null;
  created_at: number | null;
  expires_at?: number | null;
  league?: {
    id: number;
    name: string;
    description: string | null;
    registration_fee: number | null;
    sport_id: number | null;
  };
  season?: {
    id: number;
    name: string;
    start_date: string | null;
    end_date: string | null;
  };
  venue?: {
    id: number;
    name: string;
    address: string | null;
    city: string | null;
    state: string | null;
    zip_code: string | null;
  };
  user?: {
    id: number;
    email: string;
    full_name: string | null;
  };
}

function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  
  const [session, setSession] = useState<SessionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(15 * 60);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (sessionId) {
      fetchSessionDetails();
    } else {
      setError('No session ID provided');
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (timeRemaining <= 0) return;
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const fetchSessionDetails = async () => {
    try {
      const data = await api.get<SessionDetails>(`/payments/session/${sessionId}`);
      setSession(data);
      
      if (data.expires_at) {
        const now = Math.floor(Date.now() / 1000);
        const remaining = Math.max(0, data.expires_at - now);
        setTimeRemaining(remaining);
      } else if (data.created_at) {
        const elapsed = Math.floor(Date.now() / 1000) - data.created_at;
        const remaining = Math.max(0, 30 * 60 - elapsed);
        setTimeRemaining(remaining);
      }
    } catch (err) {
      setError('Failed to load session details.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'TBD';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatCurrency = (amount: number | null, currency: string | null) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency?.toUpperCase() || 'USD',
    }).format(amount / 100);
  };

  const handleRetryPayment = async () => {
    if (!session?.season?.id) {
      setError('Session information is missing. Please go back to the league page and try again.');
      return;
    }
    
    setRetrying(true);
    try {
      const baseUrl = window.location.origin;
      const response = await api.post<{ checkout_url: string }>('/payments/checkout', {
        season_id: session.season.id,
        success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/payment/cancel?session_id={CHECKOUT_SESSION_ID}`
      });
      window.location.href = response.checkout_url;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to restart checkout. Please try again.';
      setError(errorMessage);
      setRetrying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-4" />
        <p className="text-gray-400">Loading session details...</p>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Session Expired</h2>
        <p className="text-gray-400 mb-6">{error}</p>
        <Link href="/leagues" className="text-emerald-500 hover:text-emerald-400">
          Browse Leagues
        </Link>
      </div>
    );
  }

  if (session?.is_expired) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-red-500/30">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-white mb-3">Session Expired</h1>
          <p className="text-gray-400 mb-6">
            This checkout session has expired. Your spot reservation has ended, but you can still register 
            if spots are available.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              href={session.league?.id ? `/leagues/${session.league.id}` : '/leagues'}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
            >
              Go to League Page
            </Link>
            <Link 
              href="/leagues"
              className="px-6 py-3 bg-[#2a2a2a] hover:bg-[#333] text-gray-300 rounded-lg transition-colors"
            >
              Browse Other Leagues
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const spotsRemaining = 4;
  const totalSpots = 32;
  const spotsFilledPercent = ((totalSpots - spotsRemaining) / totalSpots) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="bg-[#1a1a1a] rounded-2xl p-8 text-center border border-amber-500/30">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-500/20 rounded-full mb-6">
          <AlertTriangle className="w-12 h-12 text-amber-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Payment Not Completed</h1>
        <p className="text-xl text-gray-300 mb-4">
          Your registration for {session?.league?.name} was not completed
        </p>
        <p className="text-gray-400">
          Don't worry - your spot is still available for a limited time
        </p>
      </div>

      <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a]">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500" />
          What Happened?
        </h2>
        <p className="text-gray-400 text-sm mb-4">
          Your payment was not processed. This could be because:
        </p>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-gray-600">•</span>
            You clicked "Back" or "Cancel" during checkout
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600">•</span>
            Your card was declined
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600">•</span>
            The payment session timed out
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600">•</span>
            There was a temporary connection issue
          </li>
        </ul>
        <p className="mt-4 text-sm text-amber-400/80">
          Your registration is not complete and you are not yet enrolled in the league.
        </p>
      </div>

      <div className="bg-gradient-to-r from-emerald-900/30 to-emerald-800/20 rounded-xl p-6 border border-emerald-500/30">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-emerald-500" />
          Try Again
        </h2>
        
        {timeRemaining > 0 ? (
          <>
            <p className="text-gray-300 text-sm mb-4">
              Your spot is held temporarily. Complete your registration now to secure your place.
            </p>
            <div className="flex items-center gap-3 mb-6 p-4 bg-[#0d0d0d]/50 rounded-lg">
              <Clock className="w-6 h-6 text-amber-500" />
              <div>
                <p className="text-gray-400 text-sm">Time remaining</p>
                <p className="text-2xl font-mono font-bold text-white">{formatTime(timeRemaining)}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="mb-6 p-4 bg-red-900/20 rounded-lg border border-red-500/30">
            <p className="text-red-400 text-sm">
              Your spot hold has expired. You can still try to complete your registration, but availability is not guaranteed.
            </p>
          </div>
        )}
        
        <button
          onClick={handleRetryPayment}
          disabled={retrying}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-lg transition-colors"
        >
          {retrying ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Complete Registration Now - {formatCurrency(session?.amount_total || (session?.league?.registration_fee ? session.league.registration_fee * 100 : 0), session?.currency || null)}
            </>
          )}
        </button>
      </div>

      <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a]">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-emerald-500" />
          Alternative Options
        </h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center text-gray-400 font-semibold text-sm">
              1
            </div>
            <div>
              <h3 className="text-white font-medium">Use a Different Payment Method</h3>
              <p className="text-gray-400 text-sm">
                If your card was declined, try a different credit/debit card, check with your bank, or ensure you have sufficient funds.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center text-gray-400 font-semibold text-sm">
              2
            </div>
            <div>
              <h3 className="text-white font-medium">Contact Your Bank</h3>
              <p className="text-gray-400 text-sm">
                Some banks block online payments for security. Call your bank to authorize the transaction.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center text-gray-400 font-semibold text-sm">
              3
            </div>
            <div>
              <h3 className="text-white font-medium">Save for Later</h3>
              <p className="text-gray-400 text-sm mb-3">
                Not ready to complete now? We'll save your information and send you a reminder.
              </p>
              <button 
                disabled
                title="Coming soon"
                className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] rounded-lg text-sm text-gray-500 cursor-not-allowed"
              >
                <BookmarkPlus className="w-4 h-4" />
                Save & Finish Later
              </button>
              <p className="text-xs text-gray-500 mt-1">Coming soon</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a]">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-500" />
          Your Registration Details
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">League</span>
            <span className="text-white font-medium">{session?.league?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Venue</span>
            <span className="text-white">{session?.venue?.name || 'TBD'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Start Date</span>
            <span className="text-white">{formatDate(session?.season?.start_date || null)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Amount</span>
            <span className="text-white font-semibold">
              {formatCurrency(session?.amount_total || (session?.league?.registration_fee ? session.league.registration_fee * 100 : 0), session?.currency || null)}
            </span>
          </div>
          {session?.user?.full_name && (
            <div className="flex justify-between">
              <span className="text-gray-400">Name</span>
              <span className="text-white">{session.user.full_name}</span>
            </div>
          )}
          {session?.user?.email && (
            <div className="flex justify-between">
              <span className="text-gray-400">Email</span>
              <span className="text-white">{session.user.email}</span>
            </div>
          )}
        </div>
        <p className="mt-4 text-sm text-emerald-400/80">
          All your information is saved - just complete payment!
        </p>
      </div>

      <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/20 rounded-xl p-6 border border-amber-500/30">
        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-500" />
          Spots Filling Fast
        </h2>
        <p className="text-gray-300 text-sm mb-4">
          Only {spotsRemaining} spots remaining in this league!
        </p>
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">{totalSpots - spotsRemaining}/{totalSpots} players registered</span>
            <span className="text-amber-500">{Math.round(spotsFilledPercent)}%</span>
          </div>
          <div className="w-full bg-[#2a2a2a] rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-amber-500 to-orange-500 h-3 rounded-full transition-all"
              style={{ width: `${spotsFilledPercent}%` }}
            />
          </div>
        </div>
        <p className="text-sm text-amber-400">
          Don't miss out - complete your registration now.
        </p>
      </div>

      <div className="bg-emerald-600 rounded-xl p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Ready to Complete?</h2>
          <p className="text-emerald-100 mb-4">Secure your spot in {session?.league?.name} now</p>
          <button
            onClick={handleRetryPayment}
            disabled={retrying}
            className="inline-flex items-center gap-2 px-8 py-3 bg-white hover:bg-gray-100 disabled:bg-gray-200 disabled:cursor-not-allowed text-emerald-600 font-semibold rounded-lg transition-colors"
          >
            {retrying ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Complete My Registration
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link 
          href={`/leagues/${session?.league?.id}`}
          className="flex items-center justify-between p-4 bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] rounded-lg transition-colors group"
        >
          <span className="text-gray-300">View League Details</span>
          <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-emerald-500 transition-colors" />
        </Link>
        <Link 
          href="/leagues"
          className="flex items-center justify-between p-4 bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] rounded-lg transition-colors group"
        >
          <span className="text-gray-300">Browse Other Leagues</span>
          <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-emerald-500 transition-colors" />
        </Link>
      </div>

      <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a] text-center">
        <h2 className="text-lg font-semibold text-white mb-2">Need Help?</h2>
        <p className="text-gray-400 text-sm mb-4">Having trouble completing your payment?</p>
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <span className="text-gray-300">
            <span className="text-gray-500">Email:</span> support@theleague.com
          </span>
          <span className="text-gray-300">
            <span className="text-gray-500">Phone:</span> (555) 123-4567
          </span>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-4" />
        <p className="text-gray-400">Loading...</p>
      </div>
    }>
      <PaymentCancelContent />
    </Suspense>
  );
}
