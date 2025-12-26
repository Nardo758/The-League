'use client';

import { useState } from 'react';
import { Home, Trophy, Calendar, BarChart3, Users, MessageCircle, Settings, Target, TrendingUp, Clock, MapPin } from 'lucide-react';

const playerData = {
  name: 'Alex Martinez',
  sports: ['golf', 'pickleball', 'bowling'],
  stats: {
    golf: { handicap: 12.4, rounds: 24, avgScore: 86 },
    pickleball: { rating: 3.5, wins: 18, losses: 12 },
    bowling: { average: 178, games: 36, highGame: 257 }
  }
};

const upcomingMatches = [
  {
    id: 1,
    sport: 'golf',
    icon: '🏌️',
    league: 'Monday Night Golf League',
    opponent: 'Mike Chen, Sarah Williams',
    date: 'Dec 30, 2025',
    time: '5:30 PM',
    location: 'Desert Ridge Golf Club',
    format: 'Best Ball',
    confirmed: true
  },
  {
    id: 2,
    sport: 'pickleball',
    icon: '🏓',
    league: 'Weekend Pickleball Ladder',
    opponent: 'Team Davis/Lee',
    date: 'Dec 28, 2025',
    time: '9:00 AM',
    location: 'Metro Pickleball Center',
    format: 'Doubles - Best of 3',
    confirmed: false
  },
  {
    id: 3,
    sport: 'bowling',
    icon: '🎳',
    league: 'Thursday Night Bowling',
    opponent: 'Strike Force',
    date: 'Jan 2, 2025',
    time: '7:00 PM',
    location: 'Sunset Lanes',
    format: 'Team Match',
    confirmed: true
  }
];

const activeLeagues = [
  {
    id: 1,
    sport: 'golf',
    icon: '🏌️',
    name: 'Monday Night Golf League',
    venue: 'Desert Ridge Golf Club',
    record: '8-4',
    standing: '3rd of 16',
    nextMatch: 'Dec 30',
    status: 'active'
  },
  {
    id: 2,
    sport: 'pickleball',
    icon: '🏓',
    name: 'Weekend Pickleball Ladder',
    venue: 'Metro Pickleball Center',
    record: '18-12',
    standing: '7th of 24',
    nextMatch: 'Dec 28',
    status: 'active'
  },
  {
    id: 3,
    sport: 'bowling',
    icon: '🎳',
    name: 'Thursday Night Bowling',
    venue: 'Sunset Lanes',
    record: '14-6',
    standing: '2nd of 12',
    nextMatch: 'Jan 2',
    status: 'active'
  }
];

const recentResults = [
  {
    id: 1,
    sport: 'golf',
    icon: '🏌️',
    league: 'Monday Night Golf League',
    result: 'Win',
    score: 'Net 72',
    opponent: 'Team Eagle',
    date: 'Dec 23',
    stats: { fairways: '9/14', gir: '11/18', putts: 31 }
  },
  {
    id: 2,
    sport: 'pickleball',
    icon: '🏓',
    league: 'Weekend Pickleball Ladder',
    result: 'Loss',
    score: '1-2 (11-9, 8-11, 9-11)',
    opponent: 'Anderson/Brooks',
    date: 'Dec 21',
    stats: { aces: 4, errors: 12, winners: 18 }
  }
];

const tabs = [
  { id: 'dashboard', name: 'Dashboard', icon: Home },
  { id: 'leagues', name: 'My Leagues', icon: Trophy },
  { id: 'submit-score', name: 'Submit Score', icon: Target },
  { id: 'stats', name: 'Statistics', icon: BarChart3 },
  { id: 'messages', name: 'Messages', icon: MessageCircle },
  { id: 'settings', name: 'Settings', icon: Settings }
];

function DashboardTab() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-accent to-accent-hover rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {playerData.name}!</h2>
        <p className="text-white/80">You have 3 upcoming matches this week</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted">Active Leagues</div>
              <div className="text-2xl font-bold text-foreground">3</div>
            </div>
            <Trophy className="w-8 h-8 text-accent" />
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted">Upcoming Matches</div>
              <div className="text-2xl font-bold text-foreground">3</div>
            </div>
            <Calendar className="w-8 h-8 text-success" />
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted">Overall Win Rate</div>
              <div className="text-2xl font-bold text-foreground">68%</div>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Upcoming Matches</h3>
        <div className="space-y-4">
          {upcomingMatches.map(match => (
            <div key={match.id} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{match.icon}</span>
                  <div>
                    <h4 className="font-semibold text-foreground">{match.league}</h4>
                    <div className="text-sm text-muted mt-1">vs. {match.opponent}</div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{match.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{match.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{match.location}</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted mt-1">{match.format}</div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {match.confirmed ? (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                      Confirmed
                    </span>
                  ) : (
                    <button className="px-3 py-1 bg-accent text-white rounded text-xs font-medium hover:bg-accent-hover">
                      Confirm
                    </button>
                  )}
                  <button className="px-3 py-1 border border-border text-foreground rounded text-xs font-medium hover:bg-card-hover">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Recent Results</h3>
        <div className="space-y-4">
          {recentResults.map(result => (
            <div key={result.id} className="border border-border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{result.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">{result.league}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        result.result === 'Win' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.result}
                      </span>
                    </div>
                    <div className="text-sm text-muted mt-1">
                      vs. {result.opponent} - {result.score}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted">
                      {Object.entries(result.stats).map(([key, value]) => (
                        <span key={key}>{key}: {value}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-muted">{result.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MyLeaguesTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">My Leagues</h2>
        <button className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover">
          Browse New Leagues
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {activeLeagues.map(league => (
          <div key={league.id} className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <span className="text-4xl">{league.icon}</span>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{league.name}</h3>
                  <div className="text-sm text-muted mt-1">{league.venue}</div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <div className="text-xs text-muted">Record</div>
                      <div className="text-lg font-semibold text-foreground">{league.record}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted">Standing</div>
                      <div className="text-lg font-semibold text-foreground">{league.standing}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted">Next Match</div>
                      <div className="text-lg font-semibold text-foreground">{league.nextMatch}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover text-sm">
                  View Schedule
                </button>
                <button className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-card-hover text-sm">
                  Submit Score
                </button>
                <button className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-card-hover text-sm">
                  Team Chat
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubmitScoreTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Submit Score</h2>

      <div className="bg-card rounded-lg border border-border p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Select League/Tournament
            </label>
            <select className="w-full px-4 py-2 border border-border rounded-lg bg-card">
              <option>Monday Night Golf League</option>
              <option>Weekend Pickleball Ladder</option>
              <option>Thursday Night Bowling</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Select Match Date
            </label>
            <select className="w-full px-4 py-2 border border-border rounded-lg bg-card">
              <option>Dec 30, 2025 - vs Team Eagle</option>
              <option>Dec 23, 2025 - vs Team Birdie</option>
            </select>
          </div>

          <div className="bg-card-hover rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-4">Golf - Stroke Play</h3>
            
            <div className="grid grid-cols-10 gap-2 mb-4">
              <div className="text-center text-xs font-medium text-muted">Hole</div>
              {[1,2,3,4,5,6,7,8,9].map(hole => (
                <div key={hole} className="text-center text-xs font-medium text-muted">{hole}</div>
              ))}
              
              <div className="text-center text-xs font-medium text-muted">Par</div>
              {[4,3,5,4,4,3,5,4,4].map((par, i) => (
                <div key={i} className="text-center text-xs text-muted">{par}</div>
              ))}
              
              <div className="text-center text-xs font-medium text-muted">Score</div>
              {[1,2,3,4,5,6,7,8,9].map(hole => (
                <input 
                  key={hole}
                  type="number" 
                  className="w-full px-2 py-1 border border-border rounded text-center text-sm bg-card"
                  placeholder="-"
                />
              ))}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-muted">Total Score</label>
                <div className="text-2xl font-bold text-foreground">--</div>
              </div>
              <div>
                <label className="text-xs text-muted">Handicap</label>
                <div className="text-2xl font-bold text-foreground">12.4</div>
              </div>
              <div>
                <label className="text-xs text-muted">Net Score</label>
                <div className="text-2xl font-bold text-accent">--</div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Upload Scorecard Photo (Optional)
            </label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-accent cursor-pointer">
              <div className="text-muted">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">Click to upload or drag and drop</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="flex-1 px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-hover font-medium">
              Submit Score
            </button>
            <button className="px-6 py-3 border border-border text-foreground rounded-lg hover:bg-card-hover font-medium">
              Save Draft
            </button>
          </div>

          <div className="text-sm text-muted text-center">
            Your score will be reviewed by the league organizer before being posted to standings
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">My Statistics</h2>

      <div className="flex gap-2">
        {['golf', 'pickleball', 'bowling'].map(sport => (
          <button 
            key={sport}
            className="px-4 py-2 bg-card border border-border rounded-lg hover:bg-card-hover capitalize"
          >
            {sport}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="text-sm text-muted mb-1">Handicap Index</div>
          <div className="text-3xl font-bold text-foreground">12.4</div>
          <div className="text-sm text-success mt-2">-0.3 from last month</div>
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="text-sm text-muted mb-1">Rounds Played</div>
          <div className="text-3xl font-bold text-foreground">24</div>
          <div className="text-sm text-muted mt-2">This season</div>
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="text-sm text-muted mb-1">Average Score</div>
          <div className="text-3xl font-bold text-foreground">86</div>
          <div className="text-sm text-muted mt-2">Last 10 rounds</div>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="font-semibold text-foreground mb-4">Season Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-muted">Fairways Hit</div>
            <div className="text-2xl font-bold text-foreground">68%</div>
          </div>
          <div>
            <div className="text-sm text-muted">Greens in Regulation</div>
            <div className="text-2xl font-bold text-foreground">52%</div>
          </div>
          <div>
            <div className="text-sm text-muted">Average Putts</div>
            <div className="text-2xl font-bold text-foreground">32.4</div>
          </div>
          <div>
            <div className="text-sm text-muted">Birdies</div>
            <div className="text-2xl font-bold text-foreground">18</div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="font-semibold text-foreground mb-4">Recent Rounds</h3>
        <div className="space-y-3">
          {[
            { date: 'Dec 23', course: 'Desert Ridge', score: 84, differential: 12.1 },
            { date: 'Dec 16', course: 'Papago', score: 88, differential: 13.5 },
            { date: 'Dec 9', course: 'Desert Ridge', score: 82, differential: 11.3 }
          ].map((round, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex items-center gap-4">
                <div className="text-sm font-medium text-foreground">{round.date}</div>
                <div className="text-sm text-muted">{round.course}</div>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-sm text-muted">Score: </span>
                  <span className="text-sm font-semibold text-foreground">{round.score}</span>
                </div>
                <div>
                  <span className="text-sm text-muted">Diff: </span>
                  <span className="text-sm font-semibold text-foreground">{round.differential}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex min-h-[calc(100vh-80px)] -mx-4 sm:-mx-6 lg:-mx-8 -my-8">
      <div className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-accent" />
            <span className="text-xl font-bold text-foreground">Player Hub</span>
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white font-semibold">
              AM
            </div>
            <div>
              <div className="font-medium text-foreground">{playerData.name}</div>
              <div className="text-sm text-muted">View Profile</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'leagues' && <MyLeaguesTab />}
        {activeTab === 'submit-score' && <SubmitScoreTab />}
        {activeTab === 'stats' && <StatsTab />}
        {activeTab === 'messages' && (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-muted mx-auto mb-4" />
            <div className="text-muted">Messages feature coming soon</div>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="text-center py-12">
            <Settings className="w-16 h-16 text-muted mx-auto mb-4" />
            <div className="text-muted">Settings feature coming soon</div>
          </div>
        )}
      </div>
    </div>
  );
}
