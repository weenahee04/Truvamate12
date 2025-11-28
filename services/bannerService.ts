export interface Banner {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  detail: string;
  color: string;
  bgImage: string;
  width: number;
  height: number;
  isActive: boolean;
  order: number;
}

const STORAGE_KEY = 'truvamate_banners';

const DEFAULT_BANNERS: Banner[] = [
  {
    id: 1,
    title: 'วิธีการซื้อล็อตเตอรี่',
    subtitle: 'เริ่มต้นง่ายๆ ในไม่กี่ขั้นตอน',
    description: 'เลือกเกม เลือกเลข ชำระเงิน แล้วรอรับรางวัล',
    detail: 'คู่มือแนะนำขั้นตอนการซื้อล็อตเตอรี่อย่างละเอียด\n1. เลือกเกมที่ต้องการ\n2. เลือกหมายเลขโชคดี\n3. ชำระเงินผ่านระบบที่ปลอดภัย\n4. รอการออกผลรางวัล',
    color: 'bg-black',
    bgImage: 'https://www.powerball.com/themes/custom/baseline/images/home_hero.png',
    width: 1200,
    height: 400,
    isActive: true,
    order: 1
  },
  {
    id: 2,
    title: 'แจ็คพอตสูงสุด $1.5B',
    subtitle: 'รางวัลใหญ่รออยู่!',
    description: 'โอกาสทองที่จะเปลี่ยนชีวิตคุณ',
    detail: 'แจ็คพอตสะสมสูงสุดในประวัติศาสตร์\nซื้อตั๋วเดี๋ยวนี้เพื่อลุ้นรับรางวัลมหาศาล\nโอกาสพิเศษที่ไม่ควรพลาด!',
    color: 'bg-gradient-to-r from-red-600 to-red-500',
    bgImage: 'https://www.powerball.com/themes/custom/baseline/images/powerball_ball_texture.jpg',
    width: 1200,
    height: 400,
    isActive: true,
    order: 2
  },
  {
    id: 3,
    title: 'โปรโมชั่นพิเศษ',
    subtitle: 'รับส่วนลด 20% สำหรับสมาชิกใหม่',
    description: 'สมัครวันนี้รับสิทธิพิเศษทันที',
    detail: 'โปรโมชั่นสำหรับสมาชิกใหม่\n- ส่วนลด 20% สำหรับการซื้อครั้งแรก\n- โบนัสเครดิตฟรี 100 บาท\n- ไม่มีค่าธรรมเนียมการโอน\nเงื่อนไข: สำหรับสมาชิกใหม่เท่านั้น',
    color: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    bgImage: 'https://www.megamillions.com/images/interface/mm-logo-lg.png',
    width: 1200,
    height: 400,
    isActive: true,
    order: 3
  }
];

class BannerService {
  // Get all banners
  getBanners(): Banner[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      // Initialize with default banners if not exists
      this.saveBanners(DEFAULT_BANNERS);
      return DEFAULT_BANNERS;
    } catch (error) {
      console.error('Error loading banners:', error);
      return DEFAULT_BANNERS;
    }
  }

  // Get active banners only (sorted by order)
  getActiveBanners(): Banner[] {
    return this.getBanners()
      .filter(banner => banner.isActive)
      .sort((a, b) => a.order - b.order);
  }

  // Save all banners
  saveBanners(banners: Banner[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(banners));
      // Dispatch custom event to notify listeners
      window.dispatchEvent(new CustomEvent('bannersUpdated'));
    } catch (error) {
      console.error('Error saving banners:', error);
    }
  }

  // Add a new banner
  addBanner(banner: Omit<Banner, 'id'>): Banner {
    const banners = this.getBanners();
    const newBanner = {
      ...banner,
      id: Math.max(...banners.map(b => b.id), 0) + 1
    };
    this.saveBanners([...banners, newBanner]);
    return newBanner;
  }

  // Update a banner
  updateBanner(id: number, updates: Partial<Banner>): void {
    const banners = this.getBanners();
    const updatedBanners = banners.map(banner => 
      banner.id === id ? { ...banner, ...updates } : banner
    );
    this.saveBanners(updatedBanners);
  }

  // Delete a banner
  deleteBanner(id: number): void {
    const banners = this.getBanners();
    this.saveBanners(banners.filter(banner => banner.id !== id));
  }

  // Toggle banner active status
  toggleActive(id: number): void {
    const banners = this.getBanners();
    const banner = banners.find(b => b.id === id);
    if (banner) {
      this.updateBanner(id, { isActive: !banner.isActive });
    }
  }

  // Reset to default banners
  resetToDefault(): void {
    this.saveBanners(DEFAULT_BANNERS);
  }
}

export const bannerService = new BannerService();
export default bannerService;
