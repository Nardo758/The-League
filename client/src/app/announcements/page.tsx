'use client';

import { useState } from 'react';
import { Bell, BellRing, Filter, MapPin, Calendar, DollarSign, Users, AlertCircle, CheckCircle } from 'lucide-react';

interface Announcement {
  id: number;
  type: string;
  sport: string;
  icon: string;
  title: string;
  venue: string;
  description: string;
  startDate?: string;
  registrationDeadline?: string;
  fee?: string;
  spots?: string;
  distance?: string;
  skillLevel?: string;
  timestamp: string;
  urgent: boolean;
  newDate?: string;
  affectedTeams?: string[];
  highlights?: string[];
  playoffDate?: string;
  prizePool?: string;
}

const announcements: Announcement[] = [
  {
    id: 1,
    type: 'new-league',
    sport: 'golf',
    icon: '🏌️',
    title: 'New Spring Golf League at Desert Ridge',
    venue: 'Desert Ridge Golf Club',
    description: 'Monday evenings starting March 3rd. 18-hole stroke play league with flights by handicap.',
    startDate: 'Mar 3, 2025',
    registrationDeadline: 'Feb 15, 2025',
    fee: '$450',
    spots: '32 total / 8 remaining',
    distance: '4.2 miles',
    skillLevel: 'All levels',
    timestamp: '2 hours ago',
    urgent: false
  },
  {
    id: 2,
    type: 'schedule-change',
    sport: 'softball',
    icon: '⚾',
    title: 'RAINOUT: Thursday Night Softball - RESCHEDULED',
    venue: 'Westside Sports Complex',
    description: 'Due to field conditions, tonight\'s games are postponed. Makeup games scheduled for Monday, Dec 30th at 7:00 PM.',
    newDate: 'Dec 30, 2025 at 7:00 PM',
    affectedTeams: ['Thunder Bats', 'Diamond Kings', 'Home Runners', 'Strike Force'],
    timestamp: '45 minutes ago',
    urgent: true
  },
  {
    id: 3,
    type: 'registration',
    sport: 'pickleball',
    icon: '🏓',
    title: 'Last 3 Spots! Weekend Pickleball Ladder',
    venue: 'Metro Pickleball Center',
    description: 'Saturday morning ladder system. Play 3 matches each week, work your way up the rankings.',
    startDate: 'Jan 11, 2025',
    registrationDeadline: 'Jan 5, 2025',
    fee: '$180',
    spots: '24 total / 3 remaining',
    distance: '2.8 miles',
    skillLevel: '3.0-4.0',
    timestamp: '3 hours ago',
    urgent: false
  },
  {
    id: 4,
    type: 'results',
    sport: 'bowling',
    icon: '🎳',
    title: 'Week 8 Results Posted - Standings Updated',
    venue: 'Sunset Lanes',
    description: 'Check out this week\'s high games and series! Team standings have shifted with playoff implications.',
    highlights: [
      'High Game: Mike Johnson - 289',
      'High Series: Sarah Chen - 756',
      'Perfect Game: None this week'
    ],
    timestamp: '1 hour ago',
    urgent: false
  },
  {
    id: 5,
    type: 'new-tournament',
    sport: 'tennis',
    icon: '🎾',
    title: 'New Year Tennis Classic - January Tournament',
    venue: 'Phoenix Tennis Center',
    description: 'Single elimination tournament. Men\'s and Women\'s singles. Divisions by NTRP rating.',
    startDate: 'Jan 18-19, 2025',
    registrationDeadline: 'Jan 10, 2025',
    fee: '$75',
    prizePool: '$2,000',
    spots: 'Open',
    distance: '6.1 miles',
    skillLevel: '3.5-5.0 NTRP',
    timestamp: '5 hours ago',
    urgent: false
  },
  {
    id: 6,
    type: 'venue-announcement',
    sport: 'soccer',
    icon: '⚽',
    title: 'New Indoor Facility Opening - League Signups Open',
    venue: 'Valley Sports Arena',
    description: 'Brand new indoor soccer facility opening January 2025! 5v5 and 7v7 leagues forming now.',
    startDate: 'Multiple leagues starting Jan-Feb',
    registrationDeadline: 'Rolling registration',
    fee: '$350-$450',
    distance: '8.3 miles',
    timestamp: '1 day ago',
    urgent: false
  },
  {
    id: 7,
    type: 'registration',
    sport: 'golf',
    icon: '🏌️',
    title: 'Early Bird Pricing Ends Soon - Wednesday Golf League',
    venue: 'Papago Golf Course',
    description: 'Save $50 with early registration! 9-hole evening league, team scramble format.',
    startDate: 'Feb 5, 2025',
    registrationDeadline: 'Jan 30, 2025 (early bird), Feb 1 (regular)',
    fee: '$200 (early) / $250 (regular)',
    spots: '48 total / 22 remaining',
    distance: '5.7 miles',
    skillLevel: 'All levels',
    timestamp: '6 hours ago',
    urgent: false
  },
  {
    id: 8,
    type: 'schedule-change',
    sport: 'pickleball',
    icon: '🏓',
    title: 'Playoff Brackets Released - Friday League',
    venue: 'Metro Pickleball Center',
    description: 'Regular season complete! Playoff brackets are now available. Playoffs begin next Friday.',
    playoffDate: 'Dec 27, 2025',
    timestamp: '2 hours ago',
    urgent: false
  }
];

const sports = [
  { id: 'all', name: 'All Sports', icon: '🏆' },
  { id: 'golf', name: 'Golf', icon: '🏌️' },
  { id: 'pickleball', name: 'Pickleball', icon: '🏓' },
  { id: 'bowling', name: 'Bowling', icon: '🎳' },
  { id: 'softball', name: 'Softball', icon: '⚾' },
  { id: 'tennis', name: 'Tennis', icon: '🎾' },
  { id: 'soccer', name: 'Soccer', icon: '⚽' }
];

const types = [
  { id: 'all', name: 'All Updates' },
  { id: 'new-league', name: 'New Leagues' },
  { id: 'new-tournament', name: 'Tournaments' },
  { id: 'registration', name: 'Registration' },
  { id: 'schedule-change', name: 'Schedule Changes' },
  { id: 'results', name: 'Results' },
  { id: 'venue-announcement', name: 'Venue News' }
];

export default function AnnouncementsPage() {
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    golf: true,
    pickleball: true,
    bowling: false,
    softball: true,
    tennis: false,
    soccer: true,
    newLeagues: true,
    scheduleChanges: true,
    results: true,
    registration: true,
    withinMiles: 25,
    priceMax: 500
  });

  const filteredAnnouncements = announcements.filter(a => {
    if (selectedSport !== 'all' && a.sport !== selectedSport) return false;
    if (selectedType !== 'all' && a.type !== selectedType) return false;
    return true;
  });

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'new-league': 'bg-green-100 text-green-800',
      'new-tournament': 'bg-purple-100 text-purple-800',
      'registration': 'bg-blue-100 text-blue-800',
      'schedule-change': 'bg-orange-100 text-orange-800',
      'results': 'bg-gray-100 text-gray-800',
      'venue-announcement': 'bg-indigo-100 text-indigo-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'new-league': 'New League',
      'new-tournament': 'Tournament',
      'registration': 'Registration',
      'schedule-change': 'Schedule Update',
      'results': 'Results',
      'venue-announcement': 'Venue News'
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Bell className="w-8 h-8 text-accent" />
            <span>Announcement Board</span>
          </h1>
          <p className="text-muted mt-1">Stay updated on leagues, tournaments, and events near you</p>
        </div>
        <button
          onClick={() => setShowNotificationSettings(!showNotificationSettings)}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors"
        >
          <BellRing className="w-5 h-5" />
          <span>Notification Settings</span>
        </button>
      </div>

      {showNotificationSettings && (
        <div className="bg-accent/5 border border-accent/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Notification Preferences</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-3">Sports to Follow</h4>
              <div className="space-y-2">
                {sports.slice(1).map(sport => (
                  <label key={sport.id} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings[sport.id as keyof typeof notificationSettings] as boolean}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        [sport.id]: e.target.checked
                      })}
                      className="w-4 h-4 text-accent rounded"
                    />
                    <span className="text-2xl">{sport.icon}</span>
                    <span className="text-sm text-foreground">{sport.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-3">Notification Types</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.newLeagues}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      newLeagues: e.target.checked
                    })}
                    className="w-4 h-4 text-accent rounded"
                  />
                  <span className="text-sm text-foreground">New leagues & tournaments</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.scheduleChanges}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      scheduleChanges: e.target.checked
                    })}
                    className="w-4 h-4 text-accent rounded"
                  />
                  <span className="text-sm text-foreground">Schedule changes & rain-outs</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.results}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      results: e.target.checked
                    })}
                    className="w-4 h-4 text-accent rounded"
                  />
                  <span className="text-sm text-foreground">Results & standings updates</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.registration}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      registration: e.target.checked
                    })}
                    className="w-4 h-4 text-accent rounded"
                  />
                  <span className="text-sm text-foreground">Registration deadlines & spots</span>
                </label>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-3">Location Preferences</h4>
              <div>
                <label className="text-sm text-muted block mb-1">Maximum distance from me</label>
                <select 
                  value={notificationSettings.withinMiles}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    withinMiles: parseInt(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card"
                >
                  <option value="5">5 miles</option>
                  <option value="10">10 miles</option>
                  <option value="25">25 miles</option>
                  <option value="50">50 miles</option>
                  <option value="999">Any distance</option>
                </select>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-3">Price Range</h4>
              <div>
                <label className="text-sm text-muted block mb-1">Maximum league/tournament fee</label>
                <select
                  value={notificationSettings.priceMax}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    priceMax: parseInt(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card"
                >
                  <option value="100">Up to $100</option>
                  <option value="250">Up to $250</option>
                  <option value="500">Up to $500</option>
                  <option value="1000">Up to $1,000</option>
                  <option value="9999">Any price</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between pt-4 border-t border-border">
            <div className="text-sm text-muted flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-success" />
              Settings saved automatically
            </div>
            <button 
              onClick={() => setShowNotificationSettings(false)}
              className="px-4 py-2 text-sm font-medium text-muted hover:text-foreground"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 overflow-x-auto pb-2">
        <Filter className="w-5 h-5 text-muted flex-shrink-0" />
        
        <div className="flex gap-2">
          {sports.map(sport => (
            <button
              key={sport.id}
              onClick={() => setSelectedSport(sport.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedSport === sport.id
                  ? 'bg-accent/10 text-accent'
                  : 'bg-card text-muted hover:bg-card-hover'
              }`}
            >
              <span className="mr-1">{sport.icon}</span>
              {sport.name}
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-border" />

        <div className="flex gap-2">
          {types.map(type => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedType === type.id
                  ? 'bg-accent/10 text-accent'
                  : 'bg-card text-muted hover:bg-card-hover'
              }`}
            >
              {type.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredAnnouncements.map(announcement => (
          <div 
            key={announcement.id}
            className={`bg-card rounded-lg border-2 p-6 hover:shadow-lg transition-shadow ${
              announcement.urgent ? 'border-warning bg-warning/5' : 'border-border'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{announcement.icon}</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(announcement.type)}`}>
                      {getTypeLabel(announcement.type)}
                    </span>
                    {announcement.urgent && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Urgent
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-2">{announcement.title}</h3>
                <div className="text-sm text-muted mb-1">{announcement.venue}</div>
                <p className="text-foreground mb-4">{announcement.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {announcement.startDate && (
                    <div className="flex items-center gap-2 text-muted">
                      <Calendar className="w-4 h-4" />
                      <span>{announcement.startDate}</span>
                    </div>
                  )}
                  {announcement.fee && (
                    <div className="flex items-center gap-2 text-muted">
                      <DollarSign className="w-4 h-4" />
                      <span>{announcement.fee}</span>
                    </div>
                  )}
                  {announcement.spots && (
                    <div className="flex items-center gap-2 text-muted">
                      <Users className="w-4 h-4" />
                      <span>{announcement.spots}</span>
                    </div>
                  )}
                  {announcement.distance && (
                    <div className="flex items-center gap-2 text-muted">
                      <MapPin className="w-4 h-4" />
                      <span>{announcement.distance}</span>
                    </div>
                  )}
                </div>

                {announcement.registrationDeadline && (
                  <div className="mt-3 text-sm font-medium text-accent">
                    Registration deadline: {announcement.registrationDeadline}
                  </div>
                )}

                {announcement.highlights && (
                  <div className="mt-4 space-y-1">
                    {announcement.highlights.map((highlight, idx) => (
                      <div key={idx} className="text-sm text-foreground">
                        - {highlight}
                      </div>
                    ))}
                  </div>
                )}

                {announcement.affectedTeams && (
                  <div className="mt-3">
                    <div className="text-sm font-medium text-foreground mb-1">Affected teams:</div>
                    <div className="flex flex-wrap gap-2">
                      {announcement.affectedTeams.map((team, idx) => (
                        <span key={idx} className="px-2 py-1 bg-card-hover text-foreground rounded text-xs">
                          {team}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="ml-4 text-right">
                <div className="text-xs text-muted mb-3">{announcement.timestamp}</div>
                <button className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredAnnouncements.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-muted mx-auto mb-4" />
            <div className="text-muted text-lg">No announcements match your filters</div>
            <div className="text-muted text-sm mt-1">Try adjusting your sport or type selection</div>
          </div>
        )}
      </div>
    </div>
  );
}
