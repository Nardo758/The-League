'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Building2, Users, Trophy, Calendar, BarChart3, DollarSign, CheckCircle2, 
  ArrowRight, Star, Shield, Zap, TrendingUp, Clock, FileSpreadsheet, Eye,
  MessageSquare, CreditCard, Bell, Settings, ChevronRight, Phone, Mail,
  Play, ChevronDown
} from 'lucide-react';

const trustedVenues = [
  'Desert Ridge Golf',
  'Metro Pickleball',
  'Sunset Lanes',
  'Valley Sports Complex',
  'Phoenix Tennis Center'
];

const problems = [
  {
    icon: TrendingUp,
    title: 'Empty Capacity',
    description: 'Tuesday tee times sit empty while players are actively searching for leagues to join.'
  },
  {
    icon: FileSpreadsheet,
    title: 'Manual Chaos',
    description: 'Excel spreadsheets, group texts, and chasing Venmo payments wastes hours every week.'
  },
  {
    icon: Eye,
    title: 'Invisible to Players',
    description: "Athletes can't find you when searching for leagues. You're missing out on new members."
  }
];

const keyBenefits = [
  {
    icon: TrendingUp,
    title: 'Fill Capacity',
    color: 'bg-blue-100 text-blue-600',
    items: [
      'Reach 12,482 active athletes',
      'Fill slow time slots',
      'Get discovered by new players',
      'Targeted notifications to nearby athletes'
    ]
  },
  {
    icon: Settings,
    title: 'Automate Management',
    color: 'bg-purple-100 text-purple-600',
    items: [
      'Registration & payments',
      'Automated scheduling',
      'Standings & brackets',
      'Messaging & reminders',
      'Waitlist management'
    ]
  },
  {
    icon: DollarSign,
    title: 'Maximize Revenue',
    color: 'bg-green-100 text-green-600',
    items: [
      'Dynamic pricing options',
      'Upsell opportunities',
      'Analytics dashboard',
      'Member retention tracking',
      'Revenue forecasting'
    ]
  }
];

const howItWorks = [
  {
    step: 1,
    title: 'Create Your Profile',
    description: 'Add venue details, photos, and amenities',
    time: '5 minutes'
  },
  {
    step: 2,
    title: 'List Your Leagues',
    description: 'Post all your active and upcoming leagues',
    time: '5 minutes'
  },
  {
    step: 3,
    title: 'Athletes Find You',
    description: 'Your leagues appear in search results for thousands of athletes',
    time: 'Instant'
  },
  {
    step: 4,
    title: 'Manage Everything',
    description: 'Track registrations, collect payments, and communicate with members',
    time: 'Ongoing'
  }
];

const featureTabs = [
  {
    id: 'discovery',
    label: 'Discovery & Promotion',
    icon: TrendingUp,
    features: [
      'Featured league placement',
      'Bulletin board announcements',
      'Email alerts to matched athletes',
      'Social media integration',
      'SEO-optimized league pages',
      'Venue profile with photos & reviews'
    ]
  },
  {
    id: 'management',
    label: 'League Management',
    icon: Settings,
    features: [
      'Online registration forms',
      'Secure payment processing (Stripe)',
      'Automated scheduling & pairings',
      'Team/roster management',
      'Score tracking & standings',
      'Messaging & notifications',
      'Waitlist management'
    ]
  },
  {
    id: 'analytics',
    label: 'Analytics & Insights',
    icon: BarChart3,
    features: [
      'Revenue tracking',
      'Registration trends',
      'Member retention rates',
      'Peak time analysis',
      'Demographic insights',
      'Custom reports',
      'Forecasting tools'
    ]
  }
];

const testimonials = {
  primary: {
    quote: "We increased Tuesday league participation by 85% in just 3 months. The platform pays for itself in the first month. It's been a game-changer for our operations.",
    author: 'Sarah Chen',
    role: 'Operations Manager, Desert Ridge Golf Club',
    avatar: 'SC'
  },
  secondary: [
    {
      quote: 'Cut admin time by 20 hours per week. Now I can focus on member experience instead of spreadsheets.',
      author: 'Mike Torres',
      role: 'Owner, Metro Bowl',
      avatar: 'MT'
    },
    {
      quote: 'Found 40 new members in one month who never knew we existed before.',
      author: 'Jennifer Wu',
      role: 'Director, Phoenix Tennis Center',
      avatar: 'JW'
    },
    {
      quote: "Best investment we've made in 10 years. ROI was immediate.",
      author: 'David Park',
      role: 'Manager, Valley Sports Complex',
      avatar: 'DP'
    }
  ]
};

const stats = [
  { value: '85%', label: 'Increase in off-peak capacity utilization' },
  { value: '20hrs', label: 'Admin time saved per week on average' },
  { value: '40%', label: 'Higher member retention rates' }
];

const sportFeatures = [
  {
    id: 'golf',
    name: 'Golf Courses',
    emoji: '⛳',
    features: [
      'Tee time coordination',
      'Handicap integration & GHIN posting',
      'Course rating adjustments',
      'Multi-format support (stroke, match, scramble)',
      'Weather alerts and rainout management',
      'League flights and divisions'
    ]
  },
  {
    id: 'pickleball',
    name: 'Pickleball Centers',
    emoji: '🏓',
    features: [
      'Court scheduling',
      'Skill-based matching',
      'Ladder rankings',
      'Round robin tournaments',
      'Rally scoring',
      'Partner matching'
    ]
  },
  {
    id: 'bowling',
    name: 'Bowling Alleys',
    emoji: '🎳',
    features: [
      'Lane assignments',
      'Oil pattern tracking',
      'USBC sanctioning integration',
      'Pin scoring systems',
      'Team formations',
      'Handicap calculations'
    ]
  },
  {
    id: 'softball',
    name: 'Softball Complexes',
    emoji: '🥎',
    features: [
      'Field permit management',
      'Umpire coordination',
      'Tournament brackets',
      'Run differential tracking',
      'Division management',
      'Weather postponements'
    ]
  },
  {
    id: 'tennis',
    name: 'Tennis Clubs',
    emoji: '🎾',
    features: [
      'Court reservations',
      'USTA integration',
      'Ladder management',
      'Set/match scoring',
      'Pro shop integration',
      'Skill ratings'
    ]
  },
  {
    id: 'soccer',
    name: 'Soccer Facilities',
    emoji: '⚽',
    features: [
      'Referee scheduling',
      'Field allocation',
      'Division management',
      'Goal tracking',
      'Tournament brackets',
      'Team registration'
    ]
  }
];

const pricingPlans = [
  {
    name: 'Starter',
    price: '$99',
    period: '/month',
    description: 'Perfect for small venues and single-sport facilities',
    popular: false,
    features: [
      'Up to 5 active leagues',
      'Unlimited athletes',
      'Basic analytics',
      'Email support',
      'Mobile app access',
      'Payment processing included'
    ]
  },
  {
    name: 'Professional',
    price: '$199',
    period: '/month',
    description: 'For multi-sport complexes and growing venues',
    popular: true,
    features: [
      'Up to 20 active leagues',
      'Everything in Starter, plus:',
      'Advanced analytics & reports',
      'Priority support',
      'Custom branding',
      'Bulk messaging',
      'API access (coming soon)'
    ]
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large chains and municipal facilities',
    popular: false,
    features: [
      'Unlimited leagues',
      'Everything in Professional, plus:',
      'White-label option',
      'Dedicated account manager',
      'Custom integrations',
      'Advanced API access',
      'Service level agreement (SLA)'
    ]
  }
];

const faqs = [
  {
    q: 'How long does setup take?',
    a: "Most venues are up and running in 15-20 minutes. Just add your venue details, list your first league, and you're live. We also offer free onboarding assistance."
  },
  {
    q: 'What sports do you support?',
    a: 'Golf, pickleball, bowling, softball, baseball, tennis, soccer, basketball, volleyball, and more. Each sport has custom features built specifically for its needs.'
  },
  {
    q: 'Can I import my existing league data?',
    a: "Yes! We'll help you migrate your current rosters, schedules, and historical data. Contact our support team for assistance."
  },
  {
    q: 'What are the payment processing fees?',
    a: 'Standard rate is 2.9% + $0.30 per transaction (same as Stripe/Square). All fees are transparent—no surprises.'
  },
  {
    q: 'Do I need to sign a long-term contract?',
    a: 'No! All plans are month-to-month. Try us for 30 days free, then continue if you love it. Cancel anytime.'
  },
  {
    q: 'What kind of support do you offer?',
    a: 'Email support for all plans, priority support for Professional, and dedicated account manager for Enterprise. Average response time: 2 hours.'
  },
  {
    q: 'Can athletes register and pay online?',
    a: 'Yes! Athletes complete everything online—registration, waivers, payments. You get instant notifications and automatic roster updates.'
  },
  {
    q: 'How do you help me fill empty time slots?',
    a: 'Your leagues appear in search results for thousands of active athletes. We also send targeted notifications to athletes based on their sport preferences and location.'
  },
  {
    q: 'What if I have multiple locations?',
    a: 'Enterprise plans include multi-location management with consolidated reporting. Contact sales for details.'
  },
  {
    q: 'Is there a mobile app?',
    a: 'Yes! Both venue managers and athletes have mobile apps (iOS and Android). Manage leagues on the go.'
  }
];

export default function ForVenuesPage() {
  const [activeFeatureTab, setActiveFeatureTab] = useState('discovery');
  const [activeSportTab, setActiveSportTab] = useState('golf');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -my-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/30 rounded-full mb-6 border border-emerald-400/30">
                <Building2 className="w-4 h-4" />
                <span className="text-sm font-semibold uppercase tracking-wide">For Venues</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight leading-tight">
                Fill Your Courts, Lanes, and Fields Automatically
              </h1>
              <p className="text-xl text-emerald-100 mb-6 max-w-xl">
                Join 200+ venues using The League to maximize capacity, manage leagues effortlessly, and connect with thousands of active athletes searching for their next game.
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                <Link 
                  href="/register?role=venue" 
                  className="px-8 py-4 bg-white text-emerald-700 rounded-lg font-bold text-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-2"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  href="#demo" 
                  className="px-6 py-3 border-2 border-emerald-400 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-all flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Schedule a Demo
                </Link>
              </div>
              <div className="flex items-center gap-6 text-sm text-emerald-200">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  No credit card required
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Setup in 15 minutes
                </span>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="bg-gray-900 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-xs text-gray-400 ml-2">Venue Dashboard</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="text-xs text-gray-400">Active Leagues</div>
                      <div className="text-xl font-bold text-white">12</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="text-xs text-gray-400">Registered</div>
                      <div className="text-xl font-bold text-emerald-400">486</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="text-xs text-gray-400">Revenue</div>
                      <div className="text-xl font-bold text-white">$24.5k</div>
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-2">This Week's Schedule</div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">Monday Golf League</span>
                        <span className="text-emerald-400">32/32</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">Wednesday Pickleball</span>
                        <span className="text-yellow-400">28/40</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">Friday Bowling Night</span>
                        <span className="text-emerald-400">48/48</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof Bar */}
      <div className="bg-gray-100 py-6 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            <span className="text-sm text-gray-500 font-medium">Trusted by leading venues:</span>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {trustedVenues.map((venue) => (
                <span key={venue} className="text-gray-700 font-semibold text-sm md:text-base">
                  {venue}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Problem Section */}
      <div className="bg-gray-50 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              The Challenges Venues Face Today
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Sound familiar? You're not alone. These are the pain points we hear from venue managers every day.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {problems.map((problem) => {
              const Icon = problem.icon;
              return (
                <div key={problem.title} className="bg-white rounded-xl p-8 border border-gray-200 text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{problem.title}</h3>
                  <p className="text-gray-600">{problem.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Solution Section */}
      <div className="bg-emerald-600 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            One Platform for All Your League Operations
          </h2>
          <p className="text-emerald-100 text-lg">
            From registration to standings, The League handles everything so you can focus on creating great experiences.
          </p>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="bg-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {keyBenefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.title} className="bg-gray-50 rounded-xl p-8">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${benefit.color}`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
                  <ul className="space-y-3">
                    {benefit.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-gray-600">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-12">
            <Link 
              href="/register?role=venue"
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-lg font-bold text-lg hover:bg-emerald-700 transition-colors"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gray-900 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Get Up and Running in 15 Minutes
            </h2>
            <p className="text-lg text-gray-400">
              Four simple steps to transform your league management
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {howItWorks.map((step, idx) => (
              <div key={step.step} className="relative">
                <div className="bg-gray-800 rounded-xl p-6 h-full">
                  <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center font-bold text-white mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-gray-400 text-sm mb-3">{step.description}</p>
                  <span className="text-emerald-400 text-sm font-medium">{step.time}</span>
                </div>
                {idx < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <ChevronRight className="w-6 h-6 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Showcase */}
      <div className="bg-white py-16 md:py-20" id="demo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Run Successful Leagues
            </h2>
          </div>
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-gray-100 rounded-lg p-1">
              {featureTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFeatureTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeFeatureTab === tab.id
                        ? 'bg-white text-emerald-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="bg-gray-50 rounded-2xl p-8 md:p-12">
            {featureTabs.map((tab) => (
              <div key={tab.id} className={activeFeatureTab === tab.id ? 'block' : 'hidden'}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gray-800 rounded-xl p-6 flex items-center justify-center min-h-[300px]">
                    <div className="text-center text-gray-400">
                      <tab.icon className="w-16 h-16 mx-auto mb-4 text-emerald-500" />
                      <p className="text-sm">Dashboard Preview</p>
                      <p className="text-lg font-medium text-white">{tab.label}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">{tab.label}</h3>
                    <ul className="space-y-4">
                      {tab.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3 text-gray-700">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gray-50 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Other Venues Are Saying
            </h2>
          </div>
          {/* Primary Testimonial */}
          <div className="bg-white rounded-2xl p-8 md:p-12 mb-8 border border-gray-200">
            <div className="flex items-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
              "{testimonials.primary.quote}"
            </p>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center font-bold text-emerald-700 text-lg">
                {testimonials.primary.avatar}
              </div>
              <div>
                <div className="font-bold text-gray-900">{testimonials.primary.author}</div>
                <div className="text-gray-500">{testimonials.primary.role}</div>
              </div>
            </div>
          </div>
          {/* Secondary Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.secondary.map((t, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center font-bold text-emerald-700 text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{t.author}</div>
                    <div className="text-gray-500 text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats & Results */}
      <div className="bg-emerald-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Real Results from Real Venues
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-5xl md:text-6xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-emerald-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sport-Specific Features */}
      <div className="bg-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built for Your Sport, Works Across All Sports
            </h2>
            <p className="text-lg text-gray-600">
              Custom features designed specifically for each sport's unique needs
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {sportFeatures.map((sport) => (
              <button
                key={sport.id}
                onClick={() => setActiveSportTab(sport.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSportTab === sport.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{sport.emoji}</span>
                {sport.name}
              </button>
            ))}
          </div>
          {sportFeatures.map((sport) => (
            <div key={sport.id} className={activeSportTab === sport.id ? 'block' : 'hidden'}>
              <div className="bg-gray-50 rounded-2xl p-8 max-w-3xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-4xl">{sport.emoji}</span>
                  <h3 className="text-2xl font-bold text-gray-900">{sport.name}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sport.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-gray-50 py-16 md:py-20" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600">
              Start with a 30-day free trial. No credit card required.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 ${
                  plan.popular
                    ? 'bg-emerald-600 text-white transform md:scale-105 shadow-xl'
                    : 'bg-white border border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="text-sm font-semibold text-emerald-200 uppercase tracking-wide mb-2">
                    Most Popular
                  </div>
                )}
                <div className={`text-sm font-semibold uppercase tracking-wide mb-2 ${plan.popular ? 'text-emerald-200' : 'text-gray-500'}`}>
                  {plan.name}
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price}
                  </span>
                  <span className={plan.popular ? 'text-emerald-200' : 'text-gray-500'}>
                    {plan.period}
                  </span>
                </div>
                <p className={`mb-6 text-sm ${plan.popular ? 'text-emerald-100' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${plan.popular ? 'text-emerald-200' : 'text-emerald-500'}`} />
                      <span className={plan.popular ? 'text-white' : 'text-gray-700'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register?role=venue"
                  className={`block w-full py-3 text-center rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-white text-emerald-700 hover:shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-8 text-sm text-gray-500">
            All plans include: 30-day free trial | No setup fees | Cancel anytime | Secure payment processing
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-6 text-gray-600">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Zap className="w-12 h-12 text-emerald-200 mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Fill Your Venue with Active Leagues?
          </h2>
          <p className="text-lg text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join 200+ venues already using The League to maximize capacity and streamline operations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link 
              href="/register?role=venue" 
              className="px-8 py-4 bg-white text-emerald-700 rounded-lg font-bold text-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-2"
            >
              Start Your Free 30-Day Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="#demo" 
              className="px-6 py-3 border-2 border-emerald-400 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-all"
            >
              Schedule a Demo
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-emerald-200">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Cancel anytime
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Setup in 15 minutes
            </span>
          </div>
          <div className="mt-12 pt-8 border-t border-emerald-500/30">
            <p className="text-emerald-200 text-sm mb-2">Questions? We're here to help.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a href="tel:5551234567" className="flex items-center gap-2 text-white hover:text-emerald-200 transition-colors">
                <Phone className="w-4 h-4" />
                (555) 123-4567
              </a>
              <a href="mailto:venues@theleague.com" className="flex items-center gap-2 text-white hover:text-emerald-200 transition-colors">
                <Mail className="w-4 h-4" />
                venues@theleague.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
