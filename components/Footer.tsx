import React, { useState } from 'react';
import { IconShield, IconX, IconChevronRight } from './Icons';

type ModalType = 'terms' | 'privacy' | 'security' | 'howItWorks' | 'responsible' | null;

export const Footer: React.FC = () => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="bg-gray-900 text-white mt-auto">
        {/* Main Footer */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Brand & Trust Badges */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">T</div>
                <h3 className="font-bold text-xl">TruvaMate</h3>
              </div>
              <p className="text-gray-400 text-sm max-w-md">
                Your trusted international lottery messenger service. We purchase official lottery tickets on your behalf from authorized retailers worldwide.
              </p>
            </div>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg text-xs">
                <span className="text-green-400">🔒</span> SSL Secured
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg text-xs">
                <span>🛡️</span> PCI Compliant
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg text-xs">
                <span>✓</span> Licensed
              </div>
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 text-sm">
            {/* Legal */}
            <div>
              <h4 className="font-bold text-white mb-3">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button onClick={() => setActiveModal('terms')} className="hover:text-white transition-colors">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveModal('privacy')} className="hover:text-white transition-colors">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveModal('responsible')} className="hover:text-white transition-colors">
                    Responsible Gaming
                  </button>
                </li>
              </ul>
            </div>

            {/* Security */}
            <div>
              <h4 className="font-bold text-white mb-3">Security</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button onClick={() => setActiveModal('security')} className="hover:text-white transition-colors">
                    Security & Safety
                  </button>
                </li>
                <li className="text-gray-500">256-bit Encryption</li>
                <li className="text-gray-500">Secure Payment</li>
              </ul>
            </div>

            {/* How It Works */}
            <div>
              <h4 className="font-bold text-white mb-3">Service</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button onClick={() => setActiveModal('howItWorks')} className="hover:text-white transition-colors">
                    How It Works
                  </button>
                </li>
                <li className="text-gray-500">FAQ</li>
                <li className="text-gray-500">Support</li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-white mb-3">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="text-gray-500">support@truvamate.com</li>
                <li className="text-gray-500">24/7 Customer Support</li>
              </ul>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-white/5 rounded-xl p-4 mb-6 text-xs text-gray-400 leading-relaxed">
            <p className="mb-2">
              <strong className="text-gray-300">⚠️ Important Disclaimer:</strong> TruvaMate is a messenger service that purchases official lottery tickets on behalf of customers from authorized lottery retailers. 
              We are NOT the lottery operator. Lottery games are operated by official state/national lottery organizations.
            </p>
            <p className="mb-2">
              Lottery participation involves financial risk. Please play responsibly and within your means. 
              Players must be 18 years or older (21+ in some jurisdictions). Gambling can be addictive - if you need help, please contact your local gambling helpline.
            </p>
            <p>
              Odds of winning vary by game. Jackpot prizes displayed are estimated and subject to change. 
              Service fees apply to all ticket purchases. Winnings may be subject to applicable taxes in your jurisdiction.
            </p>
          </div>

          {/* Age & Licensing */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6 text-xs text-gray-500">
            <div className="flex items-center gap-2 bg-red-900/30 px-3 py-1.5 rounded-full border border-red-800/50">
              <span className="text-lg">🔞</span> 18+ Only
            </div>
            <div className="flex items-center gap-2">
              <IconShield className="w-4 h-4 text-green-500" />
              Regulated & Licensed
            </div>
            <div>Responsible Gaming Certified</div>
          </div>

          {/* Payment Methods */}
          <div className="text-center mb-6">
            <p className="text-gray-500 text-xs mb-3">Accepted Payment Methods</p>
            <div className="flex flex-wrap justify-center gap-3">
              <div className="bg-white/10 px-3 py-1.5 rounded text-xs">💳 Visa</div>
              <div className="bg-white/10 px-3 py-1.5 rounded text-xs">💳 Mastercard</div>
              <div className="bg-white/10 px-3 py-1.5 rounded text-xs">🏦 Bank Transfer</div>
              <div className="bg-white/10 px-3 py-1.5 rounded text-xs">📱 PromptPay</div>
              <div className="bg-white/10 px-3 py-1.5 rounded text-xs">💚 TrueMoney</div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 pt-6 text-center text-gray-500 text-xs">
            <p>© {currentYear} TruvaMate. All rights reserved.</p>
            <p className="mt-1">
              Powerball® is a registered trademark of the Multi-State Lottery Association. 
              Mega Millions® is a registered trademark of the Mega Millions Consortium. 
              EuroJackpot® is a registered trademark of Westdeutsche Lotterie GmbH & Co. OHG.
            </p>
          </div>
        </div>
      </footer>

      {/* --- MODALS --- */}
      
      {/* Terms of Service Modal */}
      {activeModal === 'terms' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setActiveModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-lg">Terms of Service</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-white/20 rounded-full transition">
                <IconX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] text-sm text-gray-600 space-y-4">
              <section>
                <h4 className="font-bold text-gray-800 mb-2">1. Introduction</h4>
                <p>Welcome to TruvaMate. By using our services, you agree to be bound by these Terms of Service. Please read them carefully before using our platform.</p>
              </section>
              
              <section>
                <h4 className="font-bold text-gray-800 mb-2">2. Service Description</h4>
                <p>TruvaMate operates as a lottery messenger service. We purchase official lottery tickets on your behalf from authorized lottery retailers. We are NOT a lottery operator and do not conduct any lottery draws ourselves.</p>
              </section>

              <section>
                <h4 className="font-bold text-gray-800 mb-2">3. Eligibility</h4>
                <p>You must be at least 18 years of age (or 21 in jurisdictions where required) to use our services. You are responsible for ensuring that online lottery ticket purchasing is legal in your jurisdiction.</p>
              </section>

              <section>
                <h4 className="font-bold text-gray-800 mb-2">4. Account Registration</h4>
                <p>You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials.</p>
              </section>

              <section>
                <h4 className="font-bold text-gray-800 mb-2">5. Ticket Purchases</h4>
                <p>When you place an order, we purchase official lottery tickets from authorized retailers. A scanned copy of your physical ticket will be uploaded to your account before each draw. Original tickets are stored securely.</p>
              </section>

              <section>
                <h4 className="font-bold text-gray-800 mb-2">6. Service Fees</h4>
                <p>Our service fees are clearly displayed during checkout. These fees cover the cost of purchasing, scanning, securing, and managing your lottery tickets.</p>
              </section>

              <section>
                <h4 className="font-bold text-gray-800 mb-2">7. Prize Claims</h4>
                <p>Small prizes will be automatically credited to your account. For large prizes, our team will assist you through the claiming process, which may require identity verification and documentation.</p>
              </section>

              <section>
                <h4 className="font-bold text-gray-800 mb-2">8. No Refunds</h4>
                <p>Once a ticket has been purchased and confirmed, it cannot be cancelled or refunded. Please review your selections carefully before completing your purchase.</p>
              </section>

              <section>
                <h4 className="font-bold text-gray-800 mb-2">9. Limitation of Liability</h4>
                <p>TruvaMate is not liable for any losses resulting from lottery participation. We are not responsible for lottery operator errors, draw cancellations, or prize disputes with lottery authorities.</p>
              </section>

              <section>
                <h4 className="font-bold text-gray-800 mb-2">10. Governing Law</h4>
                <p>These terms shall be governed by and construed in accordance with applicable laws. Any disputes shall be resolved through binding arbitration.</p>
              </section>

              <p className="text-gray-400 text-xs pt-4">Last updated: November 2025</p>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {activeModal === 'privacy' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setActiveModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-lg">Privacy Policy</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-white/20 rounded-full transition">
                <IconX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] text-sm text-gray-600 space-y-4">
              <section>
                <h4 className="font-bold text-gray-800 mb-2">1. Information We Collect</h4>
                <p>We collect information you provide directly, including name, email, phone number, payment details, and identity documents for prize claims. We also collect device information, IP addresses, and usage data.</p>
              </section>

              <section>
                <h4 className="font-bold text-gray-800 mb-2">2. How We Use Your Information</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>To provide and maintain our services</li>
                  <li>To process ticket purchases and payments</li>
                  <li>To notify you of lottery results and winnings</li>
                  <li>To comply with legal and regulatory requirements</li>
                  <li>To prevent fraud and ensure security</li>
                  <li>To improve our services</li>
                </ul>
              </section>

              <section>
                <h4 className="font-bold text-gray-800 mb-2">3. Data Security</h4>
                <p>We implement industry-standard security measures including 256-bit SSL encryption, secure data centers, and regular security audits. Payment information is processed through PCI-DSS compliant payment processors.</p>
              </section>

              <section>
                <h4 className="font-bold text-gray-800 mb-2">4. Data Sharing</h4>
                <p>We do not sell your personal information. We may share data with lottery authorities for prize claims, payment processors, and as required by law.</p>
              </section>

              <section>
                <h4 className="font-bold text-gray-800 mb-2">5. Data Retention</h4>
                <p>We retain your data for as long as your account is active and as required by law. Ticket records are kept for 7 years for audit purposes.</p>
              </section>

              <section>
                <h4 className="font-bold text-gray-800 mb-2">6. Your Rights</h4>
                <p>You have the right to access, correct, or delete your personal information. You may also request data portability or opt out of marketing communications.</p>
              </section>

              <section>
                <h4 className="font-bold text-gray-800 mb-2">7. Cookies</h4>
                <p>We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content. You can manage cookie preferences in your browser settings.</p>
              </section>

              <section>
                <h4 className="font-bold text-gray-800 mb-2">8. Contact Us</h4>
                <p>For privacy-related inquiries, contact us at privacy@truvamate.com</p>
              </section>

              <p className="text-gray-400 text-xs pt-4">Last updated: November 2025</p>
            </div>
          </div>
        </div>
      )}

      {/* Security Modal */}
      {activeModal === 'security' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setActiveModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-green-600 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-lg">🔒 Security & Safety</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-white/20 rounded-full transition">
                <IconX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] text-sm text-gray-600 space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                <p className="text-green-800 font-medium">✓ Your security is our top priority. We employ multiple layers of protection to keep your data and tickets safe.</p>
              </div>

              <section>
                <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="text-green-500">🔐</span> Data Encryption
                </h4>
                <p>All data transmitted between your device and our servers is protected with 256-bit SSL/TLS encryption - the same level of security used by major banks.</p>
              </section>

              <section>
                <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="text-blue-500">💳</span> PCI DSS Compliance
                </h4>
                <p>Our payment processing is fully PCI DSS compliant. We never store your full credit card details on our servers. All payments are processed through certified payment gateways.</p>
              </section>

              <section>
                <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="text-purple-500">🏦</span> Secure Ticket Storage
                </h4>
                <p>Physical lottery tickets are stored in fireproof, climate-controlled safes at secure facilities. Each ticket is photographed and scanned for your records before being stored.</p>
              </section>

              <section>
                <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="text-orange-500">🔍</span> Fraud Prevention
                </h4>
                <p>We employ advanced fraud detection systems to protect against unauthorized access. Suspicious activities trigger immediate security reviews and account protection measures.</p>
              </section>

              <section>
                <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="text-red-500">🛡️</span> Account Protection
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Two-factor authentication (2FA) available</li>
                  <li>Login notifications and alerts</li>
                  <li>Session management and automatic logout</li>
                  <li>Password encryption with bcrypt hashing</li>
                </ul>
              </section>

              <section>
                <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="text-teal-500">☁️</span> Infrastructure Security
                </h4>
                <p>Our systems are hosted in Tier-4 data centers with 24/7 monitoring, redundant power supplies, and regular security audits by independent third parties.</p>
              </section>

              <section>
                <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="text-indigo-500">📋</span> Regular Audits
                </h4>
                <p>We undergo regular security assessments and penetration testing to identify and address potential vulnerabilities before they can be exploited.</p>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* How It Works Modal */}
      {activeModal === 'howItWorks' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setActiveModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-purple-600 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-lg">⚙️ How TruvaMate Works</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-white/20 rounded-full transition">
                <IconX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] text-sm text-gray-600 space-y-6">
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <p className="text-purple-800 font-medium">TruvaMate is a lottery messenger service - we purchase official lottery tickets on your behalf from authorized retailers around the world.</p>
              </div>

              {/* Step by step */}
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">1</div>
                  <div>
                    <h5 className="font-bold text-gray-800">Choose Your Game & Numbers</h5>
                    <p className="text-gray-600">Select from world-famous lotteries like Powerball, Mega Millions, and EuroJackpot. Pick your lucky numbers or use Quick Pick for random selection.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">2</div>
                  <div>
                    <h5 className="font-bold text-gray-800">We Purchase Official Tickets</h5>
                    <p className="text-gray-600">Our local agents purchase physical tickets from authorized lottery retailers in the respective countries. No synthetic or virtual tickets - only genuine entries.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">3</div>
                  <div>
                    <h5 className="font-bold text-gray-800">Ticket Scan & Secure Storage</h5>
                    <p className="text-gray-600">Your ticket is scanned and uploaded to your account before the draw. The physical ticket is stored in a secure, fireproof safe.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">4</div>
                  <div>
                    <h5 className="font-bold text-gray-800">Automatic Result Checking</h5>
                    <p className="text-gray-600">We automatically check your tickets after each draw and notify you immediately of any winnings via email and app notification.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">5</div>
                  <div>
                    <h5 className="font-bold text-gray-800">Collect Your Winnings</h5>
                    <p className="text-gray-600">Small prizes are credited directly to your account. For major prizes, our dedicated team assists you through the entire claiming process.</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-100 rounded-xl p-4">
                <h5 className="font-bold text-gray-800 mb-2">Why Use a Messenger Service?</h5>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Play international lotteries from anywhere in the world</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>100% official tickets - your ticket is your ticket</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Never miss a draw or lose a ticket</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Professional assistance for prize claims</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Responsible Gaming Modal */}
      {activeModal === 'responsible' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setActiveModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-amber-500 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-lg">🎯 Responsible Gaming</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-white/20 rounded-full transition">
                <IconX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] text-sm text-gray-600 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-amber-800 font-medium">Lottery games should be fun and entertaining. We are committed to promoting responsible gaming and helping you stay in control.</p>
              </div>

              <section>
                <h4 className="font-bold text-gray-800 mb-2">Play Responsibly</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    <span>Only spend what you can afford to lose</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    <span>Set a budget and stick to it</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    <span>Never chase losses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    <span>Take regular breaks from gambling</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    <span>Don't gamble when upset or depressed</span>
                  </li>
                </ul>
              </section>

              <section>
                <h4 className="font-bold text-gray-800 mb-2">Our Responsible Gaming Tools</h4>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h5 className="font-medium text-gray-800">Deposit Limits</h5>
                    <p className="text-gray-600 text-xs">Set daily, weekly, or monthly deposit limits to control your spending.</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h5 className="font-medium text-gray-800">Self-Exclusion</h5>
                    <p className="text-gray-600 text-xs">Take a break by excluding yourself from our platform for a chosen period.</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h5 className="font-medium text-gray-800">Activity History</h5>
                    <p className="text-gray-600 text-xs">Review your purchase history to track your spending patterns.</p>
                  </div>
                </div>
              </section>

              <section>
                <h4 className="font-bold text-gray-800 mb-2">Warning Signs of Problem Gambling</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Spending more than you can afford</li>
                  <li>• Borrowing money to gamble</li>
                  <li>• Gambling interfering with work or relationships</li>
                  <li>• Feeling anxious or stressed about gambling</li>
                  <li>• Lying about gambling habits</li>
                </ul>
              </section>

              <section>
                <h4 className="font-bold text-gray-800 mb-2">Get Help</h4>
                <p className="mb-3">If you or someone you know has a gambling problem, please reach out for help:</p>
                <div className="space-y-2">
                  <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                    <p className="font-medium text-red-800">National Problem Gambling Helpline</p>
                    <p className="text-red-700">1-800-522-4700 (24/7)</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                    <p className="font-medium text-blue-800">Gamblers Anonymous</p>
                    <p className="text-blue-700">www.gamblersanonymous.org</p>
                  </div>
                </div>
              </section>

              <div className="flex items-center gap-3 pt-4">
                <span className="text-3xl">🔞</span>
                <p className="text-gray-800 font-medium">You must be 18 years or older to use this service. Some jurisdictions require players to be 21+.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
