import React, { useState } from 'react';
import { IconChevronRight, IconCheckCircle, IconTicket, IconTrophy, IconScan } from './Icons';

type GameTab = 'powerball' | 'megamillions' | 'eurojackpot';

interface Step {
  number: number;
  title: string;
  description: string;
  tips?: string[];
}

interface PrizeInfo {
  match: string;
  prize: string;
  odds: string;
}

export const HowToPlayView: React.FC = () => {
  const [activeGame, setActiveGame] = useState<GameTab>('powerball');
  const [expandedSection, setExpandedSection] = useState<string | null>('basics');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Game-specific data
  const gameData = {
    powerball: {
      name: 'Powerball',
      color: 'bg-red-600',
      accentColor: 'text-red-600',
      lightBg: 'bg-red-50',
      borderColor: 'border-red-200',
      ticketPrice: '$2',
      powerPlayPrice: '$1',
      mainNumbers: { count: 5, range: '1-69' },
      powerNumber: { name: 'Powerball', range: '1-26' },
      drawDays: 'Monday, Wednesday & Saturday',
      drawTime: '10:59 PM ET',
      jackpotStart: '$20 Million',
      steps: [
        {
          number: 1,
          title: 'Choose Your Numbers',
          description: 'Select 5 main numbers from 1 to 69. You can pick your own lucky numbers or use Quick Pick for random selection.',
          tips: ['Many winners use birthdays, anniversaries, or other meaningful numbers', 'Quick Pick generates truly random numbers with the same odds of winning']
        },
        {
          number: 2,
          title: 'Pick Your Powerball',
          description: 'Select 1 Powerball number from 1 to 26. This special number is drawn from a separate drum.',
          tips: ['The Powerball is crucial for winning the jackpot', 'You need to match this number along with all 5 main numbers to win big']
        },
        {
          number: 3,
          title: 'Add Power Play (Optional)',
          description: 'For an extra $1 per play, add the Power Play option to multiply your non-jackpot prizes by 2x, 3x, 4x, 5x, or even 10x!',
          tips: ['10x multiplier is only available when jackpot is $150 million or less', 'Match 5+0 (no Powerball) automatically becomes $2 million with Power Play']
        },
        {
          number: 4,
          title: 'Select Draw Days',
          description: 'Choose which draws you want to enter. Powerball draws are held three times a week.',
          tips: ['You can play up to 26 consecutive draws in advance', 'Playing multiple draws increases your chances over time']
        },
        {
          number: 5,
          title: 'Complete Your Purchase',
          description: 'Review your ticket, confirm your numbers, and complete the payment. Your ticket will be securely stored in your account.',
          tips: ['Always double-check your numbers before confirming', 'You will receive a confirmation email with your ticket details']
        }
      ] as Step[],
      prizes: [
        { match: '5 + Powerball', prize: 'JACKPOT', odds: '1 in 292,201,338' },
        { match: '5', prize: '$1,000,000', odds: '1 in 11,688,054' },
        { match: '4 + Powerball', prize: '$50,000', odds: '1 in 913,129' },
        { match: '4', prize: '$100', odds: '1 in 36,525' },
        { match: '3 + Powerball', prize: '$100', odds: '1 in 14,494' },
        { match: '3', prize: '$7', odds: '1 in 580' },
        { match: '2 + Powerball', prize: '$7', odds: '1 in 701' },
        { match: '1 + Powerball', prize: '$4', odds: '1 in 92' },
        { match: 'Powerball only', prize: '$4', odds: '1 in 38' },
      ] as PrizeInfo[],
      overallOdds: '1 in 24.9'
    },
    megamillions: {
      name: 'Mega Millions',
      color: 'bg-blue-600',
      accentColor: 'text-blue-600',
      lightBg: 'bg-blue-50',
      borderColor: 'border-blue-200',
      ticketPrice: '$2',
      powerPlayPrice: '$1 (Megaplier)',
      mainNumbers: { count: 5, range: '1-70' },
      powerNumber: { name: 'Mega Ball', range: '1-25' },
      drawDays: 'Tuesday & Friday',
      drawTime: '11:00 PM ET',
      jackpotStart: '$20 Million',
      steps: [
        {
          number: 1,
          title: 'Choose Your Numbers',
          description: 'Select 5 main numbers from 1 to 70. Pick meaningful numbers or let Quick Pick choose for you.',
          tips: ['The number pool is slightly larger than Powerball (70 vs 69)', 'Statistical analysis shows no number is "luckier" than others']
        },
        {
          number: 2,
          title: 'Pick Your Mega Ball',
          description: 'Select 1 Mega Ball number from 1 to 25. This golden ball determines if you hit the jackpot!',
          tips: ['The Mega Ball pool is smaller (25 vs 26 for Powerball)', 'You must match this number to win the top prize']
        },
        {
          number: 3,
          title: 'Add Megaplier (Optional)',
          description: 'For an extra $1, add the Megaplier to multiply non-jackpot prizes by 2x, 3x, 4x, or 5x.',
          tips: ['Unlike Powerball, Mega Millions caps at 5x multiplier', 'The Megaplier is drawn before the main numbers']
        },
        {
          number: 4,
          title: 'Select Draw Days',
          description: 'Choose your draw dates. Mega Millions draws are held twice weekly on Tuesday and Friday nights.',
          tips: ['Friday draws often have larger jackpots due to more players', 'You can play up to 15 consecutive draws']
        },
        {
          number: 5,
          title: 'Complete Your Purchase',
          description: 'Verify your selections, complete payment, and your ticket is automatically saved to your account.',
          tips: ['Take a screenshot of your ticket for personal records', 'Results are posted within minutes of the draw']
        }
      ] as Step[],
      prizes: [
        { match: '5 + Mega Ball', prize: 'JACKPOT', odds: '1 in 302,575,350' },
        { match: '5', prize: '$1,000,000', odds: '1 in 12,607,306' },
        { match: '4 + Mega Ball', prize: '$10,000', odds: '1 in 931,001' },
        { match: '4', prize: '$500', odds: '1 in 38,792' },
        { match: '3 + Mega Ball', prize: '$200', odds: '1 in 14,547' },
        { match: '3', prize: '$10', odds: '1 in 606' },
        { match: '2 + Mega Ball', prize: '$10', odds: '1 in 693' },
        { match: '1 + Mega Ball', prize: '$4', odds: '1 in 89' },
        { match: 'Mega Ball only', prize: '$2', odds: '1 in 37' },
      ] as PrizeInfo[],
      overallOdds: '1 in 24'
    },
    eurojackpot: {
      name: 'EuroJackpot',
      color: 'bg-amber-500',
      accentColor: 'text-amber-600',
      lightBg: 'bg-amber-50',
      borderColor: 'border-amber-200',
      ticketPrice: '€2',
      powerPlayPrice: 'N/A',
      mainNumbers: { count: 5, range: '1-50' },
      powerNumber: { name: 'Euro Numbers', range: '2 from 1-12' },
      drawDays: 'Tuesday & Friday',
      drawTime: '9:00 PM CET',
      jackpotStart: '€10 Million',
      steps: [
        {
          number: 1,
          title: 'Choose Your Main Numbers',
          description: 'Select 5 main numbers from 1 to 50. These are drawn from the main drum.',
          tips: ['EuroJackpot has better odds than US lotteries', 'The smaller number pool means more frequent winners']
        },
        {
          number: 2,
          title: 'Pick Two Euro Numbers',
          description: 'Select 2 Euro Numbers from 1 to 12. Both must match to win the jackpot!',
          tips: ['Having two bonus numbers is unique to EuroJackpot', 'This creates more prize tiers and better mid-level odds']
        },
        {
          number: 3,
          title: 'Choose Your Draws',
          description: 'EuroJackpot draws take place every Tuesday and Friday at 9:00 PM CET in Helsinki, Finland.',
          tips: ['Results are available immediately after the draw', '18 European countries participate']
        },
        {
          number: 4,
          title: 'Complete Your Purchase',
          description: 'Review your numbers and complete the transaction. Your ticket is stored securely online.',
          tips: ['Jackpot cap is €120 million', 'If not won, excess rolls over to second prize tier']
        }
      ] as Step[],
      prizes: [
        { match: '5 + 2 Euro', prize: 'JACKPOT', odds: '1 in 139,838,160' },
        { match: '5 + 1 Euro', prize: '€1,000,000+', odds: '1 in 6,991,908' },
        { match: '5', prize: '€100,000+', odds: '1 in 3,107,515' },
        { match: '4 + 2 Euro', prize: '€5,000+', odds: '1 in 621,503' },
        { match: '4 + 1 Euro', prize: '€200+', odds: '1 in 31,075' },
        { match: '4', prize: '€100+', odds: '1 in 13,811' },
        { match: '3 + 2 Euro', prize: '€50+', odds: '1 in 10,370' },
        { match: '2 + 2 Euro', prize: '€20+', odds: '1 in 672' },
        { match: '3 + 1 Euro', prize: '€15+', odds: '1 in 518' },
        { match: '3', prize: '€10+', odds: '1 in 230' },
        { match: '1 + 2 Euro', prize: '€10+', odds: '1 in 128' },
        { match: '2 + 1 Euro', prize: '€7+', odds: '1 in 56' },
      ] as PrizeInfo[],
      overallOdds: '1 in 26'
    }
  };

  const currentGame = gameData[activeGame];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">How to Play</h1>
        <p className="text-gray-500">Complete guide to playing and winning lottery games</p>
      </div>

      {/* Game Tabs */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar p-1">
        {Object.entries(gameData).map(([key, game]) => (
          <button
            key={key}
            onClick={() => setActiveGame(key as GameTab)}
            className={`flex-1 min-w-[100px] py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
              activeGame === key
                ? `${game.color} text-white shadow-lg`
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {game.name}
          </button>
        ))}
      </div>

      {/* Game Header Card */}
      <div className={`${currentGame.color} rounded-2xl p-6 text-white shadow-lg`}>
        <h2 className="text-2xl font-bold mb-2">{currentGame.name}</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="opacity-80">Ticket Price</p>
            <p className="font-bold text-lg">{currentGame.ticketPrice}</p>
          </div>
          <div>
            <p className="opacity-80">Draw Days</p>
            <p className="font-bold">{currentGame.drawDays}</p>
          </div>
          <div>
            <p className="opacity-80">Draw Time</p>
            <p className="font-bold">{currentGame.drawTime}</p>
          </div>
          <div>
            <p className="opacity-80">Starting Jackpot</p>
            <p className="font-bold">{currentGame.jackpotStart}</p>
          </div>
        </div>
      </div>

      {/* Collapsible Sections */}
      <div className="space-y-3">
        {/* Basics Section */}
        <div className={`bg-white rounded-2xl border ${currentGame.borderColor} overflow-hidden`}>
          <button
            onClick={() => toggleSection('basics')}
            className={`w-full p-4 flex items-center justify-between ${currentGame.lightBg}`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${currentGame.color} text-white`}>
                <IconTicket className="w-5 h-5" />
              </div>
              <span className="font-bold text-gray-800">Game Basics</span>
            </div>
            <IconChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'basics' ? 'rotate-90' : ''}`} />
          </button>
          
          {expandedSection === 'basics' && (
            <div className="p-4 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl ${currentGame.lightBg}`}>
                  <h4 className={`font-bold ${currentGame.accentColor} mb-2`}>Main Numbers</h4>
                  <p className="text-gray-600">
                    Pick <span className="font-bold">{currentGame.mainNumbers.count} numbers</span> from <span className="font-bold">{currentGame.mainNumbers.range}</span>
                  </p>
                </div>
                <div className={`p-4 rounded-xl ${currentGame.lightBg}`}>
                  <h4 className={`font-bold ${currentGame.accentColor} mb-2`}>{currentGame.powerNumber.name}</h4>
                  <p className="text-gray-600">
                    Pick <span className="font-bold">{activeGame === 'eurojackpot' ? '2 numbers' : '1 number'}</span> from <span className="font-bold">{currentGame.powerNumber.range}</span>
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-bold text-gray-800 mb-2">💡 Quick Pick vs Manual Selection</h4>
                <p className="text-gray-600 text-sm">
                  <strong>Quick Pick:</strong> Let the computer randomly select your numbers. About 70% of lottery winners use Quick Pick!
                </p>
                <p className="text-gray-600 text-sm mt-2">
                  <strong>Manual:</strong> Choose your own lucky numbers based on birthdays, anniversaries, or any numbers meaningful to you.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Step by Step Section */}
        <div className={`bg-white rounded-2xl border ${currentGame.borderColor} overflow-hidden`}>
          <button
            onClick={() => toggleSection('steps')}
            className={`w-full p-4 flex items-center justify-between ${currentGame.lightBg}`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${currentGame.color} text-white`}>
                <IconCheckCircle className="w-5 h-5" />
              </div>
              <span className="font-bold text-gray-800">Step-by-Step Guide</span>
            </div>
            <IconChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'steps' ? 'rotate-90' : ''}`} />
          </button>
          
          {expandedSection === 'steps' && (
            <div className="p-4 space-y-4">
              {currentGame.steps.map((step, index) => (
                <div key={step.number} className="relative">
                  {index < currentGame.steps.length - 1 && (
                    <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200"></div>
                  )}
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-full ${currentGame.color} text-white flex items-center justify-center font-bold text-lg shrink-0 z-10`}>
                      {step.number}
                    </div>
                    <div className="flex-1 pb-4">
                      <h4 className="font-bold text-gray-800 text-lg mb-1">{step.title}</h4>
                      <p className="text-gray-600 mb-3">{step.description}</p>
                      {step.tips && step.tips.length > 0 && (
                        <div className={`${currentGame.lightBg} rounded-lg p-3`}>
                          <p className={`text-xs font-bold ${currentGame.accentColor} mb-1`}>💡 PRO TIPS</p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {step.tips.map((tip, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-green-500 mt-0.5">✓</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Prize Tiers Section */}
        <div className={`bg-white rounded-2xl border ${currentGame.borderColor} overflow-hidden`}>
          <button
            onClick={() => toggleSection('prizes')}
            className={`w-full p-4 flex items-center justify-between ${currentGame.lightBg}`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${currentGame.color} text-white`}>
                <IconTrophy className="w-5 h-5" />
              </div>
              <span className="font-bold text-gray-800">Prize Tiers & Odds</span>
            </div>
            <IconChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'prizes' ? 'rotate-90' : ''}`} />
          </button>
          
          {expandedSection === 'prizes' && (
            <div className="p-4">
              <div className={`${currentGame.lightBg} rounded-xl p-3 mb-4`}>
                <p className="text-center">
                  <span className="text-gray-600">Overall odds of winning any prize: </span>
                  <span className={`font-bold ${currentGame.accentColor}`}>{currentGame.overallOdds}</span>
                </p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`${currentGame.lightBg}`}>
                      <th className="text-left p-3 font-bold text-gray-700">Match</th>
                      <th className="text-right p-3 font-bold text-gray-700">Prize</th>
                      <th className="text-right p-3 font-bold text-gray-700">Odds</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentGame.prizes.map((prize, index) => (
                      <tr key={index} className={`border-b border-gray-100 ${index === 0 ? 'bg-yellow-50' : ''}`}>
                        <td className="p-3 text-gray-800">{prize.match}</td>
                        <td className={`p-3 text-right font-bold ${index === 0 ? 'text-yellow-600' : currentGame.accentColor}`}>
                          {prize.prize}
                        </td>
                        <td className="p-3 text-right text-gray-500 text-xs">{prize.odds}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Important Rules Section */}
        <div className={`bg-white rounded-2xl border ${currentGame.borderColor} overflow-hidden`}>
          <button
            onClick={() => toggleSection('rules')}
            className={`w-full p-4 flex items-center justify-between ${currentGame.lightBg}`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${currentGame.color} text-white`}>
                <IconScan className="w-5 h-5" />
              </div>
              <span className="font-bold text-gray-800">Important Rules & Tips</span>
            </div>
            <IconChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'rules' ? 'rotate-90' : ''}`} />
          </button>
          
          {expandedSection === 'rules' && (
            <div className="p-4 space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
                  <span className="text-2xl">✅</span>
                  <div>
                    <h5 className="font-bold text-gray-800">Claiming Prizes</h5>
                    <p className="text-sm text-gray-600">Small prizes are automatically credited to your account. Large prizes may require identity verification.</p>
                  </div>
                </div>
                
                <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
                  <span className="text-2xl">🔒</span>
                  <div>
                    <h5 className="font-bold text-gray-800">Ticket Security</h5>
                    <p className="text-sm text-gray-600">All tickets are stored securely in your account. You will receive email confirmation for every purchase.</p>
                  </div>
                </div>
                
                <div className="flex gap-3 p-3 bg-yellow-50 rounded-xl">
                  <span className="text-2xl">⏰</span>
                  <div>
                    <h5 className="font-bold text-gray-800">Cut-off Times</h5>
                    <p className="text-sm text-gray-600">Ticket sales close approximately 1-2 hours before each draw. Make sure to purchase early!</p>
                  </div>
                </div>
                
                <div className="flex gap-3 p-3 bg-purple-50 rounded-xl">
                  <span className="text-2xl">🌍</span>
                  <div>
                    <h5 className="font-bold text-gray-800">International Play</h5>
                    <p className="text-sm text-gray-600">You can play from anywhere in the world! We purchase official tickets on your behalf from authorized retailers.</p>
                  </div>
                </div>
                
                <div className="flex gap-3 p-3 bg-red-50 rounded-xl">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <h5 className="font-bold text-gray-800">Age Requirement</h5>
                    <p className="text-sm text-gray-600">You must be 18 years or older to play. Some jurisdictions require players to be 21+.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900 text-white rounded-xl p-4">
                <h5 className="font-bold mb-2">🎯 Winning Strategies</h5>
                <ul className="text-sm space-y-2 text-gray-300">
                  <li>• <strong>Play consistently:</strong> Regular players have better long-term odds</li>
                  <li>• <strong>Join syndicates:</strong> Pool resources with others for more tickets</li>
                  <li>• <strong>Avoid popular numbers:</strong> Unique combinations mean less sharing if you win</li>
                  <li>• <strong>Set a budget:</strong> Only play what you can afford to lose</li>
                  <li>• <strong>Check results:</strong> Always verify your numbers after each draw</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FAQ Quick Links */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
        <h3 className="font-bold text-lg mb-4">Frequently Asked Questions</h3>
        <div className="space-y-3">
          <details className="group">
            <summary className="cursor-pointer flex items-center justify-between p-3 bg-white/10 rounded-lg hover:bg-white/20 transition">
              <span>What happens if I win the jackpot?</span>
              <IconChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
            </summary>
            <p className="text-gray-300 text-sm p-3">
              If you win a major prize, our team will contact you immediately. We assist with the entire claiming process, 
              including identity verification, documentation, and coordination with lottery authorities. For jackpots, 
              you can choose between a lump sum payment or annuity payments over 29-30 years.
            </p>
          </details>
          
          <details className="group">
            <summary className="cursor-pointer flex items-center justify-between p-3 bg-white/10 rounded-lg hover:bg-white/20 transition">
              <span>Are my winnings taxed?</span>
              <IconChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
            </summary>
            <p className="text-gray-300 text-sm p-3">
              Tax laws vary by country. US lottery prizes over $600 are subject to federal taxes (24-37%). 
              International players may also face taxes in their home country. We recommend consulting a tax 
              professional for large wins.
            </p>
          </details>
          
          <details className="group">
            <summary className="cursor-pointer flex items-center justify-between p-3 bg-white/10 rounded-lg hover:bg-white/20 transition">
              <span>Can I cancel my ticket after purchase?</span>
              <IconChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
            </summary>
            <p className="text-gray-300 text-sm p-3">
              Once a ticket is purchased and confirmed, it cannot be cancelled or refunded. Please double-check 
              your numbers and selections before completing your purchase.
            </p>
          </details>
          
          <details className="group">
            <summary className="cursor-pointer flex items-center justify-between p-3 bg-white/10 rounded-lg hover:bg-white/20 transition">
              <span>How do I know my ticket is legitimate?</span>
              <IconChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
            </summary>
            <p className="text-gray-300 text-sm p-3">
              We purchase official tickets from authorized lottery retailers. You will receive a scanned copy 
              of your physical ticket in your account before each draw. All tickets are stored securely in 
              fireproof safes.
            </p>
          </details>
        </div>
      </div>

      {/* Play Now CTA */}
      <div className="text-center pt-4">
        <p className="text-gray-500 mb-4">Ready to try your luck?</p>
        <button className={`${currentGame.color} text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95`}>
          Play {currentGame.name} Now! 🎰
        </button>
      </div>
    </div>
  );
};
