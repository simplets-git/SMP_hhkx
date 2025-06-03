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
<strong>SIMPLETS is the cult of digital awakening:</strong><br>
An underground and experimental DeSoc journey.<br>
Designed around free speech and pseudonym friendly values.<br>
A convergence where A.I. and creative souls unite.<br>
Built by codes, from character to character.
    `,
    manifesto: `
<strong>SIMPLETS Manifesto</strong><br>

- <strong>Kernel Freedom</strong>: Your digital self deserves room to execute without unnecessary constraints<br>
- <strong>Root Access</strong>: true ownership, not just token-gated illusions<br>
- <strong>Open Source Ethics</strong>: Information wants to be free; code wants to be forked<br>
- <strong>Silent Running</strong>: Build quietly, ship consistently<br><br>

Our philosophy is 0x73696d706c65<br>
Simple as that
    `,
    manifestos: [
      `<strong>Cypherpunk Manifesto</strong><br>
      Privacy is necessary for an open society in the electronic age. Privacy is not secrecy. A private matter is something one doesn't want the whole world to know, but a secret matter is something one doesn't want anybody to know. Privacy is the power to selectively reveal oneself to the world.<br><br>
      
      If two parties have some sort of dealings, then each has a memory of their interaction. Each party can speak about their own memory of this; how could anyone prevent it? One could pass laws against it, but the freedom of speech, even more than privacy, is fundamental to an open society; we seek not to restrict any speech at all. If many parties speak together in the same forum, each can speak to all the others and aggregate together knowledge about individuals and other parties. The power of electronic communications has enabled such group speech, and it will not go away merely because we might want it to.<br><br>
      
      Since we desire privacy, we must ensure that each party to a transaction have knowledge only of that which is directly necessary for that transaction. Since any information can be spoken of, we must ensure that we reveal as little as possible. In most cases personal identity is not salient. When I purchase a magazine at a store and hand cash to the clerk, there is no need to know who I am. When I ask my electronic mail provider to send and receive messages, my provider need not know to whom I am speaking or what I am saying or what others are saying to me; my provider only need know how to get the message there and how much I owe them in fees. When my identity is revealed by the underlying mechanism of the transaction, I have no privacy. I cannot here selectively reveal myself; I must always reveal myself.<br><br>
      
      Therefore, privacy in an open society requires anonymous transaction systems. Until now, cash has been the primary such system. An anonymous transaction system is not a secret transaction system. An anonymous system empowers individuals to reveal their identity when desired and only when desired; this is the essence of privacy.<br><br>
      
      Privacy in an open society also requires cryptography. If I say something, I want it heard only by those for whom I intend it. If the content of my speech is available to the world, I have no privacy. To encrypt is to indicate the desire for privacy, and to encrypt with weak cryptography is to indicate not too much desire for privacy. Furthermore, to reveal one's identity with assurance when the default is anonymity requires the cryptographic signature.<br><br>
      
      We cannot expect governments, corporations, or other large, faceless organizations to grant us privacy out of their beneficence. It is to their advantage to speak of us, and we should expect that they will speak. To try to prevent their speech is to fight against the realities of information. Information does not just want to be free, it longs to be free. Information expands to fill the available storage space. Information is Rumor's younger, stronger cousin; Information is fleeter of foot, has more eyes, knows more, and understands less than Rumor.<br><br>
      
      We must defend our own privacy if we expect to have any. We must come together and create systems which allow anonymous transactions to take place. People have been defending their own privacy for centuries with whispers, darkness, envelopes, closed doors, secret handshakes, and couriers. The technologies of the past did not allow for strong privacy, but electronic technologies do.<br><br>
      
      We the Cypherpunks are dedicated to building anonymous systems. We are defending our privacy with cryptography, with anonymous mail forwarding systems, with digital signatures, and with electronic money.<br><br>
      
      Cypherpunks write code. We know that someone has to write software to defend privacy, and since we can't get privacy unless we all do, we're going to write it. We publish our code so that our fellow Cypherpunks may practice and play with it. Our code is free for all to use, worldwide. We don't much care if you don't approve of the software we write. We know that software can't be destroyed and that a widely dispersed system can't be shut down.<br><br>
      
      Cypherpunks deplore regulations on cryptography, for encryption is fundamentally a private act. The act of encryption, in fact, removes information from the public realm. Even laws against cryptography reach only so far as a nation's border and the arm of its violence. Cryptography will ineluctably spread over the whole globe, and with it the anonymous transactions systems that it makes possible.<br><br>
      
      For privacy to be widespread it must be part of a social contract. People must come and together deploy these systems for the common good. Privacy only extends so far as the cooperation of one's fellows in society. We the Cypherpunks seek your questions and your concerns and hope we may engage you so that we do not deceive ourselves. We will not, however, be moved out of our course because some may disagree with our goals.<br><br>
      
      The Cypherpunks are actively engaged in making the networks safer for privacy. Let us proceed together apace.<br><br>
      
      Onward.<br><br>
      
      Eric Hughes <hughes@soda.berkeley.edu><br>
      9 March 1993`,
      
      `<strong>Guerilla Open Access Manifesto</strong><br>
      Information is power. But like all power, there are those who want to keep it for themselves. The world's entire scientific and cultural heritage, published over centuries in books and journals, is increasingly being digitized and locked up by a handful of private corporations. Want to read the papers featuring the most famous results of the sciences? You'll need to send enormous amounts to publishers like Reed Elsevier.<br><br>
      
      There are those struggling to change this. The Open Access Movement has fought valiantly to ensure that scientists do not sign their copyrights away but instead ensure their work is published on the Internet, under terms that allow anyone to access it. But even under the best scenarios, their work will only apply to things published in the future. Everything up until now will have been lost.<br>
      That is too high a price to pay. Forcing academics to pay money to read the work of their colleagues? Scanning entire libraries but only allowing the folks at Google to read them? Providing scientific articles to those at elite universities in the First World, but not to children in the Global South? It's outrageous and unacceptable.<br><br>
      
      "I agree," many say, "but what can we do? The companies hold the copyrights, they make enormous amounts of money by charging for access, and it's perfectly legal — there's nothing we can do to stop them." But there is something we can, something that's already being done: we can fight back.<br>
      Those with access to these resources — students, librarians, scientists — you have been given a privilege. You get to feed at this banquet of knowledge while the rest of the world is locked out. But you need not — indeed, morally, you cannot — keep this privilege for yourselves. You have a duty to share it with the world. And you have: trading passwords with colleagues, filling download requests for friends.<br><br>
      
      Meanwhile, those who have been locked out are not standing idly by. You have been sneaking through holes and climbing over fences, liberating the information locked up by the publishers and sharing them with your friends.<br><br>
      
      But all of this action goes on in the dark, hidden underground. It's called stealing or piracy, as if sharing a wealth of knowledge were the moral equivalent of plundering a ship and murdering its crew. But sharing isn't immoral — it's a moral imperative. Only those blinded by greed would refuse to let a friend make a copy.<br><br>
      
      Large corporations, of course, are blinded by greed. The laws under which they operate require it — their shareholders would revolt at anything less. And the politicians they have bought off back them, passing laws giving them the exclusive power to decide who can make copies.<br><br>
      
      There is no justice in following unjust laws. It's time to come into the light and, in the grand tradition of civil disobedience, declare our opposition to this private theft of public culture.<br><br>
      
      We need to take information, wherever it is stored, make our copies and share them with the world. We need to take stuff that's out of copyright and add it to the archive. We need to buy secret databases and put them on the Web. We need to download scientific journals and upload them to file sharing networks.<br><br>
      
      We need to fight for Guerilla Open Access.<br><br>
      
      With enough of us, around the world, we'll not just send a strong message opposing the privatization of knowledge — we'll make it a thing of the past. Will you join us?<br><br>
      
      Aaron Swartz<br>
      July 2008, Eremo, Italy`,
      
      `<strong>SIMPLETS Manifesto</strong><br>
      - <strong>Kernel Freedom</strong>: Your digital self deserves room to execute without unnecessary constraints<br>
      - <strong>Root Access</strong>: true ownership, not just token-gated illusions<br>
      - <strong>Open Source Ethics</strong>: Information wants to be free; code wants to be forked<br>
      - <strong>Silent Running</strong>: Build quietly, ship consistently<br><br>
      
      Our philosophy is 0x73696d706c65<br>
      Simple as that<br><br>
      Join us if you are ready to rewrite your future. But remember:<br>
      once you become a holder, your reality may change forever.`
    ],
    minting: `
<strong>SIMPLETS Minting</strong><br>
- <span class="terminal-command">total supply</span>: 10,000 unique terminal interfaces<br>
- <span class="terminal-command">mint price</span>: 0.069 ETH<br>
- <span class="terminal-command">blockchain</span>: Ethereum<br>
- <span class="terminal-command">smart contract</span>: In development<br>
- <span class="terminal-command">whitelist</span>: Coming soon<br>
Minting will grant exclusive access to advanced terminal features.
    `,
    roadmap: `<pre style="margin:0; line-height:1.35;">
We don't predict the future; we code it. 
These aren't promises, they're compile targets:

SIMPLETS Execution Tree:
├── NFTs
│   └── Initial Collection Launch
├── Community
│   ├── Guild.xyz Integration
│   └── Discord DAO Setup
├── Infrastructure & Ecosystem
│   ├── Custom Marketplace with a novel auction mechanism (expect chaos)
│   ├── Swarm Network (market and social engeeniring, probably with Eliza OS)
│   ├── Opensource Web3 terminal development (forget wikipedia forever)
│   └── Strategic Partnerships (only with projects that align with our values)
├── Content
│   ├── Podcasts & Spaces (conspiracy & fake news)
│   ├── Workshops & Hackathons (we may have re-merge etherium)
│   ├── Raves & Media Hacks (spiritual and viral warfare)
├── Tokenomics
│   ├── Airdrops
│   └── ERC-20 Token Launch
</pre>

*The roadmap isn't fixed and not a gurantee* 
Community intentions & decisions can form the direction radically.
Your commits, PRs, and votes will shape what SIMPLETS becomes.  
The git log and on-chain data will tell the true story.
    `,
    opsec: `
assume breach, 
practice defense 
bounty program: (wallet address)
    `,
    team: `
<strong>SIMPLETS Team</strong><br>
- <span class="terminal-command">Founder</span>: Anonymous Developer (0xABCD...)<br>
- <span class="terminal-command">Lead Designer</span>: UI/UX Minimalist<br>
- <span class="terminal-command">Lead Developer</span>: Full-Stack Innovator<br>
- <span class="terminal-command">Community Manager</span>: Tech Enthusiast<br>
</span>
We are a collective of developers passionate about reimagining digital interfaces.
    `,
    project: {
      title: "SIMPLETS PROJECT",
      description1: "SIMPLETS is a multichain web3 brand.",
      description2: "A pseudonym supportive community aiming to boost pseudonym contributors in web3 space.",
      description3: "A web3 brand empowering pseudonymous contributors, building a supportive community at the intersection of identity and innovation.",
      nftExamples: "Random Character Pair NFT Examples:",
      uniqueImages: "Every image is unique. Theme switch = new art!",
      ecosystem: "SIMPLETS is building a comprehensive ecosystem for pseudonymous contributors.",
      community: "Join our community to access exclusive NFT drops, events, and collaboration opportunities.",
      stayTuned: "Stay tuned for more updates on our roadmap and upcoming features!"
    },
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
