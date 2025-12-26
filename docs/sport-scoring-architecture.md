# League Platform: Sport-Specific Scoring Systems & Architecture

## Overview
Each sport requires unique scoring mechanisms for both tournament play and head-to-head matches. This document outlines the scoring systems, announcement/notification architecture, and backend requirements for players and venues.

---

## Part 1: Sport-Specific Scoring Systems

### GOLF

#### Tournament Formats
1. **Stroke Play (Medal Play)**
   - Sum of all strokes across all rounds
   - Lowest total score wins
   - Handicaps applied to gross score = net score
   - Ties broken by scorecard playoff or sudden death

2. **Match Play**
   - Hole-by-hole competition
   - Win hole = 1 up, tie = halve, lose = 1 down
   - Match ends when opponent cannot catch up (e.g., 3 & 2 = 3 holes up with 2 to play)
   - Handicap strokes allocated by hole difficulty

3. **Stableford**
   - Points per hole based on score relative to par
   - Double bogey+ = 0, Bogey = 1, Par = 2, Birdie = 3, Eagle = 4, Albatross = 5
   - Highest point total wins
   - Encourages aggressive play

4. **Scramble (Team)**
   - All players hit, team selects best shot
   - All play from that spot
   - Continues until hole completed
   - Team score is the total strokes

5. **Best Ball**
   - Each player plays their own ball
   - Team score = lowest score on each hole
   - Can be 2-person, 4-person teams

#### Head-to-Head Scoring
- Match play format (described above)
- Can be singles or team matches
- Handicap differential determines stroke allocation

#### Data Requirements
- Course rating and slope
- Handicap index integration (GHIN)
- Hole-by-hole scores
- Fairways hit, GIR, putts per hole (stats)
- Weather conditions

---

### PICKLEBALL

#### Tournament Formats
1. **Round Robin**
   - Every player/team plays every other player/team
   - Win = 2 points, Loss = 0 points
   - Point differential used as tiebreaker
   - Top finishers advance to playoffs

2. **Single Elimination Bracket**
   - Win or go home
   - Standard bracket seeding based on skill rating
   - Consolation brackets for early losers

3. **Double Elimination**
   - Must lose twice to be eliminated
   - Winners bracket and losers bracket
   - Finals may require bracket reset

4. **Ladder System**
   - Ongoing ranking system
   - Challenge players within X positions of you
   - Winner moves up, loser moves down
   - Can have time limits for challenges

#### Head-to-Head Scoring
- Games typically to 11, 15, or 21 points
- Must win by 2 points
- Rally scoring (point on every serve)
- Best of 3 or best of 5 games
- Switches at 6 (or 11 in games to 21)

#### Match Types
- Singles
- Doubles
- Mixed doubles

#### Data Requirements
- Skill rating (2.0 - 5.5+ scale)
- Win/loss record
- Points for/against
- Court assignments
- Game scores within matches

---

### BOWLING

#### Tournament Formats
1. **Scratch Tournament**
   - Actual pins knocked down
   - No handicap applied
   - Highest total wins

2. **Handicap Tournament**
   - Based on average
   - Handicap = (basis - average) × percentage (usually 90%)
   - Score = scratch + handicap
   - Allows different skill levels to compete

3. **Baker Format (Team)**
   - Entire team bowls one game
   - Each bowler rotates frames
   - Bowler 1 = frames 1&6, Bowler 2 = frames 2&7, etc.
   - Fast-paced, exciting team format

4. **Scotch Doubles**
   - Two bowlers alternate shots within same frame
   - Partner must pick up spare or continue after strike
   - Requires coordination and strategy

5. **Multi-Game Series**
   - 3, 6, or 9 game series
   - Total pins across all games
   - Consistent performance rewarded

#### Head-to-Head Scoring
- Head-to-head game or series
- Can be scratch or handicap
- Point system: Win = 2 points, each game = 1 point
- Baker format head-to-head common in team leagues

#### League Formats
- Position rounds (bowl every team once)
- Points per week: Win games + win total = 7 points possible
- Season-long standings with playoffs

#### Data Requirements
- USBC number (for sanctioned leagues)
- Entering average and current average
- Lane conditions/oil patterns
- Pins per game, strikes, spares, opens
- Handicap calculations

---

### SOFTBALL

#### Tournament Formats
1. **Single Elimination**
   - Lose and you're out
   - Standard bracket
   - Consolation bracket optional

2. **Double Elimination**
   - Must lose twice
   - Winners and losers brackets
   - Championship may require 2 wins by loser's bracket team

3. **Round Robin**
   - Play all teams in pool
   - Top teams advance to playoffs
   - Win/loss record determines seeding

4. **Pool Play + Bracket**
   - Initial pool play for seeding
   - Top teams advance to single/double elimination
   - Common in larger tournaments

#### Head-to-Head Scoring
- Runs per inning (typically 7 innings, can be 5 or 9)
- Run rule common (10 runs after 5 innings, 15 after 3)
- Extra innings: international tiebreaker (runner on 2nd)
- Stats: Runs, hits, errors, RBIs, batting average

#### League Formats
- Regular season round-robin or division play
- Standings by win/loss percentage
- Playoffs: top teams in bracket format

#### Data Requirements
- Team rosters (min/max players)
- Field permits and schedules
- Umpire assignments
- Individual stats: BA, OBP, SLG, ERA, WHIP
- Team stats: runs/game, team ERA, fielding %

---

### TENNIS

#### Tournament Formats
1. **Single Elimination Draw**
   - Standard tournament bracket
   - Seeding based on rankings
   - Consolation rounds optional

2. **Round Robin**
   - Small groups play each other
   - Win/loss or games won determines placement
   - Top players advance

3. **Compass Draw**
   - After first round, winners and losers each get new draws
   - Everyone plays same number of matches
   - Good for recreational tournaments

4. **Ladder System**
   - Ongoing ranking
   - Challenge players ranked above you
   - Winner takes higher position
   - Active year-round

#### Head-to-Head Scoring
- Games: First to 4 points (15-30-40-game), win by 2
- Deuce at 40-40, need advantage then game
- Sets: First to 6 games, win by 2 (or tiebreak at 6-6)
- Tiebreak: First to 7 points, win by 2
- Matches: Best of 3 sets or best of 5 sets
- No-ad scoring option (single point at deuce)

#### Match Types
- Singles
- Doubles
- Mixed doubles

#### Data Requirements
- USTA membership number (optional)
- NTRP rating (1.0 - 7.0 scale)
- Match scores (game-by-game if detailed)
- Court reservations and availability
- Surface type (hard, clay, grass)

---

### SOCCER

#### Tournament Formats
1. **Group Stage + Knockout**
   - Initial groups play round-robin
   - Points: Win = 3, Draw = 1, Loss = 0
   - Top teams advance to elimination rounds
   - Common in World Cup-style formats

2. **Single Elimination**
   - Direct knockout bracket
   - Extra time (2 × 15 min) if tied
   - Penalty kicks if still tied

3. **Round Robin League**
   - Every team plays every other team
   - Final standings by points
   - Tiebreakers: goal differential, goals scored, head-to-head

#### Head-to-Head Scoring
- Goals scored during regulation (2 × 45 min halves, or shorter for rec)
- Can end in draw or require winner
- Extra time: golden goal or full 30 minutes
- Penalty kicks: 5 per team, sudden death if tied

#### League Formats
- Season-long standings
- Points per game: Win = 3, Draw = 1, Loss = 0
- Playoffs optional or champion by points

#### Data Requirements
- Field permits and schedules
- Referee assignments
- Player rosters and cards (yellow/red)
- Individual stats: goals, assists, clean sheets
- Team stats: goals for/against, possession, shots

---

## Part 2: Announcement Board & Notification System

### Announcement Types

#### 1. New League/Tournament Announcements
- Sport type
- Location/venue
- Start date and registration deadline
- Format and structure
- Entry fee and prize pool
- Skill level requirements

#### 2. Registration Updates
- "Only 5 spots left!"
- "Waitlist now available"
- "Registration extended to [date]"
- "Early bird pricing ends [date]"

#### 3. Schedule Changes
- Rain-outs and reschedules
- Time changes
- Venue changes
- Playoff bracket announcements

#### 4. Results & Standings
- Live score updates
- Match completions
- Standings updates
- Tournament bracket progressions

#### 5. Venue Announcements
- New leagues being offered
- Special events
- Facility updates
- Holiday schedules

### Notification Preferences

Users can subscribe to notifications based on:
- **Sports**: Select specific sports to follow
- **Location**: Distance radius from home/work
- **Skill Level**: Only receive notices for appropriate level
- **Format**: Tournaments vs. leagues
- **Day/Time**: Only weekday leagues, only weekend tournaments, etc.
- **Price Range**: Only events within budget

### Notification Channels
- In-app push notifications
- Email digests (daily/weekly)
- SMS for urgent updates (rain-outs, cancellations)
- Calendar integration

---

## Part 3: Player Backend Interface

### Dashboard Overview
- Upcoming matches/games
- Current leagues/tournaments enrolled in
- Recent results
- Quick stats summary
- Notifications center

### My Leagues & Tournaments
- Active registrations
- Schedule view (calendar integration)
- Team information
- Payment history
- League rules and formats

### Score Submission
- Sport-specific score entry forms
- Photo upload for scorecards
- Submit on behalf of team
- Pending verification from organizer

### My Stats
- Sport-specific statistics
- Historical performance
- Handicap/rating tracking
- Achievements and milestones
- Season comparisons

### Team Management (for team sports)
- Roster view
- Availability management
- Internal messaging
- Substitute coordination

### Communication
- League announcements
- Direct messaging with organizers
- Team chat
- Opponent contact (for scheduling makeup games)

### Profile & Preferences
- Skill level/rating
- Preferred positions (softball, soccer)
- Availability calendar
- Notification settings
- Payment methods
- Emergency contact

### Registration & Payments
- Browse available leagues
- Registration forms with waivers
- Payment processing
- Refund requests
- Receipt history

---

## Part 4: Venue Backend Interface

### Dashboard Overview
- Active leagues count
- Total registered players
- Revenue tracking
- Capacity utilization
- Upcoming events calendar

### League Management
- Create new league
- Edit existing leagues
- Registration management
- Waitlist handling
- Communication tools

### League Creation Wizard
1. Sport selection
2. Format selection (tournament/league structure)
3. Schedule builder
   - Dates and times
   - Facility/court/field assignments
   - Automatic pairing algorithms
4. Pricing structure
   - Entry fees
   - Payment schedules
   - Early bird discounts
5. Rules and requirements
   - Skill level
   - Team size
   - Equipment requirements
   - Waiver templates

### Scheduling Tools
- Calendar view of all leagues
- Facility/resource allocation
- Conflict detection
- Weather integration
- Automated pairing generation
- Playoff bracket creation

### Score & Standings Management
- Approve player-submitted scores
- Manual score entry
- Real-time standings calculation
- Playoff seeding
- Export options

### Registration Management
- View all registrants
- Approve/deny registrations
- Process refunds
- Manage waitlists
- Team formation (assign players to teams)
- Collect additional information

### Communication Center
- Announcement creation
  - Target: all players, specific league, specific team
  - Scheduling: immediate or scheduled
  - Channels: in-app, email, SMS
- Template library
- Message history

### Financial Management
- Revenue by league
- Payment tracking
- Refund processing
- Payout schedules
- Tax reporting

### Analytics Dashboard
- League performance metrics
- Player retention rates
- Popular time slots
- Revenue trends
- Demographic insights
- Marketing effectiveness

### Venue Profile
- Facility information
- Photos and videos
- Amenities
- Contact information
- Hours of operation
- Policies and rules

---

## Part 5: Technical Architecture Notes

### Scoring Engine Requirements
- Sport-specific calculation modules
- Real-time updates
- Handicap/rating integration
- Statistical aggregation
- Historical data retention

### Notification System
- Preference management database
- Smart targeting algorithms
- Multi-channel delivery
- Delivery tracking and analytics
- Opt-out compliance

### Data Models

#### Player Profile
- Demographics
- Sport-specific ratings/handicaps
- Registration history
- Payment methods
- Preferences and settings
- Stats across all sports

#### League/Tournament
- Sport type
- Format type
- Schedule structure
- Participants (players/teams)
- Scoring method
- Current standings
- Financial details

#### Venue
- Facility information
- Available resources (courts, fields, lanes, etc.)
- Operating hours
- Leagues offered
- Pricing models
- Staff/administrators

#### Match/Game
- Participants
- Date/time
- Location
- Score (sport-specific format)
- Status (scheduled, in-progress, completed, cancelled)
- Statistics

### Integration Points
- GHIN (golf handicaps)
- USBC (bowling)
- USTA (tennis)
- Payment processors (Stripe, Square)
- Calendar systems (Google, Outlook)
- Weather APIs
- Mapping/location services

---

## Next Steps for Development

1. **Phase 1**: Build sport-specific scoring modules
2. **Phase 2**: Develop notification preference system
3. **Phase 3**: Create player backend UI/UX
4. **Phase 4**: Build venue management dashboard
5. **Phase 5**: Integrate all systems with announcement board
6. **Phase 6**: Testing with pilot leagues in each sport
7. **Phase 7**: Iterate based on real-world usage

This comprehensive system ensures each sport maintains its unique characteristics while leveraging shared infrastructure for notifications, payments, and communications.
