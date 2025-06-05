// facts.js - FACTS command for the terminal

export default {
  name: 'facts',
  category: 'info',
  help: {
    help: 'Display the simplets manifesto of web3 facts.'
  },
  handler: () => {
    const facts = [
      'money is just an illusion',
      'banks print. we mint',
      'open source wins',
      'FOMO drives adoption',
      'liquidity is power',
      'censorship is weakness',
      'consensus beats authority',
      'web3 isn\'t the future. It\'s a glitch in your present',
      'we still early'
    ];
    // Fisher-Yates shuffle
    for (let i = facts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [facts[i], facts[j]] = [facts[j], facts[i]];
    }
    return {
      text: `these simple facts are our manifesto:\n\n${facts.join('\n')}`,
      className: 'terminal-facts'
    };
  }
};
