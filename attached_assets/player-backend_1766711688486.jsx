import React, { useState } from 'react';
import { Home, Trophy, Calendar, BarChart3, Users, MessageCircle, Settings, Bell, DollarSign, Target, TrendingUp, Award, Clock, MapPin } from 'lucide-react';

const PlayerBackend = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock player data
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

  const DashboardTab = () => (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {playerData.name}!</h2>
        <p className="text-blue-100">You have 3 upcoming matches this week</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Active Leagues</div>
              <div className="text-2xl font-bold text-gray-900">3</div>
            </div>
            <Trophy className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Upcoming Matches</div>
              <div className="text-2xl font-bold text-gray-900">3</div>
            </div>
            <Calendar className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Overall Win Rate</div>
              <div className="text-2xl font-bold text-gray-900">68%</div>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Upcoming Matches */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Matches</h3>
        <div className="space-y-4">
          {upcomingMatches.map(match => (
            <div key={match.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <span className="text-3xl">{match.icon}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{match.league}</h4>
                    <div className="text-sm text-gray-600 mt-1">vs. {match.opponent}</div>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{match.date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{match.time}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{match.location}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{match.format}</div>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  {match.confirmed ? (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                      Confirmed
                    </span>
                  ) : (
                    <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700">
                      Confirm
                    </button>
                  )}
                  <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-xs font-medium hover:bg-gray-50">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Results */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Results</h3>
        <div className="space-y-4">
          {recentResults.map(result => (
            <div key={result.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <span className="text-3xl">{result.icon}</span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900">{result.league}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        result.result === 'Win' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.result}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      vs. {result.opponent} • {result.score}
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      {Object.entries(result.stats).map(([key, value]) => (
                        <span key={key}>{key}: {value}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">{result.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const MyLeaguesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Leagues</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Browse New Leagues
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {activeLeagues.map(league => (
          <div key={league.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <span className="text-4xl">{league.icon}</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{league.name}</h3>
                  <div className="text-sm text-gray-600 mt-1">{league.venue}</div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <div className="text-xs text-gray-500">Record</div>
                      <div className="text-lg font-semibold text-gray-900">{league.record}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Standing</div>
                      <div className="text-lg font-semibold text-gray-900">{league.standing}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Next Match</div>
                      <div className="text-lg font-semibold text-gray-900">{league.nextMatch}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  View Schedule
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                  Submit Score
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                  Team Chat
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const SubmitScoreTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Submit Score</h2>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-6">
          {/* Select League */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select League/Tournament
            </label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option>Monday Night Golf League</option>
              <option>Weekend Pickleball Ladder</option>
              <option>Thursday Night Bowling</option>
            </select>
          </div>

          {/* Select Match */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Match Date
            </label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option>Dec 30, 2025 - vs Team Eagle</option>
              <option>Dec 23, 2025 - vs Team Birdie</option>
            </select>
          </div>

          {/* Sport-Specific Score Entry - Golf Example */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Golf - Stroke Play</h3>
            
            <div className="grid grid-cols-9 gap-2 mb-4">
              <div className="text-center text-xs font-medium text-gray-600">Hole</div>
              {[1,2,3,4,5,6,7,8,9].map(hole => (
                <div key={hole} className="text-center text-xs font-medium text-gray-600">{hole}</div>
              ))}
              
              <div className="text-center text-xs font-medium text-gray-600">Par</div>
              {[4,3,5,4,4,3,5,4,4].map((par, i) => (
                <div key={i} className="text-center text-xs text-gray-600">{par}</div>
              ))}
              
              <div className="text-center text-xs font-medium text-gray-600">Score</div>
              {[1,2,3,4,5,6,7,8,9].map(hole => (
                <input 
                  key={hole}
                  type="number" 
                  className="w-full px-2 py-1 border border-gray-300 rounded text-center text-sm"
                  placeholder="-"
                />
              ))}
            </div>

            <div className="grid grid-cols-9 gap-2">
              <div className="text-center text-xs font-medium text-gray-600">Hole</div>
              {[10,11,12,13,14,15,16,17,18].map(hole => (
                <div key={hole} className="text-center text-xs font-medium text-gray-600">{hole}</div>
              ))}
              
              <div className="text-center text-xs font-medium text-gray-600">Par</div>
              {[5,4,3,4,4,5,3,4,4].map((par, i) => (
                <div key={i} className="text-center text-xs text-gray-600">{par}</div>
              ))}
              
              <div className="text-center text-xs font-medium text-gray-600">Score</div>
              {[10,11,12,13,14,15,16,17,18].map(hole => (
                <input 
                  key={hole}
                  type="number" 
                  className="w-full px-2 py-1 border border-gray-300 rounded text-center text-sm"
                  placeholder="-"
                />
              ))}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-600">Total Score</label>
                <div className="text-2xl font-bold text-gray-900">--</div>
              </div>
              <div>
                <label className="text-xs text-gray-600">Handicap</label>
                <div className="text-2xl font-bold text-gray-900">12.4</div>
              </div>
              <div>
                <label className="text-xs text-gray-600">Net Score</label>
                <div className="text-2xl font-bold text-blue-600">--</div>
              </div>
            </div>
          </div>

          {/* Upload Scorecard Photo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Scorecard Photo (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 cursor-pointer">
              <div className="text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">Click to upload or drag and drop</p>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4">
            <button className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              Submit Score
            </button>
            <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
              Save Draft
            </button>
          </div>

          <div className="text-sm text-gray-500 text-center">
            Your score will be reviewed by the league organizer before being posted to standings
          </div>
        </div>
      </div>
    </div>
  );

  const StatsTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">My Statistics</h2>

      {/* Sport Selection */}
      <div className="flex space-x-2">
        {['golf', 'pickleball', 'bowling'].map(sport => (
          <button 
            key={sport}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 capitalize"
          >
            {sport}
          </button>
        ))}
      </div>

      {/* Golf Stats Example */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Handicap Index</div>
          <div className="text-3xl font-bold text-gray-900">12.4</div>
          <div className="text-sm text-green-600 mt-2">↓ 0.3 from last month</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Rounds Played</div>
          <div className="text-3xl font-bold text-gray-900">24</div>
          <div className="text-sm text-gray-500 mt-2">This season</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Average Score</div>
          <div className="text-3xl font-bold text-gray-900">86</div>
          <div className="text-sm text-gray-500 mt-2">Last 10 rounds</div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Season Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-gray-600">Fairways Hit</div>
            <div className="text-2xl font-bold text-gray-900">68%</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Greens in Regulation</div>
            <div className="text-2xl font-bold text-gray-900">52%</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Average Putts</div>
            <div className="text-2xl font-bold text-gray-900">32.4</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Birdies</div>
            <div className="text-2xl font-bold text-gray-900">18</div>
          </div>
        </div>
      </div>

      {/* Recent Rounds */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Recent Rounds</h3>
        <div className="space-y-3">
          {[
            { date: 'Dec 23', course: 'Desert Ridge', score: 84, differential: 12.1 },
            { date: 'Dec 16', course: 'Papago', score: 88, differential: 13.5 },
            { date: 'Dec 9', course: 'Desert Ridge', score: 82, differential: 11.3 }
          ].map((round, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div className="flex items-center space-x-4">
                <div className="text-sm font-medium text-gray-900">{round.date}</div>
                <div className="text-sm text-gray-600">{round.course}</div>
              </div>
              <div className="flex items-center space-x-6">
                <div>
                  <span className="text-sm text-gray-600">Score: </span>
                  <span className="text-sm font-semibold text-gray-900">{round.score}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Diff: </span>
                  <span className="text-sm font-semibold text-gray-900">{round.differential}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'leagues', name: 'My Leagues', icon: Trophy },
    { id: 'submit-score', name: 'Submit Score', icon: Target },
    { id: 'stats', name: 'Statistics', icon: BarChart3 },
    { id: 'messages', name: 'Messages', icon: MessageCircle },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Trophy className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">League Platform</span>
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
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              AM
            </div>
            <div>
              <div className="font-medium text-gray-900">{playerData.name}</div>
              <div className="text-sm text-gray-500">View Profile</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-8">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'leagues' && <MyLeaguesTab />}
          {activeTab === 'submit-score' && <SubmitScoreTab />}
          {activeTab === 'stats' && <StatsTab />}
          {activeTab === 'messages' && (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <div className="text-gray-500">Messages feature coming soon</div>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="text-center py-12">
              <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <div className="text-gray-500">Settings feature coming soon</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerBackend;
