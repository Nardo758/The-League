'use client';

import Link from 'next/link';
import { Building2, Users, Trophy, Calendar, BarChart3, DollarSign, CheckCircle2, ArrowRight, Star, Shield, Zap } from 'lucide-react';

const benefits = [
  {
    icon: Users,
    title: 'Grow Your Community',
    description: 'Attract new players and build a loyal community around your venue with recurring leagues and tournaments.'
  },
  {
    icon: Calendar,
    title: 'Easy Scheduling',
    description: 'Manage league schedules, court reservations, and team registrations all in one place.'
  },
  {
    icon: DollarSign,
    title: 'Increase Revenue',
    description: 'Fill off-peak hours, boost food & beverage sales, and generate consistent income from league fees.'
  },
  {
    icon: BarChart3,
    title: 'Track Performance',
    description: 'Get insights into player engagement, revenue trends, and league performance with detailed analytics.'
  },
  {
    icon: Trophy,
    title: 'Automated Standings',
    description: 'Let the platform handle score tracking, standings calculation, and bracket management automatically.'
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'Collect registration fees securely with integrated payment processing and automatic payouts.'
  }
];

const stats = [
  { value: '500+', label: 'Venues' },
  { value: '12,000+', label: 'Active Players' },
  { value: '2,500+', label: 'Leagues Hosted' },
  { value: '98%', label: 'Satisfaction Rate' }
];

const venueTypes = [
  { name: 'Golf Courses', emoji: '🏌️' },
  { name: 'Bowling Alleys', emoji: '🎳' },
  { name: 'Sports Complexes', emoji: '🏟️' },
  { name: 'Tennis Centers', emoji: '🎾' },
  { name: 'Recreation Centers', emoji: '🏀' },
  { name: 'Esports Arenas', emoji: '🎮' }
];

const testimonials = [
  {
    quote: "The League has transformed how we run our bowling leagues. Registration is seamless, and our players love tracking their stats online.",
    author: "Mike Johnson",
    role: "Manager, Sunset Lanes",
    avatar: "MJ"
  },
  {
    quote: "We've seen a 40% increase in league participation since joining. The platform makes it easy for new players to discover us.",
    author: "Sarah Chen",
    role: "Director, Metro Pickleball Center",
    avatar: "SC"
  }
];

export default function ForVenuesPage() {
  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -my-8">
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/30 rounded-full mb-6 border border-emerald-400/30">
              <Building2 className="w-4 h-4" />
              <span className="text-sm font-semibold uppercase tracking-wide">For Venues</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Grow Your Venue.<br/>Host More Leagues.
            </h1>
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl">
              The League helps golf courses, bowling alleys, sports complexes, and recreation centers attract players, manage leagues, and increase revenue.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link 
                href="/register?role=venue" 
                className="px-8 py-4 bg-white text-emerald-700 rounded-lg font-bold text-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/search?tab=venues" 
                className="px-6 py-3 border-2 border-emerald-400 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-all"
              >
                See Venues on The League
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 py-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Run Successful Leagues
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From registration to standings, we handle the details so you can focus on creating great experiences.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.title} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-gray-900 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Built for Every Type of Venue
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Whether you run a golf course, bowling alley, or sports complex, The League adapts to your needs.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {venueTypes.map((type) => (
              <div key={type.name} className="bg-gray-800 rounded-xl p-6 text-center hover:bg-gray-700 transition-colors">
                <span className="text-4xl mb-3 block">{type.emoji}</span>
                <span className="text-white font-medium">{type.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Venues Everywhere
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl p-8">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-lg mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center font-bold text-emerald-700">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white py-16 md:py-24 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600">
              Start free and upgrade as you grow
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Starter</div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold text-gray-900">Free</span>
              </div>
              <p className="text-gray-600 mb-6">Perfect for trying out the platform</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  1 active league
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Up to 50 players
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Basic standings & schedules
                </li>
              </ul>
              <Link href="/register?role=venue" className="block w-full py-3 text-center bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                Get Started
              </Link>
            </div>
            <div className="bg-emerald-600 rounded-xl p-8 text-white transform scale-105 shadow-xl">
              <div className="text-sm font-semibold text-emerald-200 uppercase tracking-wide mb-2">Pro</div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold">$49</span>
                <span className="text-emerald-200">/month</span>
              </div>
              <p className="text-emerald-100 mb-6">Most popular for growing venues</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                  Unlimited leagues
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                  Unlimited players
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                  Payment processing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                  Analytics dashboard
                </li>
              </ul>
              <Link href="/register?role=venue" className="block w-full py-3 text-center bg-white text-emerald-700 rounded-lg font-bold hover:shadow-lg transition-all">
                Start Free Trial
              </Link>
            </div>
            <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Enterprise</div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold text-gray-900">Custom</span>
              </div>
              <p className="text-gray-600 mb-6">For multi-location venues</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Everything in Pro
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Multi-location support
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  API access
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Dedicated support
                </li>
              </ul>
              <Link href="/register?role=venue" className="block w-full py-3 text-center bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-emerald-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Zap className="w-12 h-12 text-emerald-200 mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Grow Your Venue?
          </h2>
          <p className="text-lg text-emerald-100 mb-8">
            Join hundreds of venues already using The League to host successful leagues and tournaments.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/register?role=venue" 
              className="px-8 py-4 bg-white text-emerald-700 rounded-lg font-bold text-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/" 
              className="px-6 py-3 border-2 border-emerald-400 text-white rounded-lg font-semibold hover:bg-emerald-500 transition-all"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
