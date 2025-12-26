'use client';

import { useState } from 'react';
import { Trophy, Star, TrendingUp, Users, Bell, AlertCircle, Award } from 'lucide-react';

const sections = [
  { id: 'colors', name: 'Colors' },
  { id: 'typography', name: 'Typography' },
  { id: 'buttons', name: 'Buttons' },
  { id: 'cards', name: 'Cards' },
  { id: 'badges', name: 'Badges & Tags' },
  { id: 'forms', name: 'Form Elements' },
  { id: 'stats', name: 'Stats Display' },
  { id: 'sports', name: 'Sport Branding' }
];

function ColorPalette() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Primary Colors</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="h-24 bg-blue-600 rounded-lg shadow-md"></div>
            <div className="text-sm font-mono text-gray-600">#0066FF</div>
            <div className="text-xs text-gray-500">Primary Blue</div>
          </div>
          <div className="space-y-2">
            <div className="h-24 bg-blue-700 rounded-lg shadow-md"></div>
            <div className="text-sm font-mono text-gray-600">#0052CC</div>
            <div className="text-xs text-gray-500">Primary Dark</div>
          </div>
          <div className="space-y-2">
            <div className="h-24 bg-blue-400 rounded-lg shadow-md"></div>
            <div className="text-sm font-mono text-gray-600">#4D94FF</div>
            <div className="text-xs text-gray-500">Primary Light</div>
          </div>
          <div className="space-y-2">
            <div className="h-24 bg-blue-50 rounded-lg shadow-md border border-gray-200"></div>
            <div className="text-sm font-mono text-gray-600">#E6F0FF</div>
            <div className="text-xs text-gray-500">Primary Pale</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Secondary Colors</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="h-24 bg-green-500 rounded-lg shadow-md"></div>
            <div className="text-sm font-mono text-gray-600">#00C853</div>
            <div className="text-xs text-gray-500">Sports Green</div>
          </div>
          <div className="space-y-2">
            <div className="h-24 bg-orange-600 rounded-lg shadow-md"></div>
            <div className="text-sm font-mono text-gray-600">#FF6B00</div>
            <div className="text-xs text-gray-500">Sports Orange</div>
          </div>
          <div className="space-y-2">
            <div className="h-24 bg-purple-700 rounded-lg shadow-md"></div>
            <div className="text-sm font-mono text-gray-600">#7B2CBF</div>
            <div className="text-xs text-gray-500">Sports Purple</div>
          </div>
          <div className="space-y-2">
            <div className="h-24 bg-yellow-500 rounded-lg shadow-md"></div>
            <div className="text-sm font-mono text-gray-600">#FFB800</div>
            <div className="text-xs text-gray-500">Sports Gold</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Grayscale</h3>
        <div className="grid grid-cols-5 gap-4">
          {[
            { color: 'bg-gray-900', hex: '#111827', name: 'Gray 900' },
            { color: 'bg-gray-700', hex: '#374151', name: 'Gray 700' },
            { color: 'bg-gray-500', hex: '#6B7280', name: 'Gray 500' },
            { color: 'bg-gray-300', hex: '#D1D5DB', name: 'Gray 300' },
            { color: 'bg-gray-100', hex: '#F3F4F6', name: 'Gray 100' }
          ].map(item => (
            <div key={item.hex} className="space-y-2">
              <div className={`h-24 ${item.color} rounded-lg shadow-md`}></div>
              <div className="text-sm font-mono text-gray-600">{item.hex}</div>
              <div className="text-xs text-gray-500">{item.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Typography() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Headings</h3>
        <div className="space-y-4">
          <div className="text-5xl font-bold text-gray-900">Heading 1 - 48px Bold</div>
          <div className="text-4xl font-bold text-gray-900">Heading 2 - 36px Bold</div>
          <div className="text-3xl font-bold text-gray-900">Heading 3 - 30px Bold</div>
          <div className="text-2xl font-bold text-gray-900">Heading 4 - 24px Bold</div>
          <div className="text-xl font-bold text-gray-900">Heading 5 - 20px Bold</div>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Body Text</h3>
        <div className="space-y-3">
          <div className="text-lg text-gray-900">Large body text - 18px Regular</div>
          <div className="text-base text-gray-900">Default body text - 16px Regular</div>
          <div className="text-sm text-gray-900">Small text - 14px Regular</div>
          <div className="text-xs text-gray-900">Extra small text - 12px Regular</div>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Font Weights</h3>
        <div className="space-y-2 text-lg">
          <div className="font-light text-gray-900">Light - 300</div>
          <div className="font-normal text-gray-900">Regular - 400</div>
          <div className="font-medium text-gray-900">Medium - 500</div>
          <div className="font-semibold text-gray-900">Semibold - 600</div>
          <div className="font-bold text-gray-900">Bold - 700</div>
          <div className="font-extrabold text-gray-900">Extrabold - 800</div>
        </div>
      </div>
    </div>
  );
}

function Buttons() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Button Styles</h3>
        <div className="flex flex-wrap gap-4">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-sm hover:shadow-md transition-all transform hover:-translate-y-0.5">
            Primary Button
          </button>
          <button className="px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all">
            Secondary Button
          </button>
          <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all">
            Ghost Button
          </button>
          <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 shadow-sm transition-all">
            Success Button
          </button>
          <button className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 shadow-sm transition-all">
            Danger Button
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Button Sizes</h3>
        <div className="flex flex-wrap items-center gap-4">
          <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700">
            Small
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">
            Medium
          </button>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg text-base font-semibold hover:bg-blue-700">
            Large
          </button>
          <button className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700">
            Extra Large
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Icon Buttons</h3>
        <div className="flex flex-wrap gap-4">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            <span>With Icon</span>
          </button>
          <button className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Star className="w-5 h-5" />
          </button>
          <button className="p-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Cards() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Card Styles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all">
            <h4 className="text-lg font-bold text-gray-900 mb-2">Standard Card</h4>
            <p className="text-gray-600 text-sm mb-4">
              Clean and simple card with subtle shadow and hover effect.
            </p>
            <button className="text-blue-600 font-semibold text-sm hover:text-blue-700">
              Learn more →
            </button>
          </div>

          <div className="bg-white rounded-lg border-2 border-green-500 p-6 shadow-md hover:shadow-xl transition-all relative">
            <div className="absolute top-3 right-3">
              <span className="flex items-center px-2.5 py-1 bg-green-100 text-green-800 rounded-full">
                <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-1.5 animate-pulse"></span>
                <span className="text-xs font-bold uppercase">Live</span>
              </span>
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Live Event Card</h4>
            <p className="text-gray-600 text-sm mb-4">
              Emphasized card with green border and live indicator.
            </p>
            <button className="text-green-600 font-semibold text-sm hover:text-green-700">
              View event →
            </button>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold uppercase tracking-wide opacity-90">
                Total Players
              </div>
              <Users className="w-6 h-6 opacity-80" />
            </div>
            <div className="text-4xl font-bold mb-2">12,482</div>
            <div className="text-sm text-blue-100">↑ 12% from last month</div>
          </div>

          <div className="bg-white rounded-lg border-2 border-yellow-400 p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-yellow-900" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900">Achievement</h4>
                <p className="text-xs text-gray-600">Championship Winner</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Congratulations on winning the tournament!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Badges() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Status Badges</h3>
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold uppercase">
            <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-1.5 animate-pulse"></span>
            Live
          </span>
          <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold uppercase">
            Upcoming
          </span>
          <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold uppercase">
            Completed
          </span>
          <span className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold uppercase">
            <AlertCircle className="w-3 h-3 mr-1" />
            Urgent
          </span>
          <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold uppercase">
            New
          </span>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Sport Tags</h3>
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 border-2 border-green-200 rounded-lg text-sm font-semibold">
            <span className="text-lg mr-1.5">🏌️</span>
            Golf
          </span>
          <span className="inline-flex items-center px-3 py-1.5 bg-yellow-50 text-yellow-700 border-2 border-yellow-200 rounded-lg text-sm font-semibold">
            <span className="text-lg mr-1.5">🏓</span>
            Pickleball
          </span>
          <span className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 border-2 border-red-200 rounded-lg text-sm font-semibold">
            <span className="text-lg mr-1.5">🎳</span>
            Bowling
          </span>
          <span className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 border-2 border-blue-200 rounded-lg text-sm font-semibold">
            <span className="text-lg mr-1.5">⚾</span>
            Softball
          </span>
          <span className="inline-flex items-center px-3 py-1.5 bg-lime-50 text-lime-700 border-2 border-lime-200 rounded-lg text-sm font-semibold">
            <span className="text-lg mr-1.5">🎾</span>
            Tennis
          </span>
          <span className="inline-flex items-center px-3 py-1.5 bg-emerald-50 text-emerald-700 border-2 border-emerald-200 rounded-lg text-sm font-semibold">
            <span className="text-lg mr-1.5">⚽</span>
            Soccer
          </span>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Notification Badges</h3>
        <div className="flex flex-wrap gap-4">
          <div className="relative inline-flex">
            <button className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200">
              <Bell className="w-5 h-5 text-gray-700" />
            </button>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
              5
            </span>
          </div>
          <div className="relative inline-flex">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              Messages
            </button>
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
              12
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Forms() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Input Fields</h3>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Default Input
            </label>
            <input
              type="text"
              placeholder="Enter text..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              With Icon
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
              />
              <Trophy className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Dropdown
            </label>
            <select className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none bg-white transition-all">
              <option>Choose an option...</option>
              <option>Option 1</option>
              <option>Option 2</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Textarea
            </label>
            <textarea
              rows={4}
              placeholder="Enter description..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all resize-none"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Checkboxes & Radio</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-5 h-5 text-blue-600 rounded border-gray-300" />
            <span className="text-gray-700">Checkbox option</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="radio" name="radio" className="w-5 h-5 text-blue-600 border-gray-300" />
            <span className="text-gray-700">Radio option 1</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="radio" name="radio" className="w-5 h-5 text-blue-600 border-gray-300" />
            <span className="text-gray-700">Radio option 2</span>
          </label>
        </div>
      </div>
    </div>
  );
}

function Stats() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Score Display</h3>
        <div className="flex items-center gap-8">
          <div className="text-center">
            <div className="text-6xl font-bold text-blue-600 font-mono">72</div>
            <div className="text-sm text-gray-600 mt-2">Golf Score</div>
          </div>
          <div className="text-center">
            <div className="text-6xl font-bold text-green-600 font-mono">28%</div>
            <div className="text-sm text-gray-600 mt-2">Win Chance</div>
          </div>
          <div className="text-center">
            <div className="text-6xl font-bold text-purple-600 font-mono">-8</div>
            <div className="text-sm text-gray-600 mt-2">Score Relative to Par</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Stats Grid</h3>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Handicap', value: '12.4', trend: '↓ 0.3' },
            { label: 'Avg Score', value: '86', trend: '↑ 2' },
            { label: 'Rounds', value: '24', trend: '+6' },
            { label: 'Fairways', value: '68%', trend: '↑ 4%' }
          ].map((stat, idx) => (
            <div key={idx} className="text-center p-4 bg-white rounded-lg border border-gray-200">
              <div className="text-xs text-gray-600 uppercase tracking-wide mb-2">
                {stat.label}
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-green-600 font-semibold">
                {stat.trend}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Progress Bars</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-gray-700">Win Rate</span>
              <span className="text-gray-600">68%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{width: '68%'}}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-gray-700">Tournament Progress</span>
              <span className="text-gray-600">45%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-600 rounded-full" style={{width: '45%'}}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SportBranding() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Sport-Specific Cards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-700 to-green-900 rounded-lg p-6 text-white">
            <div className="text-4xl mb-3">🏌️</div>
            <h4 className="text-xl font-bold mb-2">Golf League</h4>
            <p className="text-green-100 text-sm mb-4">Monday evenings at Desert Ridge</p>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-yellow-500 text-yellow-900 rounded-full text-xs font-bold">
                18 Holes
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">
                32 Players
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg p-6 text-gray-900">
            <div className="text-4xl mb-3">🏓</div>
            <h4 className="text-xl font-bold mb-2">Pickleball Ladder</h4>
            <p className="text-yellow-900 text-sm mb-4">Weekend tournaments at Metro Center</p>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-teal-600 text-white rounded-full text-xs font-bold">
                Doubles
              </span>
              <span className="px-3 py-1 bg-white/40 rounded-full text-xs font-bold">
                3.5-4.0
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-lg p-6 text-white">
            <div className="text-4xl mb-3">🎳</div>
            <h4 className="text-xl font-bold mb-2">Bowling League</h4>
            <p className="text-red-100 text-sm mb-4">Thursday nights at Sunset Lanes</p>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-900 text-white rounded-full text-xs font-bold">
                Teams of 5
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">
                Handicap
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-lg p-6 text-white">
            <div className="text-4xl mb-3">⚾</div>
            <h4 className="text-xl font-bold mb-2">Softball League</h4>
            <p className="text-blue-100 text-sm mb-4">Sunday games at Westside Complex</p>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-bold">
                Co-Ed
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">
                12 Teams
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-lime-500 to-lime-700 rounded-lg p-6 text-white">
            <div className="text-4xl mb-3">🎾</div>
            <h4 className="text-xl font-bold mb-2">Tennis Ladder</h4>
            <p className="text-lime-100 text-sm mb-4">Weekly matches at Phoenix Tennis Center</p>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold">
                Singles
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">
                NTRP 4.0+
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-lg p-6 text-white">
            <div className="text-4xl mb-3">⚽</div>
            <h4 className="text-xl font-bold mb-2">Soccer League</h4>
            <p className="text-emerald-100 text-sm mb-4">Indoor games at Valley Sports Arena</p>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-bold">
                7v7
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">
                8 Teams
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StyleGuidePage() {
  const [activeSection, setActiveSection] = useState('colors');

  const renderSection = () => {
    switch(activeSection) {
      case 'colors': return <ColorPalette />;
      case 'typography': return <Typography />;
      case 'buttons': return <Buttons />;
      case 'cards': return <Cards />;
      case 'badges': return <Badges />;
      case 'forms': return <Forms />;
      case 'stats': return <Stats />;
      case 'sports': return <SportBranding />;
      default: return <ColorPalette />;
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] -mx-4 sm:-mx-6 lg:-mx-8 -my-8">
      <div className="w-64 bg-white border-r border-gray-200 p-6 fixed h-[calc(100vh-80px)] overflow-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Design System</h1>
          </div>
          <p className="text-sm text-gray-600">League Platform Style Guide</p>
        </div>

        <nav className="space-y-1">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeSection === section.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {section.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="ml-64 flex-1 p-12 bg-gray-50">
        <div className="max-w-6xl">
          {renderSection()}
        </div>
      </div>
    </div>
  );
}
