'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircle, Calendar, Mail, Download, Share2, MapPin, 
  ExternalLink, MessageSquare, ArrowRight, Copy, Check, 
  Twitter, Facebook, Loader2, AlertCircle 
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
  registration?: {
    id: number;
    status: string;
    payment_status: string | null;
    payment_amount: number | null;
    payment_intent_id: string | null;
    created_at: string | null;
  };
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const [session, setSession] = useState<SessionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (sessionId) {
      fetchSessionDetails();
    } else {
      setError('No session ID provided');
      setLoading(false);
    }
  }, [sessionId]);

  const fetchSessionDetails = async () => {
    try {
      const data = await api.get<SessionDetails>(`/payments/session/${sessionId}`);
      setSession(data);
    } catch (err) {
      setError('Failed to load payment details. The session may have expired.');
    } finally {
      setLoading(false);
    }
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

  const formatPaymentDate = (timestamp: number | null) => {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const generateOrderNumber = () => {
    if (!session?.registration?.id) return '';
    const prefix = session.league?.name?.substring(0, 3).toUpperCase() || 'REG';
    return `${prefix}-2025-${String(session.registration.id).padStart(4, '0')}`;
  };

  const downloadCalendar = () => {
    if (!session?.season?.start_date || !session?.league) return;
    
    const startDate = new Date(session.season.start_date);
    startDate.setHours(18, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setHours(20, 0, 0, 0);
    
    const formatICSDate = (d: Date) => {
      return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };
    
    const dtStart = formatICSDate(startDate);
    const dtEnd = formatICSDate(endDate);
    const now = formatICSDate(new Date());
    const uid = `${session.session_id}@theleague.com`;
    
    const location = [session.venue?.address, session.venue?.city, session.venue?.state]
      .filter(Boolean)
      .join(', ');
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//The League//Registration//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${now}
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:${session.league.name} - Season Start
DESCRIPTION:Your league season begins! Arrive 15 minutes early for check-in at ${session.venue?.name || 'the venue'}.
LOCATION:${location}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${session.league.name.replace(/\s+/g, '-')}-season-start.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const addToGoogleCalendar = () => {
    if (!session?.season?.start_date || !session?.league) return;
    
    const startDate = new Date(session.season.start_date);
    startDate.setHours(18, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setHours(20, 0, 0, 0);
    
    const formatGoogleDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    
    const location = [session.venue?.address, session.venue?.city, session.venue?.state]
      .filter(Boolean)
      .join(', ');
    
    const description = `Your ${session.league.name} season begins!\\n\\nVenue: ${session.venue?.name || 'TBD'}\\nArrive 15 minutes early for check-in.\\n\\nView league details: ${window.location.origin}/leagues/${session.league.id}`;
    
    const url = new URL('https://calendar.google.com/calendar/render');
    url.searchParams.set('action', 'TEMPLATE');
    url.searchParams.set('text', `${session.league.name} - Season Start`);
    url.searchParams.set('dates', `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`);
    url.searchParams.set('details', description);
    url.searchParams.set('location', location);
    
    window.open(url.toString(), '_blank');
  };

  const copyLink = async () => {
    const shareUrl = `${window.location.origin}/leagues/${session?.league?.id}`;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnTwitter = () => {
    const text = `I just registered for ${session?.league?.name}! Join me at ${session?.venue?.name || 'the venue'}!`;
    const url = `${window.location.origin}/leagues/${session?.league?.id}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareOnFacebook = () => {
    const url = `${window.location.origin}/leagues/${session?.league?.id}`;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const getDirections = () => {
    if (!session?.venue) return;
    const address = [session.venue.address, session.venue.city, session.venue.state, session.venue.zip_code]
      .filter(Boolean)
      .join(', ');
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(mapsUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-4" />
        <p className="text-gray-400">Loading payment details...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
        <p className="text-gray-400 mb-6">{error || 'Unable to load payment details'}</p>
        <Link href="/leagues" className="text-emerald-500 hover:text-emerald-400">
          Browse Leagues
        </Link>
      </div>
    );
  }

  if (session.is_expired) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-amber-500/30">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-white mb-3">Session Expired</h1>
          <p className="text-gray-400 mb-6">
            This payment session has expired. If you completed the payment, your registration should be processed. 
            If not, please try registering again.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              href="/my-leagues"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
            >
              Check My Leagues
            </Link>
            <Link 
              href={session.league?.id ? `/leagues/${session.league.id}` : '/leagues'}
              className="px-6 py-3 bg-[#2a2a2a] hover:bg-[#333] text-gray-300 rounded-lg transition-colors"
            >
              Go to League Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (session.status === 'pending' || session.payment_status !== 'paid') {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-amber-500/30">
          <Loader2 className="w-16 h-16 text-amber-500 mx-auto mb-6 animate-spin" />
          <h1 className="text-2xl font-bold text-white mb-3">Payment Processing</h1>
          <p className="text-gray-400 mb-6">
            Your payment is being processed. This page will update automatically when complete.
            If this takes longer than a minute, please check your email for confirmation.
          </p>
          <button 
            onClick={fetchSessionDetails}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
          >
            Refresh Status
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="bg-[#1a1a1a] rounded-2xl p-8 text-center border border-[#2a2a2a]">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/20 rounded-full mb-6 animate-bounce">
          <CheckCircle className="w-12 h-12 text-emerald-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Registration Confirmed!</h1>
        <p className="text-xl text-gray-300 mb-4">
          You're all set for {session.league?.name}
        </p>
        <div className="text-gray-400 space-y-1">
          <p>Confirmation sent to {session.customer_email || session.user?.email}</p>
          <p className="font-mono text-sm">Order #{generateOrderNumber()}</p>
        </div>
      </div>

      <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a]">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-500" />
          Registration Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">League</p>
            <p className="text-white font-medium">{session.league?.name}</p>
          </div>
          <div>
            <p className="text-gray-400">Venue</p>
            <p className="text-white font-medium">{session.venue?.name || 'TBD'}</p>
          </div>
          <div>
            <p className="text-gray-400">Season</p>
            <p className="text-white font-medium">{session.season?.name || 'Current Season'}</p>
          </div>
          <div>
            <p className="text-gray-400">Start Date</p>
            <p className="text-white font-medium">{formatDate(session.season?.start_date || null)}</p>
          </div>
          {session.user?.full_name && (
            <div>
              <p className="text-gray-400">Registered To</p>
              <p className="text-white font-medium">{session.user.full_name}</p>
            </div>
          )}
          {session.user?.email && (
            <div>
              <p className="text-gray-400">Email</p>
              <p className="text-white font-medium">{session.user.email}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a]">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-emerald-500">$</span>
          Payment Summary
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Registration Fee</span>
            <span className="text-white">{formatCurrency(session.amount_total, session.currency)}</span>
          </div>
          <div className="border-t border-[#2a2a2a] pt-3 flex justify-between font-semibold">
            <span className="text-gray-300">Total Paid</span>
            <span className="text-emerald-500">{formatCurrency(session.amount_total, session.currency)}</span>
          </div>
          <div className="pt-3 text-sm text-gray-400 space-y-1">
            {session.payment_intent && (
              <p>Transaction ID: {session.payment_intent.substring(0, 20)}...</p>
            )}
            <p>Date: {formatPaymentDate(session.created_at)}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button 
            disabled
            title="Receipt download coming soon"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#2a2a2a] rounded-lg text-sm text-gray-500 cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Download Receipt
          </button>
          <button 
            disabled
            title="Receipt email coming soon"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#2a2a2a] rounded-lg text-sm text-gray-500 cursor-not-allowed"
          >
            <Mail className="w-4 h-4" />
            Email Receipt
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">Receipt features coming soon</p>
      </div>

      <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a]">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-xl">🎯</span>
          What's Next?
        </h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 font-semibold text-sm">
              1
            </div>
            <div>
              <h3 className="text-white font-medium">Check Your Email</h3>
              <p className="text-gray-400 text-sm">We've sent you a confirmation with all the details, league rules, and any waivers to sign.</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 font-semibold text-sm">
              2
            </div>
            <div>
              <h3 className="text-white font-medium">Add to Calendar</h3>
              <p className="text-gray-400 text-sm mb-3">Don't miss any league nights! Add the season to your calendar.</p>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={addToGoogleCalendar}
                  className="flex items-center gap-2 px-3 py-2 bg-[#2a2a2a] hover:bg-[#333] rounded-lg text-sm text-gray-300 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Google Calendar
                </button>
                <button 
                  onClick={downloadCalendar}
                  className="flex items-center gap-2 px-3 py-2 bg-[#2a2a2a] hover:bg-[#333] rounded-lg text-sm text-gray-300 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download .ics
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 font-semibold text-sm">
              3
            </div>
            <div>
              <h3 className="text-white font-medium">First League Day</h3>
              <p className="text-gray-400 text-sm">
                {formatDate(session.season?.start_date || null)}
                {session.venue?.name && ` at ${session.venue.name}`}
              </p>
              {session.venue?.address && (
                <button 
                  onClick={getDirections}
                  className="flex items-center gap-2 mt-2 px-3 py-2 bg-[#2a2a2a] hover:bg-[#333] rounded-lg text-sm text-gray-300 transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  Get Directions
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 font-semibold text-sm">
              4
            </div>
            <div>
              <h3 className="text-white font-medium">Join the League Chat</h3>
              <p className="text-gray-400 text-sm">Connect with other players and get updates from the organizer.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a]">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Share2 className="w-5 h-5 text-emerald-500" />
          Share Your Excitement
        </h2>
        <p className="text-gray-400 text-sm mb-4">
          Tell your friends you're playing in {session.league?.name}!
        </p>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={shareOnTwitter}
            className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/30 text-[#1DA1F2] rounded-lg text-sm transition-colors"
          >
            <Twitter className="w-4 h-4" />
            Share on X
          </button>
          <button 
            onClick={shareOnFacebook}
            className="flex items-center gap-2 px-4 py-2 bg-[#1877F2]/20 hover:bg-[#1877F2]/30 text-[#1877F2] rounded-lg text-sm transition-colors"
          >
            <Facebook className="w-4 h-4" />
            Share on Facebook
          </button>
          <button 
            onClick={copyLink}
            className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] hover:bg-[#333] rounded-lg text-sm text-gray-300 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>

      <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a]">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link 
            href={`/leagues/${session.league?.id}`}
            className="flex items-center justify-between p-4 bg-[#2a2a2a] hover:bg-[#333] rounded-lg transition-colors group"
          >
            <span className="text-gray-300">View League Details</span>
            <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-emerald-500 transition-colors" />
          </Link>
          <Link 
            href="/leagues"
            className="flex items-center justify-between p-4 bg-[#2a2a2a] hover:bg-[#333] rounded-lg transition-colors group"
          >
            <span className="text-gray-300">Browse More Leagues</span>
            <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-emerald-500 transition-colors" />
          </Link>
          <Link 
            href="/my-leagues"
            className="flex items-center justify-between p-4 bg-[#2a2a2a] hover:bg-[#333] rounded-lg transition-colors group"
          >
            <span className="text-gray-300">Go to Dashboard</span>
            <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-emerald-500 transition-colors" />
          </Link>
          <button 
            className="flex items-center justify-between p-4 bg-[#2a2a2a] hover:bg-[#333] rounded-lg transition-colors group text-left"
          >
            <span className="text-gray-300">Contact Organizer</span>
            <MessageSquare className="w-5 h-5 text-gray-500 group-hover:text-emerald-500 transition-colors" />
          </button>
        </div>
      </div>

      <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a]">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-emerald-500" />
          Need Help?
        </h2>
        <p className="text-gray-400 text-sm mb-4">Questions about your registration?</p>
        <div className="space-y-2 text-sm">
          <p className="text-gray-300">
            <span className="text-gray-500">Email:</span> support@theleague.com
          </p>
          <p className="text-gray-300">
            <span className="text-gray-500">Phone:</span> (555) 123-4567
          </p>
        </div>
        <button className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm transition-colors">
          Visit Help Center
        </button>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-4" />
        <p className="text-gray-400">Loading...</p>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
