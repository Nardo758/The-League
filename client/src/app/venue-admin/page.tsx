'use client';

import { useState } from 'react';
import { LayoutDashboard, Trophy, Calendar, Users, DollarSign, Bell, Settings, BarChart3, Plus, Edit, Eye, TrendingUp, Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';

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

const tabs = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'leagues', name: 'League Management', icon: Trophy },
  { id: 'registrations', name: 'Registrations', icon: Users },
  { id: 'communication', name: 'Communications', icon: Bell },
  { id: 'analytics', name: 'Analytics', icon: BarChart3 },
  { id: 'settings', name: 'Settings', icon: Settings }
];

function DashboardTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted">Active Leagues</div>
              <div className="text-3xl font-bold text-foreground">{venueData.activeLeagues}</div>
              <div className="text-xs text-success mt-1">+2 from last month</div>
            </div>
            <Trophy className="w-10 h-10 text-accent" />
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted">Total Players</div>
              <div className="text-3xl font-bold text-foreground">{venueData.totalPlayers}</div>
              <div className="text-xs text-success mt-1">+48 this month</div>
            </div>
            <Users className="w-10 h-10 text-success" />
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted">Monthly Revenue</div>
              <div className="text-3xl font-bold text-foreground">${(venueData.monthlyRevenue/1000).toFixed(1)}k</div>
              <div className="text-xs text-success mt-1">+12% from last month</div>
            </div>
            <DollarSign className="w-10 h-10 text-purple-600" />
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted">Capacity</div>
              <div className="text-3xl font-bold text-foreground">{venueData.capacity}%</div>
              <div className="text-xs text-muted mt-1">Across all leagues</div>
            </div>
            <TrendingUp className="w-10 h-10 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Pending Registrations</h3>
          <div className="space-y-3">
            {registrations.filter(r => r.status === 'pending').map(reg => (
              <div key={reg.id} className="flex items-center justify-between p-3 bg-card-hover rounded-lg">
                <div>
                  <div className="font-medium text-foreground">{reg.player}</div>
                  <div className="text-sm text-muted">{reg.league}</div>
                  <div className="text-xs text-muted mt-1">Handicap: {reg.handicap}</div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 bg-success text-white rounded hover:opacity-90">
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-error text-white rounded hover:opacity-90">
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            {activeLeagues.slice(0, 3).map(league => (
              <div key={league.id} className="flex items-center justify-between p-3 bg-card-hover rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{league.icon}</span>
                  <div>
                    <div className="font-medium text-foreground">{league.name}</div>
                    <div className="text-sm text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{league.nextEvent}</span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-muted">
                  {league.participants}/{league.capacity}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Revenue Trend</h3>
        <div className="h-64 bg-card-hover rounded-lg flex items-center justify-center">
          <div className="text-muted">Chart visualization would go here</div>
        </div>
      </div>
    </div>
  );
}

function LeagueManagementTab({ onCreateLeague }: { onCreateLeague: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">League Management</h2>
        <button 
          onClick={onCreateLeague}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover"
        >
          <Plus className="w-5 h-5" />
          <span>Create New League</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {activeLeagues.map(league => (
          <div key={league.id} className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <span className="text-4xl">{league.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-foreground">{league.name}</h3>
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
                      <div className="text-xs text-muted">Participants</div>
                      <div className="text-lg font-semibold text-foreground">
                        {league.participants}/{league.capacity}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted">Start Date</div>
                      <div className="text-lg font-semibold text-foreground">{league.startDate}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted">Revenue</div>
                      <div className="text-lg font-semibold text-foreground">{league.revenue}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted">Next Event</div>
                      <div className="text-sm font-semibold text-foreground">{league.nextEvent}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover text-sm">
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-card-hover text-sm">
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-card-hover text-sm">
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
}

function CreateLeagueModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto m-4 border border-border">
        <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card">
          <h2 className="text-2xl font-bold text-foreground">Create New League</h2>
          <button onClick={onClose} className="text-muted hover:text-foreground">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">1. Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">League Name</label>
                <input type="text" className="w-full px-4 py-2 border border-border rounded-lg bg-card" placeholder="e.g., Monday Night Golf League" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Sport</label>
                <select className="w-full px-4 py-2 border border-border rounded-lg bg-card">
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

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">2. League Format</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Format Type</label>
                <select className="w-full px-4 py-2 border border-border rounded-lg bg-card">
                  <option>Stroke Play</option>
                  <option>Match Play</option>
                  <option>Stableford</option>
                  <option>Scramble</option>
                  <option>Best Ball</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Skill Level</label>
                <select className="w-full px-4 py-2 border border-border rounded-lg bg-card">
                  <option>All Levels</option>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                  <option>By Handicap (Flights)</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">3. Schedule</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Start Date</label>
                <input type="date" className="w-full px-4 py-2 border border-border rounded-lg bg-card" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Day of Week</label>
                <select className="w-full px-4 py-2 border border-border rounded-lg bg-card">
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
                <label className="block text-sm font-medium text-foreground mb-2">Time</label>
                <input type="time" className="w-full px-4 py-2 border border-border rounded-lg bg-card" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">4. Pricing & Capacity</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Entry Fee ($)</label>
                <input type="number" className="w-full px-4 py-2 border border-border rounded-lg bg-card" placeholder="450" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Max Participants</label>
                <input type="number" className="w-full px-4 py-2 border border-border rounded-lg bg-card" placeholder="32" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Early Bird Discount ($)</label>
                <input type="number" className="w-full px-4 py-2 border border-border rounded-lg bg-card" placeholder="50" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-border">
            <button onClick={onClose} className="px-6 py-2 border border-border text-foreground rounded-lg hover:bg-card-hover">
              Cancel
            </button>
            <button className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover">
              Create League
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RegistrationTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Registration Management</h2>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-card-hover">All</button>
          <button className="px-4 py-2 bg-warning/20 text-warning rounded-lg">
            Pending ({registrations.filter(r => r.status === 'pending').length})
          </button>
          <button className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-card-hover">Approved</button>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-card-hover border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Player</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">League</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Handicap</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Fee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {registrations.map(reg => (
              <tr key={reg.id} className="hover:bg-card-hover">
                <td className="px-6 py-4 text-sm font-medium text-foreground">{reg.player}</td>
                <td className="px-6 py-4 text-sm text-muted">{reg.league}</td>
                <td className="px-6 py-4 text-sm text-muted">{reg.date}</td>
                <td className="px-6 py-4 text-sm text-muted">{reg.handicap}</td>
                <td className="px-6 py-4 text-sm text-muted">{reg.fee}</td>
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
                    <div className="flex gap-2">
                      <button className="text-success hover:opacity-80">Approve</button>
                      <button className="text-error hover:opacity-80">Deny</button>
                    </div>
                  ) : (
                    <button className="text-accent hover:opacity-80">View</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CommunicationTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Communication Center</h2>

      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Create Announcement</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Target Audience</label>
            <select className="w-full px-4 py-2 border border-border rounded-lg bg-card">
              <option>All Players</option>
              <option>Monday Night Golf League</option>
              <option>Wednesday Scramble Series</option>
              <option>Friday Couples League</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Announcement Type</label>
            <select className="w-full px-4 py-2 border border-border rounded-lg bg-card">
              <option>New League</option>
              <option>Schedule Change</option>
              <option>Results</option>
              <option>Weather Alert</option>
              <option>General Announcement</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Title</label>
            <input type="text" className="w-full px-4 py-2 border border-border rounded-lg bg-card" placeholder="Enter announcement title" />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Message</label>
            <textarea className="w-full px-4 py-2 border border-border rounded-lg bg-card h-32" placeholder="Enter announcement details..." />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4 text-accent rounded" />
              <span className="text-sm text-foreground">Send push notification</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4 text-accent rounded" />
              <span className="text-sm text-foreground">Send email</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4 text-accent rounded" />
              <span className="text-sm text-foreground">Send SMS</span>
            </label>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-border">
            <button className="px-6 py-2 border border-border text-foreground rounded-lg hover:bg-card-hover">Save Draft</button>
            <button className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover">Send Now</button>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Recent Announcements</h3>
        <div className="space-y-3">
          {[
            { title: 'New Spring League Registration Open', date: 'Dec 20', audience: 'All Players', views: 142 },
            { title: 'Weather Alert - Course Closed Today', date: 'Dec 18', audience: 'Monday Night League', views: 32 },
            { title: 'Week 8 Results Posted', date: 'Dec 17', audience: 'All Active Leagues', views: 89 }
          ].map((ann, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-card-hover rounded-lg">
              <div>
                <div className="font-medium text-foreground">{ann.title}</div>
                <div className="text-sm text-muted mt-1">{ann.audience} - {ann.date}</div>
              </div>
              <div className="text-sm text-muted">{ann.views} views</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalyticsTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Analytics Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="text-sm text-muted mb-1">Total Revenue (YTD)</div>
          <div className="text-3xl font-bold text-foreground">$547k</div>
          <div className="text-sm text-success mt-2">+24% vs last year</div>
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="text-sm text-muted mb-1">Player Retention</div>
          <div className="text-3xl font-bold text-foreground">87%</div>
          <div className="text-sm text-success mt-2">+5% from last season</div>
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="text-sm text-muted mb-1">Avg. League Size</div>
          <div className="text-3xl font-bold text-foreground">42</div>
          <div className="text-sm text-muted mt-2">players per league</div>
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="text-sm text-muted mb-1">Capacity Rate</div>
          <div className="text-3xl font-bold text-foreground">85%</div>
          <div className="text-sm text-muted mt-2">across all leagues</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Revenue by League</h3>
          <div className="h-64 bg-card-hover rounded-lg flex items-center justify-center">
            <div className="text-muted">Chart visualization</div>
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Registration Trends</h3>
          <div className="h-64 bg-card-hover rounded-lg flex items-center justify-center">
            <div className="text-muted">Chart visualization</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VenueAdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateLeague, setShowCreateLeague] = useState(false);

  return (
    <div className="flex min-h-[calc(100vh-80px)] -mx-4 sm:-mx-6 lg:-mx-8 -my-8">
      <div className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <MapPin className="w-8 h-8 text-accent" />
            <div>
              <div className="font-bold text-foreground">Venue Portal</div>
              <div className="text-sm text-muted">Admin Dashboard</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-accent/10 text-accent'
                  : 'text-muted hover:bg-card-hover'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.name}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="font-medium text-foreground">{venueData.name}</div>
          <div className="text-sm text-muted">Venue Account</div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'leagues' && <LeagueManagementTab onCreateLeague={() => setShowCreateLeague(true)} />}
        {activeTab === 'registrations' && <RegistrationTab />}
        {activeTab === 'communication' && <CommunicationTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'settings' && (
          <div className="text-center py-12">
            <Settings className="w-16 h-16 text-muted mx-auto mb-4" />
            <div className="text-muted">Settings feature coming soon</div>
          </div>
        )}
      </div>

      {showCreateLeague && <CreateLeagueModal onClose={() => setShowCreateLeague(false)} />}
    </div>
  );
}
