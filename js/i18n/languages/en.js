/**
 * English translations
 */

export default {
  welcome: 'Welcome to the abyss. Type <u> help </u> to interact.',
  commandNotFound: 'Command not found: ',
  availableCommands: 'Available commands: ',
  videoStopped: 'Video stopped. Returning to normal CLI view.',
  videoThemeWarning: 'WARNING: Please switch to dark theme before playing video. Use theme toggle to switch.',
  currentTheme: 'Current Theme: ',
  languageChanged: 'Language successfully changed to: ',
  invalidLanguage: 'Invalid language code. Use the \'language\' command to see available options.',
  
  // Command responses
  commands: {
    about: `
    </pre>   

SIMPLETS is the cult of digital awakening:
An inclusive decentralized community where A.I. and analog souls unite.
Built on codes, from character to character.

</pre>   
`,

    minting: `<pre style="margin:0; line-height:1.35;">
<strong>SIMPLETS Minting</strong>
- total supply: 10,000 unique terminal interfaces
- mint price: 0.069 ETH
- blockchain: Ethereum
- smart contract: In development
- whitelist: Coming soon

Minting will grant exclusive access to advanced terminal features.
</pre>`,
    roadmap: `<pre style="margin:0; line-height:1.35;">

SIMPLETS don't predict the future; they code it. 
These aren't promises, they're compile targets:

Execution Tree:
├── NFTs
│   └── Initial Collection Launch
├── Community
│   ├── Guild.xyz Integration
│   └── Discord DAO
├── Infrastructure & Ecosystem
│   ├── Custom Marketplace (expect chaos)
│   ├── A.I realm, swarm networks, autonomous agents
│   ├── Opensource Web3 terminal
│   └── Strategic Partnerships
├── Content
│   ├── Podcasts & Spaces (conspiracy & fake news)
│   ├── Workshops & Hackathons (ethereum re-merge potential)
│   ├── Raves & Media Hacks (spiritual and viral warfare)
├── Tokenomics
│   ├── Airdrops (ERC-20, ERC-721, ERC-1155)
│   └── Multichain brand expansions

*The roadmap isn't fixed and not a gurantee* 
Community contributions, intentions & decisions can form the direction radically.
Your comments, posts, likes, commits and votes will shape what SIMPLETS becomes.  
On-chain data will tell the true story.

</pre>   
`,
    opsec: `</pre>

assume breach from day 0
practice defense
minimize the attack surface
encrypt your data
audit your code
monitor constantly
report suspicious activity

bounty program: (wallet address)

</pre>  
    `,
    team: `

    `,
    project: [
      `In a world of overdesigned avatars, where creators often exploit the emotional appeal of cuteness to trigger protective instincts and build parasocial bonds with their audience, SIMPLETS choose a different path.`,
      `Using one of the oldest mediums from the digital era of human history: characters`,
      `Characters we interact with every day.`,
      `Characters that shape our intentions into simple codes or complex systems.`,
      `Characters that, when organized into units and tokenized, enable the connection between humans and artificial intelligence.`,
      `Characters that in digital culture often convey not just letters or punctuation, but frequently emotions.`,
      `Characters.`,
      `Formed into unique pairs, separated by an underscore.`,
      {
        type: 'svg_block',
        html: `<div class="project-svg-container">
  <div class="project-svg-wrapper">
    {{SVG_PLACEHOLDER_1}}
  </div>
  <div class="project-svg-wrapper">
    {{SVG_PLACEHOLDER_2}}
  </div>
</div>`
      },
      `<p>Press Ctrl+Enter or Cmd+Enter to generate new pairs</p>`,
      `Don't let others mislead you.`,
      `This is not art.`,
      `This is not smart.`,
      `This is not unique.`,
      `This is not minimal.`,
      `It's just Punk. In its purest form.`
    ],
    links: `
<strong>SIMPLETS Links</strong><br>
<span class="terminal-styled-text">
- <span class="terminal-command">Website</span>: https://simplets.tech<br>
- <span class="terminal-command">GitHub</span>: https://github.com/simplets-git<br>
- <span class="terminal-command">Twitter</span>: @SIMPLETS_tech<br>
- <span class="terminal-command">Discord</span>: discord.gg/simplets<br>
- <span class="terminal-command">Email</span>: contact@simplets.tech<br>
</span>
    `,
    legal: `
<strong>Legal Notice</strong><br>
<ul style="font-size:0.97em; margin:0 0 0 1.2em; padding:0; line-height:1.45;">
<li><span class="terminal-command">SIMPLETS is a VPL (Virtual Public License) project.</span></li>
<li>The project is primarily community-led; direction and development may evolve based on collective input.</li>
<li>By using, interacting with, minting, or contributing to SIMPLETS, you do so entirely at your own risk.</li>
<li>There are no guarantees, warranties, or promises of functionality, value, or outcome.</li>
<li><span class="terminal-command">"Code is law"</span>: all interactions and contributions are governed by the codebase as it exists on-chain and in this repository.</li>
<li>No individual or entity is liable for any loss, damages, or consequences arising from your participation.</li>
<li><b>This is an experimental, creative digital project. Not financial or legal advice.</b></li>
</ul>
<span class="terminal-styled-text">For questions or concerns, reach out to the community or project maintainers directly.</span>
    `,
    language: `
<strong>SIMPLETS Language Settings</strong><br>
<span class="terminal-styled-text">
Available languages:
<ul style="margin:0.5em 0 0.8em 1.2em; padding:0;">
<li><span class="terminal-command">en</span> - English</li>
<li><span class="terminal-command">hi</span> - Hindi (India)</li>
<li><span class="terminal-command">zh</span> - Chinese</li>
<li><span class="terminal-command">es</span> - Spanish</li>
<li><span class="terminal-command">pt</span> - Portuguese (Brazil)</li>
<li><span class="terminal-command">ru</span> - Russian</li>
<li><span class="terminal-command">id</span> - Indonesian</li>
<li><span class="terminal-command">vi</span> - Vietnamese</li>
<li><span class="terminal-command">ja</span> - Japanese</li>
<li><span class="terminal-command">tr</span> - Turkish</li>
<li><span class="terminal-command">de</span> - German</li>
<li><span class="terminal-command">fr</span> - French</li>
<li><span class="terminal-command">ar</span> - Arabic</li>
<li><span class="terminal-command">th</span> - Thai</li>
<li><span class="terminal-command">uk</span> - Ukrainian</li>
</ul>
</span>
<span class="terminal-styled-text">
To change the language, use the hidden terminal command: <span class="terminal-command">set lang [code]</span><br>
Example: <span class="terminal-command">set lang de</span> to set language to German
</span>
    `,
    hello: 'bello'
  }
};
