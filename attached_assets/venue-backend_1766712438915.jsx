import React, { useState } from 'react';
import { LayoutDashboard, Trophy, Calendar, Users, DollarSign, Bell, Settings, BarChart3, Plus, Edit, Eye, Mail, MessageSquare, FileText, TrendingUp, Clock, MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const VenueBackend = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateLeague, setShowCreateLeague] = useState(false);

  const venueData = {
    name: 'Desert Ridge Golf Club',
    activeLeagues: 8,
    totalPlayers: 342,
    monthlyRevenue: 45600,
    capacity: 85
  };

  const activeLeagues = [
    {
      id: 1,
      name: 'Monday Night Golf League',
      sport: 'golf',
      icon: '🏌️',
      participants: 32,
      capacity: 32,
      startDate: 'Jan 6, 2025',
      status: 'active',
      revenue: '$14,400',
      nextEvent: 'Jan 6, 5:30 PM'
    },
    {
      id: 2,
      name: 'Wednesday Scramble Series',
      sport: 'golf',
      icon: '🏌️',
      participants: 48,
      capacity: 48,
      startDate: 'Jan 8, 2025',
      status: 'active',
      revenue: '$21,600',
      nextEvent: 'Jan 8, 3:00 PM'
    },
    {
      id: 3,
      name: 'Friday Couples League',
      sport: 'golf',
      icon: '🏌️',
      participants: 24,
      capacity: 32,
      startDate: 'Jan 10, 2025',
      status: 'open',
      revenue: '$10,800',
      nextEvent: 'Jan 10, 4:00 PM'
    }
  ];

  const registrations = [
    {
      id: 1,
      player: 'Mike Thompson',
      league: 'Monday Night Golf League',
      date: 'Dec 20, 2025',
      status: 'pending',
      fee: '$450',
      handicap: 14.2
    },
    {
      id: 2,
      player: 'Sarah Chen',
      league: 'Wednesday Scramble Series',
      date: 'Dec 21, 2025',
      status: 'pending',
      fee: '$450',
      handicap: 18.5
    },
    {
      id: 3,
      player: 'John Martinez',
      league: 'Friday Couples League',
      date: 'Dec 22, 2025',
      status: 'approved',
      fee: '$450',
      handicap: 9.8
    }
  ];

  const DashboardTab = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Active Leagues</div>
              <div className="text-3xl font-bold text-gray-900">{venueData.activeLeagues}</div>
              <div className="text-xs text-green-600 mt-1">+2 from last month</div>
            </div>
            <Trophy className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Total Players</div>
              <div className="text-3xl font-bold text-gray-900">{venueData.totalPlayers}</div>
              <div className="text-xs text-green-600 mt-1">+48 this month</div>
            </div>
            <Users className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Monthly Revenue</div>
              <div className="text-3xl font-bold text-gray-900">${(venueData.monthlyRevenue/1000).toFixed(1)}k</div>
              <div className="text-xs text-green-600 mt-1">+12% from last month</div>
            </div>
            <DollarSign className="w-10 h-10 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Capacity</div>
              <div className="text-3xl font-bold text-gray-900">{venueData.capacity}%</div>
              <div className="text-xs text-gray-600 mt-1">Across all leagues</div>
            </div>
            <TrendingUp className="w-10 h-10 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Pending Registrations</h3>
          <div className="space-y-3">
            {registrations.filter(r => r.status === 'pending').map(reg => (
              <div key={reg.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{reg.player}</div>
                  <div className="text-sm text-gray-600">{reg.league}</div>
                  <div className="text-xs text-gray-500 mt-1">Handicap: {reg.handicap}</div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 bg-green-600 text-white rounded hover:bg-green-700">
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-red-600 text-white rounded hover:bg-red-700">
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            {activeLeagues.slice(0, 3).map(league => (
              <div key={league.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{league.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900">{league.name}</div>
                    <div className="text-sm text-gray-600 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{league.nextEvent}</span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {league.participants}/{league.capacity}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Chart Placeholder */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Trend</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-gray-400">Chart visualization would go here</div>
        </div>
      </div>
    </div>
  );

  const LeagueManagementTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">League Management</h2>
        <button 
          onClick={() => setShowCreateLeague(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          <span>Create New League</span>
        </button>
      </div>

      {/* League List */}
      <div className="grid grid-cols-1 gap-4">
        {activeLeagues.map(league => (
          <div key={league.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <span className="text-4xl">{league.icon}</span>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-bold text-gray-900">{league.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      league.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {league.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    <div>
                      <div className="text-xs text-gray-500">Participants</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {league.participants}/{league.capacity}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Start Date</div>
                      <div className="text-lg font-semibold text-gray-900">{league.startDate}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Revenue</div>
                      <div className="text-lg font-semibold text-gray-900">{league.revenue}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Next Event</div>
                      <div className="text-sm font-semibold text-gray-900">{league.nextEvent}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Schedule</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const CreateLeagueWizard = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto m-4">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Create New League</h2>
          <button 
            onClick={() => setShowCreateLeague(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Step 1: Basic Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">1. Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  League Name
                </label>
                <input 
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., Monday Night Golf League"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sport
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option>Golf</option>
                  <option>Pickleball</option>
                  <option>Bowling</option>
                  <option>Softball</option>
                  <option>Tennis</option>
                  <option>Soccer</option>
                </select>
              </div>
            </div>
          </div>

          {/* Step 2: Format */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">2. League Format</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Format Type
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option>Stroke Play</option>
                  <option>Match Play</option>
                  <option>Stableford</option>
                  <option>Scramble</option>
                  <option>Best Ball</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skill Level
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option>All Levels</option>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                  <option>By Handicap (Flights)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Step 3: Schedule */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">3. Schedule</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input 
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Day of Week
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option>Monday</option>
                  <option>Tuesday</option>
                  <option>Wednesday</option>
                  <option>Thursday</option>
                  <option>Friday</option>
                  <option>Saturday</option>
                  <option>Sunday</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tee Time
                </label>
                <input 
                  type="time"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Weeks
                </label>
                <input 
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="12"
                />
              </div>
            </div>
          </div>

          {/* Step 4: Pricing */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">4. Pricing & Capacity</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entry Fee
                </label>
                <input 
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="450"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Participants
                </label>
                <input 
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="32"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Early Bird Discount
                </label>
                <input 
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="50"
                />
              </div>
            </div>
          </div>

          {/* Step 5: Registration */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">5. Registration Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Opens
                </label>
                <input 
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Deadline
                </label>
                <input 
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <button 
              onClick={() => setShowCreateLeague(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Create League
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const RegistrationTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Registration Management</h2>
        <div className="flex space-x-2">
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            All
          </button>
          <button className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg">
            Pending ({registrations.filter(r => r.status === 'pending').length})
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            Approved
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Player</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">League</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Handicap</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {registrations.map(reg => (
              <tr key={reg.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{reg.player}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{reg.league}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{reg.date}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{reg.handicap}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{reg.fee}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    reg.status === 'pending' 
                      ? 'bg-orange-100 text-orange-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {reg.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  {reg.status === 'pending' ? (
                    <div className="flex space-x-2">
                      <button className="text-green-600 hover:text-green-800">Approve</button>
                      <button className="text-red-600 hover:text-red-800">Deny</button>
                    </div>
                  ) : (
                    <button className="text-blue-600 hover:text-blue-800">View</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const CommunicationTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Communication Center</h2>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Create Announcement</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Audience
            </label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option>All Players</option>
              <option>Monday Night Golf League</option>
              <option>Wednesday Scramble Series</option>
              <option>Friday Couples League</option>
              <option>Custom Selection</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Announcement Type
            </label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option>New League</option>
              <option>Schedule Change</option>
              <option>Results</option>
              <option>Weather Alert</option>
              <option>General Announcement</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input 
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Enter announcement title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg h-32"
              placeholder="Enter announcement details..."
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
              <span className="text-sm text-gray-700">Send push notification</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
              <span className="text-sm text-gray-700">Send email</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
              <span className="text-sm text-gray-700">Send SMS</span>
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Save Draft
            </button>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Send Now
            </button>
          </div>
        </div>
      </div>

      {/* Recent Announcements */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Announcements</h3>
        <div className="space-y-3">
          {[
            { title: 'New Spring League Registration Open', date: 'Dec 20', audience: 'All Players', views: 142 },
            { title: 'Weather Alert - Course Closed Today', date: 'Dec 18', audience: 'Monday Night League', views: 32 },
            { title: 'Week 8 Results Posted', date: 'Dec 17', audience: 'All Active Leagues', views: 89 }
          ].map((ann, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">{ann.title}</div>
                <div className="text-sm text-gray-600 mt-1">{ann.audience} • {ann.date}</div>
              </div>
              <div className="text-sm text-gray-600">{ann.views} views</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const AnalyticsTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Total Revenue (YTD)</div>
          <div className="text-3xl font-bold text-gray-900">$547k</div>
          <div className="text-sm text-green-600 mt-2">+24% vs last year</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Player Retention</div>
          <div className="text-3xl font-bold text-gray-900">87%</div>
          <div className="text-sm text-green-600 mt-2">+5% from last season</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Avg. League Size</div>
          <div className="text-3xl font-bold text-gray-900">42</div>
          <div className="text-sm text-gray-600 mt-2">players per league</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Capacity Rate</div>
          <div className="text-3xl font-bold text-gray-900">85%</div>
          <div className="text-sm text-gray-600 mt-2">across all leagues</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by League</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-gray-400">Chart visualization</div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Trends</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-gray-400">Chart visualization</div>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'leagues', name: 'League Management', icon: Trophy },
    { id: 'registrations', name: 'Registrations', icon: Users },
    { id: 'communication', name: 'Communications', icon: Bell },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <MapPin className="w-8 h-8 text-blue-600" />
            <div>
              <div className="font-bold text-gray-900">League Platform</div>
              <div className="text-sm text-gray-500">Venue Portal</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.name}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="font-medium text-gray-900">{venueData.name}</div>
          <div className="text-sm text-gray-500">Venue Account</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'leagues' && <LeagueManagementTab />}
          {activeTab === 'registrations' && <RegistrationTab />}
          {activeTab === 'communication' && <CommunicationTab />}
          {activeTab === 'analytics' && <AnalyticsTab />}
          {activeTab === 'settings' && (
            <div className="text-center py-12">
              <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <div className="text-gray-500">Settings feature coming soon</div>
            </div>
          )}
        </div>
      </div>

      {/* Create League Modal */}
      {showCreateLeague && <CreateLeagueWizard />}
    </div>
  );
};

export default VenueBackend;
