'use client';

import Link from 'next/link';
import { HelpCircle, Mail, MessageSquare, FileText, ExternalLink, ChevronRight } from 'lucide-react';

const faqs = [
  {
    question: 'How do I join a league?',
    answer: 'Find a league through the Discover page or Search, then click "Join League" on the league detail page. Some leagues require approval from the organizer.'
  },
  {
    question: 'How do I create my own league?',
    answer: 'First, you need to register as a venue. Go to "For Venues" and sign up. Once approved, you can create leagues from your venue dashboard.'
  },
  {
    question: 'What sports are supported?',
    answer: 'We currently support Golf, Pickleball, Bowling, Tennis, Soccer, and Softball. We also have online games like Chess, Checkers, Connect 4, and Battleship.'
  },
  {
    question: 'How do payments work?',
    answer: 'Payments are processed securely through Stripe. Registration fees are collected when you join a league. Refund policies vary by league.'
  },
  {
    question: 'How do I report a score?',
    answer: 'After a game, go to the league detail page, find your match in the schedule, and submit your score. A league staff member will verify the result.'
  },
  {
    question: 'Can I cancel my registration?',
    answer: 'Contact the league organizer directly through the league page. Refund eligibility depends on the league\'s cancellation policy.'
  },
];

export default function SupportPage() {
  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -my-8">
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-2xl mx-auto">
            <HelpCircle className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h1 className="text-4xl font-bold mb-4">Help & Support</h1>
            <p className="text-xl text-blue-100">
              Find answers to common questions or get in touch with our team.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-50 min-h-[60vh]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden group">
                  <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50">
                    <span className="font-medium text-gray-900">{faq.question}</span>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="px-5 pb-5 text-gray-600">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Contact Us</h3>
              <div className="space-y-4">
                <a
                  href="mailto:support@theleague.com"
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <span className="font-medium text-gray-900 block">Email Support</span>
                    <span className="text-sm text-gray-500">support@theleague.com</span>
                  </div>
                </a>
                <button className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors w-full">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <span className="font-medium text-gray-900 block">Live Chat</span>
                    <span className="text-sm text-gray-500">Available 9am-5pm EST</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Resources</h3>
              <div className="space-y-2">
                <Link
                  href="/for-venues"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-700">Venue Guide</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </Link>
                <Link
                  href="/style-guide"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-700">Style Guide</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </Link>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
              <h3 className="font-semibold text-blue-900 mb-2">Need urgent help?</h3>
              <p className="text-sm text-blue-700 mb-4">
                For time-sensitive issues during a league event, contact your league organizer directly.
              </p>
              <Link
                href="/my-leagues"
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View My Leagues
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
