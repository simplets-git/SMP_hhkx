/**
 * WebPulse Command
 * 
 * Displays combined Web3 market sentiment metrics including FUD, HOPE, and FOMO.
 * Tracks social engagement and NFT minting activity to calculate market pulse.
 */

import { eventBus } from '../utils/events.js';
import { COMMAND_EVENTS } from '../core/terminal-events.js';
import CommandRegistry from './registry.js';

/**
 * Calculate Web3 Pulse metrics
 * @returns {Object} Pulse metrics and analysis
 */
function calculatePulse() {
  // TODO: Implement actual data collection and calculation
  // Placeholder implementation with mock data
  
  // Mock data - replace with real implementation
  const metrics = {
    fomo: {
      score: 65,
      twitterMentions: 1242,
      discordMessages: 843,
      change24h: 12.5
    },
    fud: {
      score: 42,
      nftMints: 156,
      negativeSentiment: 23,
      change24h: -5.2
    },
    hope: {
      score: 58,
      newWallets: 289,
      activeProjects: 47,
      change24h: 8.3
    }
  };

  // Calculate pulse (-100 to +100)
  const pulse = Math.round(
    (metrics.hope.score * 0.4) - 
    (metrics.fud.score * 0.4) + 
    (metrics.fomo.score * 0.2)
  );

  return {
    pulse,
    metrics,
    sentiment: getSentimentLabel(pulse),
    timestamp: new Date().toISOString()
  };
}

/**
 * Get sentiment label based on pulse score
 * @param {number} pulse - Pulse score (-100 to 100)
 * @returns {string} Sentiment label
 */
function getSentimentLabel(pulse) {
  if (pulse >= 80) return 'Extreme Greed 🚀';
  if (pulse >= 60) return 'Greed 📈';
  if (pulse >= 40) return 'Optimistic 😊';
  if (pulse >= 20) return 'Hopeful 🙂';
  if (pulse > -20) return 'Neutral 😐';
  if (pulse > -40) return 'Concerned 🧐';
  if (pulse > -60) return 'Fear 😨';
  if (pulse > -80) return 'Extreme Fear 😱';
  return 'Panic 🚨';
}

/**
 * Format the pulse output
 * @param {Object} data - Pulse data
 * @returns {string} Formatted output
 */
function formatPulseOutput(data) {
  const { pulse, sentiment, metrics } = data;
  
  return `
📊 WEB3 PULSE: ${pulse}/100 (${sentiment})

FACTORS:
• FOMO: ${metrics.fomo.score}/100 (${metrics.fomo.change24h > 0 ? '↑' : '↓'}${Math.abs(metrics.fomo.change24h)}%)
  - Twitter: ${metrics.fomo.twitterMentions} mentions
  - Discord: ${metrics.fomo.discordMessages} messages

• HOPE: ${metrics.hope.score}/100 (${metrics.hope.change24h > 0 ? '↑' : '↓'}${Math.abs(metrics.hope.change24h)}%)
  - New wallets: ${metrics.hope.newWallets}
  - Active projects: ${metrics.hope.activeProjects}

• FUD: ${metrics.fud.score}/100 (${metrics.fud.change24h > 0 ? '↑' : '↓'}${Math.abs(metrics.fud.change24h)}%)
  - NFT mints: ${metrics.fud.nftMints}
  - Negative sentiment: ${metrics.fud.negativeSentiment}%
`;
}

/**
 * Handle the webpulse command
 * @param {string[]} args - Command arguments
 * @returns {string} Formatted pulse information
 */
function handleWebPulseCommand(args = []) {
  try {
    const pulseData = calculatePulse();
    return formatPulseOutput(pulseData);
  } catch (error) {
    console.error('Error in webpulse command:', error);
    return '⚠️ Error calculating Web3 Pulse. Please try again later.';
  }
}

// Register command and its help text
CommandRegistry.register('webpulse', handleWebPulseCommand);
CommandRegistry.registerHelpText('webpulse', {
  description: 'Displays Web3 market sentiment metrics (FUD, HOPE, FOMO)',
  usage: 'webpulse',
  examples: [
    'webpulse',
    'webpulse --detailed'
  ]
});

// Register with event system
eventBus.emit(COMMAND_EVENTS.REGISTER, {
  name: 'webpulse',
  handler: handleWebPulseCommand,
  category: 'web3',
  hidden: false
});

export { handleWebPulseCommand };
