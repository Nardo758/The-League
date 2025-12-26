Perfect. Here's the complete implementation with both Socket.IO handlers and client-side prediction.

## 🔌 Complete Socket.IO Game Server Implementation

### **1. Main Server Setup with Optimization**
```javascript
// server/index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const Redis = require('ioredis');
const GameManager = require('./game-manager');
const Matchmaker = require('./matchmaking');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Redis connection with pooling
const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 50, 2000),
  enableOfflineQueue: false,
});

// Socket.IO with latency optimizations
const io = new Server(server, {
  transports: ['websocket', 'polling'], // WebSocket first, fallback to polling
  allowUpgrades: true,
  pingTimeout: 30000,    // 30 seconds
  pingInterval: 10000,   // 10 seconds
  maxHttpBufferSize: 1e6, // 1MB max message
  cors: {
    origin: process.env.CLIENT_URL || "https://your-replit-app.repl.co",
    methods: ["GET", "POST"]
  },
  // Compression for game state
  perMessageDeflate: {
    threshold: 1024, // Compress messages > 1KB
  }
});

// Initialize game systems
const gameManager = new GameManager(redisClient);
const matchmaker = new Matchmaker(redisClient);

// Middleware: Authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));
    
    // Verify token (simplified)
    const user = await verifyToken(token);
    socket.user = user;
    socket.join(`user:${user.id}`); // Personal room for notifications
    next();
  } catch (err) {
    next(new Error('Authentication failed'));
  }
});

// Connection handler
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.user.id} from ${socket.handshake.address}`);
  
  // Send connection quality test
  socket.emit('connection_test', { timestamp: Date.now() });
  
  // Setup all event handlers
  setupGameHandlers(socket);
  setupMatchmakingHandlers(socket);
  setupChatHandlers(socket);
  
  // Track connection quality
  let latencySamples = [];
  socket.on('pong', (latency) => {
    latencySamples.push(latency);
    if (latencySamples.length > 10) latencySamples.shift();
    
    const avgLatency = latencySamples.reduce((a, b) => a + b, 0) / latencySamples.length;
    socket.avgLatency = avgLatency;
    
    // Adjust update rate based on latency
    if (avgLatency > 200) {
      socket.emit('adjust_update_rate', { interval: 100 }); // Slower updates
    }
  });
  
  // Cleanup on disconnect
  socket.on('disconnect', async (reason) => {
    console.log(`Player disconnected: ${socket.user.id} - ${reason}`);
    
    // Remove from matchmaking
    await matchmaker.removeFromQueue(socket.user.id);
    
    // Handle if player was in a game
    const currentGame = await redisClient.get(`player:game:${socket.user.id}`);
    if (currentGame) {
      await handlePlayerDisconnect(socket.user.id, currentGame, reason);
    }
  });
});

function setupGameHandlers(socket) {
  // Join a specific game
  socket.on('join_game', async (data, callback) => {
    try {
      const { gameId } = data;
      
      // Verify player can join
      const canJoin = await gameManager.canPlayerJoin(gameId, socket.user.id);
      if (!canJoin) {
        return callback({ success: false, error: 'Cannot join game' });
      }
      
      // Join Socket.IO room
      socket.join(gameId);
      
      // Store player->game mapping
      await redisClient.setex(`player:game:${socket.user.id}`, 3600, gameId);
      await redisClient.sadd(`game:players:${gameId}`, socket.user.id);
      
      // Get initial game state
      const gameState = await gameManager.getGameState(gameId);
      
      // Notify all players in game
      io.to(gameId).emit('player_joined', {
        playerId: socket.user.id,
        gameState: gameState
      });
      
      callback({ success: true, gameState });
    } catch (err) {
      console.error('Join game error:', err);
      callback({ success: false, error: err.message });
    }
  });
  
  // Player action (with client-side prediction support)
  socket.on('player_action', async (data) => {
    const { gameId, action, clientActionId, predictionTime } = data;
    const actionReceiptTime = Date.now();
    
    try {
      // Validate game exists
      if (!socket.rooms.has(gameId)) {
        return socket.emit('action_rejected', { 
          clientActionId, 
          error: 'Not in game' 
        });
      }
      
      // Process action through game manager
      const result = await gameManager.handlePlayerAction(
        gameId, 
        socket.user.id, 
        action,
        clientActionId
      );
      
      // Broadcast to all players (except sender if using prediction)
      socket.to(gameId).emit('game_update', {
        type: 'ACTION_APPLIED',
        playerId: socket.user.id,
        action,
        gameState: result.gameState,
        serverTime: Date.now(),
        actionId: result.actionId
      });
      
      // Send confirmation to acting player
      socket.emit('action_confirmed', {
        clientActionId,
        serverActionId: result.actionId,
        confirmedGameState: result.gameState,
        serverTime: Date.now(),
        latency: Date.now() - predictionTime,
        // Include corrections if client prediction was wrong
        corrections: result.corrections || null
      });
      
      // Log latency for monitoring
      const totalLatency = Date.now() - predictionTime;
      redisClient.lpush('metrics:action_latency', totalLatency);
      redisClient.ltrim('metrics:action_latency', 0, 999); // Keep last 1000
      
    } catch (error) {
      console.error('Action error:', error);
      socket.emit('action_rejected', {
        clientActionId,
        error: error.message
      });
    }
  });
  
  // Request game state snapshot
  socket.on('request_game_state', async (data, callback) => {
    const { gameId } = data;
    
    try {
      const gameState = await gameManager.getGameState(gameId);
      callback({ success: true, gameState });
    } catch (err) {
      callback({ success: false, error: err.message });
    }
  });
  
  // Heartbeat for connection monitoring
  socket.on('heartbeat', (data) => {
    socket.emit('heartbeat_ack', { 
      serverTime: Date.now(),
      ...data 
    });
  });
}

function setupMatchmakingHandlers(socket) {
  socket.on('join_queue', async (data, callback) => {
    const { sportType, preferences } = data;
    
    try {
      // Estimate player region from IP
      const region = estimateRegion(socket.handshake.address);
      
      const queueResult = await matchmaker.joinQueue(
        socket.user.id,
        sportType,
        region,
        preferences,
        socket.avgLatency || 100
      );
      
      if (queueResult.matchFound) {
        // Create game immediately
        const game = await gameManager.createGame(
          sportType,
          queueResult.players,
          queueResult.leagueId
        );
        
        // Notify all matched players
        queueResult.players.forEach(playerId => {
          io.to(`user:${playerId}`).emit('match_found', {
            gameId: game.id,
            players: queueResult.players,
            sportType
          });
        });
        
        callback({ 
          success: true, 
          matchFound: true, 
          gameId: game.id 
        });
      } else {
        callback({ 
          success: true, 
          matchFound: false,
          position: queueResult.position,
          estimatedWait: queueResult.estimatedWait 
        });
      }
    } catch (err) {
      callback({ success: false, error: err.message });
    }
  });
  
  socket.on('leave_queue', async (data, callback) => {
    try {
      await matchmaker.leaveQueue(socket.user.id);
      callback({ success: true });
    } catch (err) {
      callback({ success: false, error: err.message });
    }
  });
}

// Helper function to estimate region from IP
function estimateRegion(ip) {
  // Simplified - in production, use a geoip service
  if (ip.startsWith('192.168.')) return 'local';
  
  // Extract first octet for crude region guessing
  const firstOctet = ip.split('.')[0];
  if (firstOctet < 80) return 'us-west';
  if (firstOctet < 160) return 'us-east';
  if (firstOctet < 200) return 'europe';
  return 'asia';
}

server.listen(PORT, () => {
  console.log(`Game server running on port ${PORT}`);
});
```

## 🎮 Client-Side Prediction Implementation

### **2. Client-Side Game Engine (React/JavaScript)**
```javascript
// client/src/game/ClientGameEngine.js
class ClientGameEngine {
  constructor(gameId, playerId, sportType) {
    this.gameId = gameId;
    this.playerId = playerId;
    this.sportType = sportType;
    
    // Game state
    this.serverState = null;    // Authoritative state from server
    this.predictedState = null; // Our predicted state
    this.pendingActions = new Map(); // Actions awaiting confirmation
    
    // Networking
    this.socket = null;
    this.lastServerTime = 0;
    this.serverTimeOffset = 0;
    
    // Reconciliation
    this.actionHistory = [];
    this.maxRewindActions = 50;
    
    // Render callback
    this.onStateUpdate = null;
  }
  
  connect(socket) {
    this.socket = socket;
    
    // Setup socket listeners
    socket.on('game_update', this.handleServerUpdate.bind(this));
    socket.on('action_confirmed', this.handleActionConfirmation.bind(this));
    socket.on('action_rejected', this.handleActionRejection.bind(this));
    
    // Request initial state
    socket.emit('request_game_state', { gameId: this.gameId }, (response) => {
      if (response.success) {
        this.serverState = response.gameState;
        this.predictedState = this.deepClone(response.gameState);
        this.onStateUpdate?.(this.predictedState);
      }
    });
    
    // Start prediction loop
    this.startPredictionLoop();
  }
  
  // Main prediction method
  performAction(actionType, actionData) {
    if (!this.predictedState) return null;
    
    const clientActionId = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const predictionTime = Date.now();
    
    // Create action object
    const action = {
      type: actionType,
      data: actionData,
      clientActionId,
      playerId: this.playerId,
      predictionTime,
      clientStateHash: this.hashState(this.predictedState)
    };
    
    // 1. Immediately apply locally (optimistic update)
    const localResult = this.applyActionLocally(actionType, actionData);
    
    // Store for potential rollback
    this.pendingActions.set(clientActionId, {
      action,
      appliedAt: predictionTime,
      preActionState: this.deepClone(this.serverState),
      postActionState: this.deepClone(this.predictedState)
    });
    
    this.actionHistory.push({
      id: clientActionId,
      action,
      timestamp: predictionTime
    });
    
    // Keep history bounded
    if (this.actionHistory.length > this.maxRewindActions) {
      this.actionHistory.shift();
    }
    
    // 2. Send to server
    this.socket.emit('player_action', {
      gameId: this.gameId,
      action: {
        type: actionType,
        data: actionData
      },
      clientActionId,
      predictionTime
    });
    
    // 3. Update UI immediately
    this.onStateUpdate?.(this.predictedState);
    
    return {
      clientActionId,
      predictedState: this.predictedState
    };
  }
  
  // Apply action locally (sport-specific)
  applyActionLocally(actionType, actionData) {
    const previousState = this.deepClone(this.predictedState);
    
    switch (this.sportType) {
      case 'bowling':
        return this.applyBowlingAction(actionType, actionData);
      case 'golf':
        return this.applyGolfAction(actionType, actionData);
      case 'tennis':
        return this.applyTennisAction(actionType, actionData);
      default:
        throw new Error(`Unknown sport: ${this.sportType}`);
    }
  }
  
  // Bowling-specific action handling
  applyBowlingAction(actionType, actionData) {
    if (actionType !== 'ROLL') return false;
    
    const { pins } = actionData;
    const frameIndex = this.predictedState.currentFrame;
    const playerIndex = this.predictedState.players.findIndex(p => p.id === this.playerId);
    
    if (playerIndex === -1) return false;
    
    // Update frame
    const frame = this.predictedState.players[playerIndex].frames[frameIndex];
    frame.rolls.push(pins);
    
    // Calculate score locally
    this.calculateBowlingScore(playerIndex);
    
    // Advance turn if needed
    if (this.shouldAdvanceTurn(frame, frameIndex)) {
      this.predictedState.currentPlayerIndex = 
        (this.predictedState.currentPlayerIndex + 1) % this.predictedState.players.length;
    }
    
    return true;
  }
  
  // Handle server confirmation
  handleActionConfirmation(data) {
    const { clientActionId, confirmedGameState, corrections, serverTime } = data;
    
    // Update server time offset for lag compensation
    const roundTripTime = Date.now() - data.predictionTime;
    this.serverTimeOffset = serverTime - Date.now() + (roundTripTime / 2);
    
    // Remove from pending actions
    this.pendingActions.delete(clientActionId);
    
    // If server sent corrections, apply them
    if (corrections) {
      this.applyServerCorrections(corrections);
    } else {
      // Update authoritative state
      this.serverState = confirmedGameState;
      
      // Rebase predicted state on authoritative state
      this.rebasePredictedState();
    }
    
    // Log successful prediction
    console.log(`Action ${clientActionId} confirmed, latency: ${data.latency}ms`);
  }
  
  // Handle server rejection (prediction was wrong)
  handleActionRejection(data) {
    const { clientActionId, error } = data;
    
    console.warn(`Action rejected: ${clientActionId} - ${error}`);
    
    // Roll back this action and any dependent predictions
    this.rollbackToAction(clientActionId);
    
    // Remove from pending
    this.pendingActions.delete(clientActionId);
    
    // Request fresh state from server
    this.socket.emit('request_game_state', { gameId: this.gameId }, (response) => {
      if (response.success) {
        this.serverState = response.gameState;
        this.predictedState = this.deepClone(response.gameState);
        this.onStateUpdate?.(this.predictedState);
      }
    });
  }
  
  // Handle authoritative server update
  handleServerUpdate(data) {
    const { type, gameState, serverTime, actionId } = data;
    
    // Update server time
    this.lastServerTime = serverTime;
    
    // If this is another player's action
    if (type === 'ACTION_APPLIED' && data.playerId !== this.playerId) {
      this.serverState = gameState;
      
      // Re-apply our pending actions on top of new server state
      this.rebasePredictedState();
      
      // Update UI
      this.onStateUpdate?.(this.predictedState);
    }
  }
  
  // Rebase predicted state on latest server state
  rebasePredictedState() {
    if (!this.serverState) return;
    
    // Start from server state
    this.predictedState = this.deepClone(this.serverState);
    
    // Re-apply all pending actions
    for (const [actionId, pending] of this.pendingActions) {
      const success = this.applyActionLocally(
        pending.action.type,
        pending.action.data
      );
      
      if (!success) {
        // Action is no longer valid, remove it
        this.pendingActions.delete(actionId);
      }
    }
  }
  
  // Roll back to before a specific action
  rollbackToAction(targetActionId) {
    // Find the action in history
    const actionIndex = this.actionHistory.findIndex(a => a.id === targetActionId);
    if (actionIndex === -1) return;
    
    // Remove all actions after this one
    this.actionHistory.splice(actionIndex);
    
    // Remove corresponding pending actions
    for (let i = actionIndex; i < this.actionHistory.length; i++) {
      this.pendingActions.delete(this.actionHistory[i].id);
    }
    
    // Restore to last known good state
    if (this.serverState) {
      this.predictedState = this.deepClone(this.serverState);
      
      // Re-apply remaining actions
      for (let i = 0; i < actionIndex; i++) {
        const action = this.actionHistory[i];
        this.applyActionLocally(action.action.type, action.action.data);
      }
    }
  }
  
  // Entity interpolation for other players' positions
  interpolateEntities(currentState, previousState, alpha) {
    // Alpha = time since last render / update interval
    const interpolatedState = this.deepClone(currentState);
    
    if (!previousState) return currentState;
    
    // For sports with moving entities (tennis, soccer)
    if (this.sportType === 'tennis' || this.sportType === 'soccer') {
      interpolatedState.players.forEach((player, index) => {
        if (player.id === this.playerId) return; // Don't interpolate self
        
        const prevPlayer = previousState.players.find(p => p.id === player.id);
        if (prevPlayer && prevPlayer.position && player.position) {
          // Linear interpolation
          player.position.x = prevPlayer.position.x + 
            (player.position.x - prevPlayer.position.x) * alpha;
          player.position.y = prevPlayer.position.y + 
            (player.position.y - prevPlayer.position.y) * alpha;
        }
      });
    }
    
    return interpolatedState;
  }
  
  // Lag compensation: rewind time for accurate hit detection
  rewindTimeForHitDetection(targetEntity, rewindMs = 100) {
    if (!this.serverState) return targetEntity;
    
    const rewindState = this.deepClone(this.serverState);
    const rewindSteps = Math.floor(rewindMs / 16.67); // Assume 60Hz updates
    
    // Simple rewind by reversing recent actions
    for (let i = this.actionHistory.length - 1; 
         i >= Math.max(0, this.actionHistory.length - rewindSteps); 
         i--) {
      // Invert the action (simplified)
      this.reverseAction(this.actionHistory[i].action, rewindState);
    }
    
    return rewindState.entities?.find(e => e.id === targetEntity.id) || targetEntity;
  }
  
  // Start prediction render loop
  startPredictionLoop() {
    let lastRenderTime = 0;
    let previousState = null;
    
    const render = (currentTime) => {
      requestAnimationFrame(render);
      
      const deltaTime = currentTime - lastRenderTime;
      if (deltaTime < 16) return; // ~60fps
      
      // Calculate interpolation alpha
      const timeSinceUpdate = Date.now() - this.lastServerTime;
      const updateInterval = 100; // Server updates every 100ms
      const alpha = Math.min(1, timeSinceUpdate / updateInterval);
      
      // Create interpolated state for smooth rendering
      const renderState = this.interpolateEntities(
        this.predictedState || this.serverState,
        previousState,
        alpha
      );
      
      // Call render callback
      if (renderState && this.onStateUpdate) {
        this.onStateUpdate(renderState);
      }
      
      previousState = this.deepClone(renderState);
      lastRenderTime = currentTime;
    };
    
    requestAnimationFrame(render);
  }
  
  // Utility methods
  deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
  
  hashState(state) {
    // Simple hash for change detection
    return JSON.stringify(state).split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
  }
}
```

## 🎳 Complete Bowling Game Implementation

### **3. Server-Side Bowling Logic**
```javascript
// server/game-logic/BowlingGame.js
class BowlingGame {
  constructor(gameId, players, leagueId = null) {
    this.id = gameId;
    this.players = players.map((playerId, index) => ({
      id: playerId,
      frames: Array(10).fill().map(() => ({
        rolls: [],
        score: 0,
        isStrike: false,
        isSpare: false
      })),
      totalScore: 0,
      position: index
    }));
    
    this.currentFrame = 0;
    this.currentPlayerIndex = 0;
    this.status = 'ACTIVE';
    this.createdAt = Date.now();
    this.lastActionTime = Date.now();
    this.leagueId = leagueId;
    this.sportType = 'bowling';
    
    // Game rules
    this.rules = {
      maxPlayers: 4,
      frames: 10,
      maxRollsPerFrame: (frameIndex) => frameIndex === 9 ? 3 : 2,
      autoAdvance: true
    };
  }
  
  // Validate a roll action
  validateAction(playerId, action) {
    // Check game status
    if (this.status !== 'ACTIVE') {
      return { valid: false, error: 'Game is not active' };
    }
    
    // Check player turn
    const currentPlayer = this.players[this.currentPlayerIndex];
    if (currentPlayer.id !== playerId) {
      return { valid: false, error: 'Not your turn' };
    }
    
    // Check action type
    if (action.type !== 'ROLL') {
      return { valid: false, error: 'Invalid action type' };
    }
    
    // Check pins value
    if (typeof action.pins !== 'number' || action.pins < 0 || action.pins > 10) {
      return { valid: false, error: 'Invalid pins value' };
    }
    
    // Check frame limits
    const player = this.players.find(p => p.id === playerId);
    const frame = player.frames[this.currentFrame];
    const maxRolls = this.rules.maxRollsPerFrame(this.currentFrame);
    
    if (frame.rolls.length >= maxRolls) {
      return { valid: false, error: 'No more rolls in this frame' };
    }
    
    // Check valid pin count for non-final frames
    if (this.currentFrame < 9 && frame.rolls.length === 1) {
      const firstRoll = frame.rolls[0];
      if (firstRoll + action.pins > 10) {
        return { valid: false, error: 'Total pins cannot exceed 10' };
      }
    }
    
    return { valid: true };
  }
  
  // Apply roll action
  applyAction(playerId, action) {
    const validation = this.validateAction(playerId, action);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    
    const player = this.players.find(p => p.id === playerId);
    const frame = player.frames[this.currentFrame];
    
    // Record the roll
    frame.rolls.push(action.pins);
    
    // Update frame type
    if (this.currentFrame < 9) {
      if (action.pins === 10 && frame.rolls.length === 1) {
        frame.isStrike = true;
      } else if (frame.rolls.length === 2 && frame.rolls[0] + frame.rolls[1] === 10) {
        frame.isSpare = true;
      }
    }
    
    // Calculate scores
    this.calculateScores();
    
    // Advance turn
    this.advanceTurn();
    
    // Check game end
    this.checkGameEnd();
    
    this.lastActionTime = Date.now();
    return this.getPublicState();
  }
  
  // Calculate all scores with strike/spare bonuses
  calculateScores() {
    for (let i = 0; i < this.players.length; i++) {
      let totalScore = 0;
      
      for (let frameIndex = 0; frameIndex < 10; frameIndex++) {
        const frame = this.players[i].frames[frameIndex];
        
        if (frame.rolls.length === 0) {
          frame.score = 0;
          continue;
        }
        
        // Calculate frame score
        let frameScore = frame.rolls.reduce((sum, roll) => sum + roll, 0);
        
        // Add bonuses for strikes and spares
        if (frameIndex < 9) {
          if (frame.isStrike) {
            // Strike bonus: next two rolls
            const nextRolls = this.getNextRolls(i, frameIndex, 2);
            frameScore += nextRolls.reduce((sum, roll) => sum + roll, 0);
          } else if (frame.isSpare) {
            // Spare bonus: next one roll
            const nextRolls = this.getNextRolls(i, frameIndex, 1);
            frameScore += nextRolls[0] || 0;
          }
        }
        
        frame.score = frameScore;
        totalScore += frameScore;
      }
      
      this.players[i].totalScore = totalScore;
    }
  }
  
  // Get next N rolls for bonus calculation
  getNextRolls(playerIndex, startFrame, count) {
    const rolls = [];
    let framesSearched = 0;
    
    for (let i = startFrame + 1; i < 10 && rolls.length < count; i++) {
      const frame = this.players[playerIndex].frames[i];
      for (const roll of frame.rolls) {
        rolls.push(roll);
        if (rolls.length >= count) break;
      }
      framesSearched++;
    }
    
    return rolls.slice(0, count);
  }
  
  // Advance to next player/frame
  advanceTurn() {
    const player = this.players[this.currentPlayerIndex];
    const frame = player.frames[this.currentFrame];
    
    // Check if player should continue in current frame
    const shouldContinue = this.currentFrame === 9 
      ? this.shouldContinueInTenthFrame(frame)
      : !frame.isStrike && frame.rolls.length < 2;
    
    if (shouldContinue) {
      return; // Same player continues
    }
    
    // Move to next player
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    
    // If back to first player, advance frame
    if (this.currentPlayerIndex === 0 && this.currentFrame < 9) {
      this.currentFrame++;
    }
  }
  
  shouldContinueInTenthFrame(frame) {
    // In 10th frame, you get extra rolls after strike/spare
    if (frame.rolls.length === 0) return true;
    if (frame.rolls.length === 1) {
      return frame.rolls[0] === 10; // Strike gets 2 more
    }
    if (frame.rolls.length === 2) {
      if (frame.rolls[0] === 10) return true; // Strike then any
      return frame.rolls[0] + frame.rolls[1] === 10; // Spare gets 1 more
    }
    return false; // Used all 3 rolls
  }
  
  checkGameEnd() {
    // Game ends when all players have completed 10th frame
    const allPlayersDone = this.players.every(player => {
      const tenthFrame = player.frames[9];
      if (tenthFrame.rolls.length === 0) return false;
      
      if (tenthFrame.rolls[0] === 10) {
        return tenthFrame.rolls.length === 3; // Strike needs all 3
      }
      if (tenthFrame.rolls[0] + tenthFrame.rolls[1] === 10) {
        return tenthFrame.rolls.length === 3; // Spare needs all 3
      }
      return tenthFrame.rolls.length === 2; // Open frame
    });
    
    if (allPlayersDone) {
      this.status = 'COMPLETED';
      this.endTime = Date.now();
      this.determineWinner();
    }
  }
  
  determineWinner() {
    let maxScore = -1;
    let winners = [];
    
    this.players.forEach(player => {
      if (player.totalScore > maxScore) {
        maxScore = player.totalScore;
        winners = [player.id];
      } else if (player.totalScore === maxScore) {
        winners.push(player.id);
      }
    });
    
    this.winner = winners.length === 1 ? winners[0] : 'tie';
    this.finalScores = this.players.map(p => ({
      playerId: p.id,
      score: p.totalScore,
      frames: p.frames.map(f => ({
        rolls: f.rolls,
        score: f.score
      }))
    }));
  }
  
  getPublicState() {
    return {
      gameId: this.id,
      sportType: this.sportType,
      status: this.status,
      currentFrame: this.currentFrame,
      currentPlayerIndex: this.currentPlayerIndex,
      currentPlayerId: this.players[this.currentPlayerIndex]?.id,
      players: this.players.map(player => ({
        id: player.id,
        totalScore: player.totalScore,
        frames: player.frames.map(frame => ({
          rolls: [...frame.rolls],
          score: frame.score,
          isStrike: frame.isStrike,
          isSpare: frame.isSpare
        }))
      })),
      leaderboard: this.getLeaderboard(),
      lastUpdate: this.lastActionTime,
      winner: this.winner,
      endTime: this.endTime
    };
  }
  
  getLeaderboard() {
    return [...this.players]
      .sort((a, b) => b.totalScore - a.totalScore)
      .map(player => ({
        playerId: player.id,
        score: player.totalScore,
        position: this.players.indexOf(player)
      }));
  }
}
```

## 🎯 Advanced Matchmaking with Latency Consideration

### **4. Smart Matchmaker with Latency Optimization**
```javascript
// server/matchmaking.js
class Matchmaker {
  constructor(redisClient) {
    this.redis = redisClient;
    this.queues = new Map(); // In-memory for speed
  }
  
  async joinQueue(playerId, sportType, region, preferences, playerLatency) {
    const queueKey = `match:${sportType}:${region}`;
    
    // Get player skill rating (from database)
    const playerRating = await this.getPlayerRating(playerId, sportType);
    
    // Create queue entry
    const queueEntry = {
      playerId,
      sportType,
      region,
      rating: playerRating,
      preferences,
      latency: playerLatency,
      joinedAt: Date.now(),
      priority: this.calculatePriority(playerRating, playerLatency)
    };
    
    // Add to Redis sorted set by priority
    await this.redis.zadd(queueKey, queueEntry.priority, JSON.stringify(queueEntry));
    
    // Try to find immediate match
    const match = await this.findMatch(queueKey, queueEntry);
    
    if (match) {
      // Remove matched players from queue
      await this.removePlayersFromQueue(queueKey, match.players);
      return match;
    }
    
    // Return queue position
    const position = await this.redis.zrevrank(queueKey, JSON.stringify(queueEntry));
    return {
      matchFound: false,
      position: position + 1,
      estimatedWait: this.estimateWaitTime(position + 1, sportType, region)
    };
  }
  
  async findMatch(queueKey, newEntry) {
    // Get compatible players from queue
    const allEntries = await this.redis.zrevrange(queueKey, 0, -1);
    const parsedEntries = allEntries.map(e => JSON.parse(e));
    
    // Filter compatible players
    const compatiblePlayers = parsedEntries.filter(entry => 
      this.arePlayersCompatible(newEntry, entry)
    );
    
    // If we have enough players for a game
    const requiredPlayers = this.getRequiredPlayers(newEntry.sportType);
    if (compatiblePlayers.length >= requiredPlayers - 1) {
      // Take top N compatible players (including new entry)
      const matchedPlayers = [
        newEntry,
        ...compatiblePlayers.slice(0, requiredPlayers - 1)
      ].map(p => p.playerId);
      
      // Calculate average latency for monitoring
      const avgLatency = matchedPlayers.reduce((sum, p) => {
        const entry = parsedEntries.find(e => e.playerId === p);
        return sum + (entry?.latency || 100);
      }, 0) / matchedPlayers.length;
      
      return {
        matchFound: true,
        players: matchedPlayers,
        sportType: newEntry.sportType,
        region: newEntry.region,
        avgLatency,
        createdAt: Date.now()
      };
    }
    
    return null;
  }
  
  arePlayersCompatible(playerA, playerB) {
    // 1. Check skill rating difference (max 200 points)
    if (Math.abs(playerA.rating - playerB.rating) > 200) {
      return false;
    }
    
    // 2. Check latency compatibility (max 100ms difference for real-time games)
    const latencyDiff = Math.abs(playerA.latency - playerB.latency);
    if (latencyDiff > 100) {
      return false;
    }
    
    // 3. Check preferences
    if (playerA.preferences.competitive !== playerB.preferences.competitive) {
      return false;
    }
    
    // 4. Check time waiting (don't keep players waiting too long)
    const maxWaitTime = 300000; // 5 minutes
    const timeWaited = Date.now() - playerB.joinedAt;
    if (timeWaited > maxWaitTime) {
      return true; // Force match to prevent long waits
    }
    
    return true;
  }
  
  calculatePriority(rating, latency) {
    // Higher priority for:
    // 1. Players who've waited longer (50%)
    // 2. Players with lower latency (30%)
    // 3. Players with mid-range ratings (20%)
    
    const waitScore = 0; // Will be added when checking queue
    const latencyScore = Math.max(0, 1000 - latency) * 0.3;
    const ratingScore = this.getRatingScore(rating) * 0.2;
    
    return waitScore + latencyScore + ratingScore;
  }
  
  getRatingScore(rating) {
    // Prefer mid-range ratings for balanced matches
    const idealRating = 1500;
    return Math.max(0, 1000 - Math.abs(rating - idealRating));
  }
}
```

## 📊 Performance Monitoring Dashboard

### **5. Real-time Monitoring Endpoint**
```javascript
// server/monitoring.js
app.get('/api/monitoring/game-metrics', async (req, res) => {
  const metrics = {
    activeGames: await redisClient.scard('active_games'),
    connectedPlayers: io.engine.clientsCount,
    actionLatency: await this.getActionLatencyStats(),
    matchmaking: await this.getQueueStats(),
    serverLoad: process.memoryUsage()
  };
  
  res.json(metrics);
});

app.get('/api/monitoring/game/:gameId', async (req, res) => {
  const { gameId } = req.params;
  
  const gameState = await redisClient.get(`game:state:${gameId}`);
  const players = await redisClient.smembers(`game:players:${gameId}`);
  const events = await redisClient.lrange(`game:events:${gameId}`, 0, 49);
  
  res.json({
    gameId,
    state: JSON.parse(gameState || '{}'),
    players,
    recentEvents: events.map(e => JSON.parse(e)),
    connections: players.map(playerId => ({
      playerId,
      socketConnected: io.sockets.adapter.rooms.has(`user:${playerId}`)
    }))
  });
});
```

## 🚀 Deployment Configuration for Replit

### **6. replit.nix Configuration**
```nix
{ pkgs }: {
  deps = [
    pkgs.nodejs-18_x
    pkgs.postgresql
    pkgs.redis
    pkgs.pm2
  ];
  
  env = {
    DATABASE_URL = "postgresql://postgres:password@localhost:5432/league_platform";
    REDIS_URL = "redis://localhost:6379";
    NODE_ENV = "production";
    PORT = "3000";
  };
}
```

### **7. .replit Configuration**
```toml
run = "npm start"
language = "nodejs"

[packager]
afterInstall = """
  npm install
  createdb league_platform || true
  npx sequelize db:migrate
  redis-server --daemonize yes
"""

[deployment]
run = ["pm2", "start", "server/index.js", "--name", "league-game-server"]
```

## ✅ Quick Start Checklist

1. **Immediate Setup (Today):**
   - [ ] Copy Socket.IO server code to `server/index.js`
   - [ ] Install dependencies: `npm install socket.io ioredis express`
   - [ ] Set up Redis on Replit (use built-in database or Redis Cloud free tier)
   - [ ] Test connection with basic ping-pong

2. **Core Gameplay (Week 1):**
   - [ ] Implement bowling game logic
   - [ ] Add basic matchmaking
   - [ ] Create simple web client with prediction engine

3. **Optimization (Week 2):**
   - [ ] Add client-side prediction
   - [ ] Implement entity interpolation
   - [ ] Add latency monitoring
   - [ ] Set up Cloudflare CDN

4. **Scaling Prep (Week 3):**
   - [ ] Implement region-based matchmaking
   - [ ] Add game state persistence
   - [ ] Create admin monitoring dashboard
   - [ ] Prepare for multi-server deployment

## 🎯 Pro Tips for Replit Deployment

1. **Database Limits:** Replit's built-in DB has limits. For production, use:
   - Supabase (free PostgreSQL)
   - Redis Cloud (free 30MB)
   - Railway.app (free tier for both)

2. **WebSocket Limits:** Replit has occasional WebSocket timeouts. Add:
   ```javascript
   // Automatic reconnection
   setInterval(() => {
     if (!socket.connected) {
       socket.connect();
     }
   }, 5000);
   ```

3. **Static Assets:** Serve from Cloudflare Pages or Vercel to reduce Replit load.

4. **Cron Jobs:** For cleanup tasks, use GitHub Actions or Pipedream (free).

This complete implementation gives you:
- ✅ Real-time gameplay with WebSockets
- ✅ Client-side prediction for smooth experience  
- ✅ Smart matchmaking considering latency
- ✅ Full bowling game implementation
- ✅ Monitoring and admin tools
- ✅ Replit deployment configuration

**Next Steps:** Start with the Socket.IO server and basic bowling logic. Test locally first, then deploy to Replit. Add client-side prediction once basic gameplay works.