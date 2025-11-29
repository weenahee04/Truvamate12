import React, { useState } from 'react';
import { IconUser, IconChevronRight, IconWallet, IconShield, IconBell, IconPhone, IconLogOut, IconBank, IconPlus, IconX, IconTrash, IconBuilding, IconCreditCard, IconScan, IconTicket, IconTrophy, IconInfo } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface ProfileViewProps {
  onGoToHistory?: () => void;
  onGoToResults?: () => void;
  onGoToHowToPlay?: () => void;
  onLogout?: () => void;
  onManageBanners?: () => void;
}

interface PaymentMethod {
    id: string;
    type: 'BANK' | 'WISE' | 'PAYPAL';
    bankName?: string;
    accountNumber?: string;
    accountHolderName?: string;
    swiftCode?: string;
    iban?: string;
    country?: string;
    email?: string;
    isPrimary: boolean;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onGoToHistory, onGoToResults, onGoToHowToPlay, onLogout, onManageBanners }) => {
  const [balance, setBalance] = useState(4250.00);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const { t } = useLanguage();
  
  // Mock User Data
  const [profile, setProfile] = useState({
    name: 'คุณวิน',
    email: 'win.lottery@example.com',
    phone: '081-234-5678'
  });

  // Mock Payout Methods
  const [payoutMethods, setPayoutMethods] = useState<PaymentMethod[]>([
      { 
          id: '1', 
          type: 'BANK', 
          bankName: 'Kasikorn Bank',
          accountNumber: '***-*-*1234-5',
          accountHolderName: 'Somsak Jaidee',
          country: 'Thailand',
          isPrimary: true 
      }
  ]);
  const [showAddMethodForm, setShowAddMethodForm] = useState(false);
  const [newMethodType, setNewMethodType] = useState<'BANK' | 'WISE' | 'PAYPAL'>('BANK');
  const [newMethodData, setNewMethodData] = useState({
      bankName: '',
      accountNumber: '',
      accountHolderName: '',
      swiftCode: '',
      iban: '',
      country: '',
      email: ''
  });

  const handleTopUp = (amount: number) => {
    // Simulate API call
    setTimeout(() => {
      setBalance(prev => prev + amount);
      setActiveModal(null);
      alert(`Top up success ${amount} THB`);
    }, 500);
  };

  const menuItems = [
    { id: 'HISTORY', label: t('profile.menu.history'), icon: <IconShield className="w-5 h-5 text-blue-500" />, action: () => onGoToHistory?.() },
    { id: 'PERSONAL', label: t('profile.menu.personal'), icon: <IconUser className="w-5 h-5 text-green-500" />, action: () => setActiveModal('PERSONAL') },
    { id: 'BANK', label: t('profile.menu.bank'), icon: <IconBank className="w-5 h-5 text-purple-500" />, action: () => setActiveModal('BANK') },
    { id: 'BANNERS', label: 'จัดการแบนเนอร์', icon: <IconScan className="w-5 h-5 text-indigo-500" />, action: () => onManageBanners?.() },
    { id: 'NOTIF', label: t('profile.menu.notif'), icon: <IconBell className="w-5 h-5 text-yellow-500" />, action: () => setActiveModal('NOTIF') },
    { id: 'CONTACT', label: t('profile.menu.contact'), icon: <IconPhone className="w-5 h-5 text-pink-500" />, action: () => setActiveModal('CONTACT') },
    { id: 'LOGOUT', label: t('profile.menu.logout'), icon: <IconLogOut className="w-5 h-5 text-red-500" />, action: () => setActiveModal('LOGOUT') },
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
       {/* Quick Access Menu - Mobile Only */}
       <div className="md:hidden bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
         <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
           <h3 className="text-sm font-bold text-gray-600">Quick Access</h3>
         </div>
         <div 
           onClick={() => onGoToHowToPlay?.()}
           className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors"
         >
           <div className="flex items-center gap-3">
             <div className="p-2 bg-purple-50 rounded-lg">
               <IconInfo className="w-5 h-5 text-purple-500" />
             </div>
             <span className="text-sm font-medium text-gray-700">How to Play</span>
           </div>
           <IconChevronRight className="w-4 h-4 text-gray-300" />
         </div>
       </div>

       <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-gradient-to-tr from-gray-200 to-gray-100 rounded-full flex items-center justify-center shadow-inner">
             <IconUser className="w-8 h-8 text-gray-400" />
          </div>
          <div>
             <h2 className="text-xl font-bold text-gray-800">{profile.name}</h2>
             <p className="text-sm text-gray-500">Member ID: 8849201</p>
          </div>
       </div>

       <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <IconWallet className="w-32 h-32" />
          </div>
          <p className="text-white/60 text-sm mb-1 relative z-10">{t('profile.wallet.balance')}</p>
          <div className="flex justify-between items-end relative z-10">
             <h3 className="text-3xl font-bold tracking-tight">฿ {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
             <button 
                onClick={() => setActiveModal('TOPUP')}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
             >
                <IconPlus className="w-3 h-3" /> {t('profile.wallet.topup')}
             </button>
          </div>
       </div>

       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {menuItems.map((item) => (
            <div 
                key={item.id} 
                onClick={item.action}
                className="flex items-center justify-between p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer last:border-0 transition-colors"
            >
               <div className="flex items-center gap-3">
                   <div className="p-2 bg-gray-50 rounded-lg">{item.icon}</div>
                   <span className={`text-sm font-medium ${item.id === 'LOGOUT' ? 'text-red-600' : 'text-gray-700'}`}>{item.label}</span>
               </div>
               <IconChevronRight className="w-4 h-4 text-gray-300" />
            </div>
          ))}
       </div>
       
       <p className="text-center text-xs text-gray-400 mt-8">TruvaMate v1.2.0 • Secure & Trusted</p>

       {/* --- MODALS --- */}

       {/* 1. Top Up Modal */}
       {activeModal === 'TOPUP' && (
         <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setActiveModal(null)}>
            <div className="bg-white w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-6 animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg">{t('profile.wallet.topup')}</h3>
                    <button onClick={() => setActiveModal(null)}><IconX className="w-6 h-6 text-gray-400" /></button>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {[100, 300, 500, 1000].map(amount => (
                        <button 
                            key={amount}
                            onClick={() => handleTopUp(amount)}
                            className="border border-gray-200 rounded-xl py-3 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 font-medium transition-all"
                        >
                            ฿ {amount}
                        </button>
                    ))}
                </div>
                <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-500 text-center">
                    Supports all Thai Banking Apps via QR PromptPay
                </div>
            </div>
         </div>
       )}

       {/* 2. Personal Info Modal */}
       {activeModal === 'PERSONAL' && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={() => setActiveModal(null)}>
            <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg">Edit Profile</h3>
                    <button onClick={() => setActiveModal(null)}><IconX className="w-6 h-6 text-gray-400" /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Display Name</label>
                        <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                        <input type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                        <input type="tel" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 outline-none" />
                    </div>
                    <button onClick={() => setActiveModal(null)} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold mt-2">Save Changes</button>
                </div>
            </div>
         </div>
       )}

       {/* 3. Payout Methods Modal (Bank/Card) */}
       {activeModal === 'BANK' && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={() => setActiveModal(null)}>
             <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-lg">Winning Payout Channels</h3>
                    <button onClick={() => { setActiveModal(null); setShowAddMethodForm(false); }}><IconX className="w-6 h-6 text-gray-400" /></button>
                </div>
                <p className="text-xs text-gray-500 mb-6 bg-blue-50 text-blue-700 p-3 rounded-lg border border-blue-100">
                    System will automatically transfer winnings to your primary account.
                </p>

                {!showAddMethodForm ? (
                    <>
                        <div className="space-y-3 mb-6">
                            {payoutMethods.map(method => (
                                <div key={method.id} className={`p-4 border rounded-xl ${method.isPrimary ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs ${
                                                method.type === 'BANK' ? 'bg-blue-600' : 
                                                method.type === 'WISE' ? 'bg-green-600' : 
                                                'bg-purple-600'
                                            }`}>
                                                {method.type === 'BANK' && <IconBuilding className="w-5 h-5"/>}
                                                {method.type === 'WISE' && <IconCreditCard className="w-5 h-5"/>}
                                                {method.type === 'PAYPAL' && <IconWallet className="w-5 h-5"/>}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-sm text-gray-800">
                                                        {method.type === 'BANK' && method.bankName}
                                                        {method.type === 'WISE' && 'Wise Transfer'}
                                                        {method.type === 'PAYPAL' && 'PayPal'}
                                                    </p>
                                                    {method.isPrimary && <span className="text-[10px] bg-green-200 text-green-800 px-2 py-1 rounded font-bold">Primary</span>}
                                                </div>
                                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                    <span className="font-medium">{method.country}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <button className="text-gray-400 hover:text-red-500 p-1"><IconTrash className="w-4 h-4"/></button>
                                    </div>
                                    <div className="bg-white/60 p-3 rounded-lg text-xs space-y-1">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Account Holder:</span>
                                            <span className="font-medium text-gray-800">{method.accountHolderName}</span>
                                        </div>
                                        {method.accountNumber && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Account:</span>
                                                <span className="font-mono text-gray-800">{method.accountNumber}</span>
                                            </div>
                                        )}
                                        {method.swiftCode && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">SWIFT:</span>
                                                <span className="font-mono text-gray-800">{method.swiftCode}</span>
                                            </div>
                                        )}
                                        {method.iban && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">IBAN:</span>
                                                <span className="font-mono text-gray-800">{method.iban}</span>
                                            </div>
                                        )}
                                        {method.email && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Email:</span>
                                                <span className="text-gray-800">{method.email}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button 
                            onClick={() => setShowAddMethodForm(true)}
                            className="w-full border-2 border-dashed border-gray-300 text-gray-500 py-3 rounded-xl font-medium hover:border-gray-400 hover:text-gray-600 flex items-center justify-center gap-2"
                        >
                            <IconPlus className="w-4 h-4" /> Add Payout Method
                        </button>
                    </>
                ) : (
                    <div className="animate-fade-in">
                        <h4 className="font-bold text-gray-700 mb-4 text-sm">Add International Payout Method</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">Transfer Method</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button 
                                        type="button"
                                        onClick={() => setNewMethodType('BANK')}
                                        className={`p-3 border-2 rounded-xl font-bold text-xs transition-all ${
                                            newMethodType === 'BANK' 
                                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                        }`}
                                    >
                                        <IconBuilding className="w-5 h-5 mx-auto mb-1" />
                                        Bank
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setNewMethodType('WISE')}
                                        className={`p-3 border-2 rounded-xl font-bold text-xs transition-all ${
                                            newMethodType === 'WISE' 
                                            ? 'border-green-500 bg-green-50 text-green-700' 
                                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                        }`}
                                    >
                                        <IconCreditCard className="w-5 h-5 mx-auto mb-1" />
                                        Wise
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setNewMethodType('PAYPAL')}
                                        className={`p-3 border-2 rounded-xl font-bold text-xs transition-all ${
                                            newMethodType === 'PAYPAL' 
                                            ? 'border-purple-500 bg-purple-50 text-purple-700' 
                                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                        }`}
                                    >
                                        <IconWallet className="w-5 h-5 mx-auto mb-1" />
                                        PayPal
                                    </button>
                                </div>
                            </div>

                            {/* PayPal Form */}
                            {newMethodType === 'PAYPAL' && (
                                <div className="space-y-3">
                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs text-blue-700">
                                        💡 Winnings will be sent to your PayPal account email
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">PayPal Email *</label>
                                        <input 
                                            type="email" 
                                            placeholder="your.email@example.com"
                                            value={newMethodData.email}
                                            onChange={e => setNewMethodData({...newMethodData, email: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Account Holder Name *</label>
                                        <input 
                                            type="text" 
                                            placeholder="John Doe"
                                            value={newMethodData.accountHolderName}
                                            onChange={e => setNewMethodData({...newMethodData, accountHolderName: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500" 
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Wise Form */}
                            {newMethodType === 'WISE' && (
                                <div className="space-y-3">
                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs text-blue-700">
                                        💡 Fast & low-cost international transfers via Wise
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Email registered with Wise *</label>
                                        <input 
                                            type="email" 
                                            placeholder="your.email@example.com"
                                            value={newMethodData.email}
                                            onChange={e => setNewMethodData({...newMethodData, email: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Account Holder Name *</label>
                                        <input 
                                            type="text" 
                                            placeholder="John Doe"
                                            value={newMethodData.accountHolderName}
                                            onChange={e => setNewMethodData({...newMethodData, accountHolderName: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Country *</label>
                                        <select 
                                            value={newMethodData.country}
                                            onChange={e => setNewMethodData({...newMethodData, country: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                        >
                                            <option value="">Select Country</option>
                                            <option value="Thailand">🇹🇭 Thailand</option>
                                            <option value="United States">🇺🇸 United States</option>
                                            <option value="United Kingdom">🇬🇧 United Kingdom</option>
                                            <option value="Singapore">🇸🇬 Singapore</option>
                                            <option value="Japan">🇯🇵 Japan</option>
                                            <option value="Australia">🇦🇺 Australia</option>
                                            <option value="Other">🌏 Other</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* Bank Transfer Form */}
                            {newMethodType === 'BANK' && (
                                <div className="space-y-3">
                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs text-blue-700">
                                        💡 International wire transfer - Please fill all required fields accurately
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Country *</label>
                                        <select 
                                            value={newMethodData.country}
                                            onChange={e => setNewMethodData({...newMethodData, country: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        >
                                            <option value="">Select Country</option>
                                            <option value="Thailand">🇹🇭 Thailand</option>
                                            <option value="United States">🇺🇸 United States</option>
                                            <option value="United Kingdom">🇬🇧 United Kingdom</option>
                                            <option value="Singapore">🇸🇬 Singapore</option>
                                            <option value="Japan">🇯🇵 Japan</option>
                                            <option value="Australia">🇦🇺 Australia</option>
                                            <option value="Germany">🇩🇪 Germany</option>
                                            <option value="France">🇫🇷 France</option>
                                            <option value="Other">🌏 Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Bank Name *</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. Chase Bank, Kasikorn Bank"
                                            value={newMethodData.bankName}
                                            onChange={e => setNewMethodData({...newMethodData, bankName: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Account Holder Name *</label>
                                        <input 
                                            type="text" 
                                            placeholder="Full name as shown on bank account"
                                            value={newMethodData.accountHolderName}
                                            onChange={e => setNewMethodData({...newMethodData, accountHolderName: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Account Number / IBAN *</label>
                                        <input 
                                            type="text" 
                                            placeholder="1234567890 or GB12ABCD12345678901234"
                                            value={newMethodData.accountNumber}
                                            onChange={e => setNewMethodData({...newMethodData, accountNumber: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">SWIFT / BIC Code *</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. KASITHBK, CHASUS33"
                                            value={newMethodData.swiftCode}
                                            onChange={e => setNewMethodData({...newMethodData, swiftCode: e.target.value.toUpperCase()})}
                                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono uppercase" 
                                        />
                                        <p className="text-xs text-gray-400 mt-1">8 or 11 characters (e.g. KASITHBK or KASITHBKXXX)</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">IBAN (if applicable)</label>
                                        <input 
                                            type="text" 
                                            placeholder="GB12ABCD12345678901234 (for EU/UK banks)"
                                            value={newMethodData.iban}
                                            onChange={e => setNewMethodData({...newMethodData, iban: e.target.value.toUpperCase()})}
                                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono uppercase" 
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                                <button 
                                    onClick={() => {
                                        setShowAddMethodForm(false);
                                        setNewMethodData({
                                            bankName: '',
                                            accountNumber: '',
                                            accountHolderName: '',
                                            swiftCode: '',
                                            iban: '',
                                            country: '',
                                            email: ''
                                        });
                                    }} 
                                    className="flex-1 py-3 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => {
                                        // Validate and save
                                        setShowAddMethodForm(false);
                                        alert('Payout method added successfully! Pending verification.');
                                    }} 
                                    className="flex-1 py-3 rounded-xl font-bold bg-gray-900 text-white hover:bg-black transition"
                                >
                                    Save & Verify
                                </button>
                            </div>
                        </div>
                    </div>
                )}
             </div>
         </div>
       )}

       {/* 4. Notification Modal */}
       {activeModal === 'NOTIF' && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={() => setActiveModal(null)}>
             <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg">Notifications</h3>
                    <button onClick={() => setActiveModal(null)}><IconX className="w-6 h-6 text-gray-400" /></button>
                </div>
                <div className="space-y-4">
                    {['Win Alerts', 'Promotions', 'Ticket Status'].map((item, i) => (
                        <div key={i} className="flex justify-between items-center">
                            <span className="text-sm text-gray-700">{item}</span>
                            <div className="w-11 h-6 bg-green-500 rounded-full relative cursor-pointer">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
         </div>
       )}

       {/* 5. Contact Modal */}
       {activeModal === 'CONTACT' && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={() => setActiveModal(null)}>
             <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl text-center" onClick={e => e.stopPropagation()}>
                <div className="flex justify-end mb-2">
                     <button onClick={() => setActiveModal(null)}><IconX className="w-6 h-6 text-gray-400" /></button>
                </div>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconPhone className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="font-bold text-xl text-gray-800 mb-2">Contact Support</h3>
                <p className="text-sm text-gray-500 mb-6">Have an issue? We are here 24/7.</p>
                
                <div className="space-y-3">
                    <a href="#" className="block w-full bg-[#06C755] text-white py-3 rounded-xl font-bold hover:opacity-90 transition">
                        Line: @truvamate
                    </a>
                    <a href="tel:021234567" className="block w-full bg-gray-100 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-200 transition">
                        Call: 02-123-4567
                    </a>
                </div>
             </div>
         </div>
       )}

       {/* 6. Logout Modal */}
       {activeModal === 'LOGOUT' && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={() => setActiveModal(null)}>
             <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl text-center" onClick={e => e.stopPropagation()}>
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconLogOut className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="font-bold text-xl text-gray-800 mb-2">Confirm Logout?</h3>
                <p className="text-sm text-gray-500 mb-6">Are you sure you want to log out?</p>
                <div className="flex gap-3">
                    <button onClick={() => setActiveModal(null)} className="flex-1 py-3 rounded-xl font-bold bg-gray-100 text-gray-700">Cancel</button>
                    <button onClick={() => { setActiveModal(null); onLogout && onLogout(); }} className="flex-1 py-3 rounded-xl font-bold bg-red-600 text-white">Logout</button>
                </div>
             </div>
         </div>
       )}
    </div>
  );
};