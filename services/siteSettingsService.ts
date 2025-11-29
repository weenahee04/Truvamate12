export interface SiteSettings {
  siteName: string;
  siteTagline: string;
  logoUrl: string;
  faviconUrl: string;
  headerBgColor: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface SiteIcon {
  id: string;
  name: string;
  category: 'payment' | 'lottery' | 'ui' | 'social' | 'other';
  imageUrl: string;
  description: string;
  isActive: boolean;
}

const SETTINGS_KEY = 'truvamate_site_settings';
const ICONS_KEY = 'truvamate_site_icons';

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'TruvaMate',
  siteTagline: 'บริการซื้อลอตเตอรี่ออนไลน์ระดับโลก',
  logoUrl: '',
  faviconUrl: '',
  headerBgColor: 'bg-white',
  primaryColor: '#dc2626', // red-600
  secondaryColor: '#1f2937' // gray-800
};

const DEFAULT_ICONS: SiteIcon[] = [
  // Lottery Icons
  {
    id: 'powerball',
    name: 'Powerball Logo',
    category: 'lottery',
    imageUrl: '/image/us-powerball.png',
    description: 'โลโก้ US Powerball',
    isActive: true
  },
  {
    id: 'megamillions',
    name: 'Mega Millions Logo',
    category: 'lottery',
    imageUrl: '/image/us-megamillions.png',
    description: 'โลโก้ Mega Millions',
    isActive: true
  },
  {
    id: 'eurojackpot',
    name: 'EuroJackpot Logo',
    category: 'lottery',
    imageUrl: '',
    description: 'โลโก้ EuroJackpot',
    isActive: true
  },
  // Payment Icons
  {
    id: 'visa',
    name: 'Visa',
    category: 'payment',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg',
    description: 'บัตร Visa',
    isActive: true
  },
  {
    id: 'mastercard',
    name: 'Mastercard',
    category: 'payment',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg',
    description: 'บัตร Mastercard',
    isActive: true
  },
  {
    id: 'promptpay',
    name: 'PromptPay',
    category: 'payment',
    imageUrl: 'https://www.bot.or.th/th/financial-innovation/digital-payments/promptpay/_jcr_content/root/container/container_1316168693/image.coreimg.png/1683770990379/logo-promptpay.png',
    description: 'PromptPay / พร้อมเพย์',
    isActive: true
  },
  {
    id: 'truemoney',
    name: 'TrueMoney',
    category: 'payment',
    imageUrl: 'https://www.truemoney.com/wp-content/uploads/2021/09/truemoney-wallet-logo.png',
    description: 'TrueMoney Wallet',
    isActive: true
  },
  {
    id: 'wise',
    name: 'Wise',
    category: 'payment',
    imageUrl: 'https://wise.com/public-resources/assets/logos/wise/brand_logo.svg',
    description: 'Wise Transfer',
    isActive: true
  },
  {
    id: 'alipay',
    name: 'Alipay',
    category: 'payment',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Alipay_logo.svg',
    description: 'Alipay 支付宝',
    isActive: true
  },
  {
    id: 'omise',
    name: 'Omise',
    category: 'payment',
    imageUrl: 'https://cdn.omise.co/assets/omise-logo.png',
    description: 'Omise Payment Gateway',
    isActive: true
  },
  // Social Icons
  {
    id: 'facebook',
    name: 'Facebook',
    category: 'social',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg',
    description: 'Facebook',
    isActive: true
  },
  {
    id: 'google',
    name: 'Google',
    category: 'social',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg',
    description: 'Google',
    isActive: true
  },
  {
    id: 'line',
    name: 'LINE',
    category: 'social',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg',
    description: 'LINE',
    isActive: true
  },
  // UI Icons  
  {
    id: 'cart',
    name: 'ตะกร้าสินค้า',
    category: 'ui',
    imageUrl: '',
    description: 'ไอคอนตะกร้า',
    isActive: true
  },
  {
    id: 'ticket',
    name: 'ตั๋ว',
    category: 'ui',
    imageUrl: '',
    description: 'ไอคอนตั๋ว',
    isActive: true
  }
];

class SiteSettingsService {
  // Site Settings
  getSettings(): SiteSettings {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      this.saveSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error loading site settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  saveSettings(settings: SiteSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      window.dispatchEvent(new CustomEvent('siteSettingsUpdated'));
    } catch (error) {
      console.error('Error saving site settings:', error);
    }
  }

  updateSettings(updates: Partial<SiteSettings>): void {
    const current = this.getSettings();
    this.saveSettings({ ...current, ...updates });
  }

  // Site Icons
  getIcons(): SiteIcon[] {
    try {
      const stored = localStorage.getItem(ICONS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      this.saveIcons(DEFAULT_ICONS);
      return DEFAULT_ICONS;
    } catch (error) {
      console.error('Error loading site icons:', error);
      return DEFAULT_ICONS;
    }
  }

  getIconsByCategory(category: SiteIcon['category']): SiteIcon[] {
    return this.getIcons().filter(icon => icon.category === category && icon.isActive);
  }

  getIconById(id: string): SiteIcon | undefined {
    return this.getIcons().find(icon => icon.id === id);
  }

  saveIcons(icons: SiteIcon[]): void {
    try {
      localStorage.setItem(ICONS_KEY, JSON.stringify(icons));
      window.dispatchEvent(new CustomEvent('siteIconsUpdated'));
    } catch (error) {
      console.error('Error saving site icons:', error);
    }
  }

  updateIcon(id: string, updates: Partial<SiteIcon>): void {
    const icons = this.getIcons();
    const updatedIcons = icons.map(icon => 
      icon.id === id ? { ...icon, ...updates } : icon
    );
    this.saveIcons(updatedIcons);
  }

  addIcon(icon: SiteIcon): void {
    const icons = this.getIcons();
    this.saveIcons([...icons, icon]);
  }

  deleteIcon(id: string): void {
    const icons = this.getIcons();
    this.saveIcons(icons.filter(icon => icon.id !== id));
  }

  resetToDefault(): void {
    this.saveSettings(DEFAULT_SETTINGS);
    this.saveIcons(DEFAULT_ICONS);
  }
}

export const siteSettingsService = new SiteSettingsService();
export default siteSettingsService;
