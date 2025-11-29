import React, { useState, useEffect } from 'react';
import { IconX, IconPlus, IconEdit, IconTrash, IconUpload, IconImage, IconChevronRight } from './Icons';
import bannerService, { Banner } from '../services/bannerService';
import gameImageService, { GameImage } from '../services/gameImageService';
import siteSettingsService, { SiteSettings, SiteIcon } from '../services/siteSettingsService';

type TabType = 'banners' | 'games' | 'settings' | 'icons';

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('banners');
  const [banners, setBanners] = useState<Banner[]>([]);
  const [gameImages, setGameImages] = useState<GameImage[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [siteIcons, setSiteIcons] = useState<SiteIcon[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [editingGameImage, setEditingGameImage] = useState<GameImage | null>(null);
  const [editingIcon, setEditingIcon] = useState<SiteIcon | null>(null);
  const [iconFilter, setIconFilter] = useState<SiteIcon['category'] | 'all'>('all');

  // Banner form state
  const [bannerForm, setBannerForm] = useState<Partial<Banner>>({
    title: '',
    subtitle: '',
    description: '',
    detail: '',
    color: 'bg-gradient-to-r from-purple-600 to-pink-600',
    bgImage: '',
    width: 1200,
    height: 400,
    isActive: true,
    order: 1
  });

  // Game image form state
  const [gameImageForm, setGameImageForm] = useState<Partial<GameImage>>({
    gameId: '',
    gameName: '',
    logoImage: '',
    backgroundImage: '',
    iconImage: '',
    isActive: true,
    order: 1
  });

  // Site Settings form state
  const [settingsForm, setSettingsForm] = useState<Partial<SiteSettings>>({
    siteName: '',
    siteTagline: '',
    logoUrl: '',
    faviconUrl: '',
    primaryColor: '#dc2626',
    secondaryColor: '#1f2937'
  });

  // Icon form state
  const [iconForm, setIconForm] = useState<Partial<SiteIcon>>({
    id: '',
    name: '',
    category: 'other',
    imageUrl: '',
    description: '',
    isActive: true
  });

  const colorPresets = [
    { name: 'Black', value: 'bg-black' },
    { name: 'Red', value: 'bg-gradient-to-r from-red-600 to-red-500' },
    { name: 'Blue', value: 'bg-gradient-to-r from-blue-600 to-indigo-600' },
    { name: 'Green', value: 'bg-gradient-to-r from-green-600 to-emerald-600' },
    { name: 'Purple', value: 'bg-gradient-to-r from-purple-600 to-pink-600' },
    { name: 'Orange', value: 'bg-gradient-to-r from-orange-600 to-red-600' },
    { name: 'Teal', value: 'bg-gradient-to-r from-teal-600 to-cyan-600' },
    { name: 'Yellow', value: 'bg-gradient-to-r from-yellow-500 to-amber-500' }
  ];

  const iconCategories: { value: SiteIcon['category'] | 'all'; label: string }[] = [
    { value: 'all', label: '🔷 ทั้งหมด' },
    { value: 'lottery', label: '🎰 หวย' },
    { value: 'payment', label: '💳 การชำระเงิน' },
    { value: 'social', label: '👥 โซเชียล' },
    { value: 'ui', label: '🎨 UI' },
    { value: 'other', label: '📦 อื่นๆ' }
  ];

  useEffect(() => {
    setBanners(bannerService.getBanners());
    setGameImages(gameImageService.getGameImages());
    setSiteSettings(siteSettingsService.getSettings());
    setSiteIcons(siteSettingsService.getIcons());
  }, []);

  // Banner handlers
  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setBannerForm(banner);
    setShowModal(true);
  };

  const handleAddBanner = () => {
    setEditingBanner(null);
    setBannerForm({
      title: '',
      subtitle: '',
      description: '',
      detail: '',
      color: 'bg-gradient-to-r from-purple-600 to-pink-600',
      bgImage: '',
      width: 1200,
      height: 400,
      isActive: true,
      order: banners.length + 1
    });
    setShowModal(true);
  };

  const handleSaveBanner = () => {
    if (editingBanner) {
      bannerService.updateBanner(editingBanner.id, bannerForm);
    } else {
      const newBanner: Banner = {
        ...bannerForm,
        id: Math.max(...banners.map(b => b.id), 0) + 1
      } as Banner;
      bannerService.addBanner(newBanner);
    }
    setBanners(bannerService.getBanners());
    setShowModal(false);
  };

  const handleDeleteBanner = (id: number) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบแบนเนอร์นี้?')) {
      bannerService.deleteBanner(id);
      setBanners(bannerService.getBanners());
    }
  };

  const handleToggleBannerActive = (id: number) => {
    bannerService.toggleActive(id);
    setBanners(bannerService.getBanners());
  };

  // Game image handlers
  const handleEditGameImage = (image: GameImage) => {
    setEditingGameImage(image);
    setGameImageForm(image);
    setShowModal(true);
  };

  const handleAddGameImage = () => {
    setEditingGameImage(null);
    setGameImageForm({
      id: `game-${Date.now()}`,
      gameId: '',
      gameName: '',
      logoImage: '',
      backgroundImage: '',
      iconImage: '',
      isActive: true,
      order: gameImages.length + 1
    });
    setShowModal(true);
  };

  const handleSaveGameImage = () => {
    if (editingGameImage) {
      gameImageService.updateGameImage(editingGameImage.id, gameImageForm);
    } else {
      const newImage: GameImage = {
        ...gameImageForm,
        id: gameImageForm.gameId || `game-${Date.now()}`
      } as GameImage;
      gameImageService.addGameImage(newImage);
    }
    setGameImages(gameImageService.getGameImages());
    setShowModal(false);
  };

  const handleDeleteGameImage = (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบรูปเกมนี้?')) {
      gameImageService.deleteGameImage(id);
      setGameImages(gameImageService.getGameImages());
    }
  };

  // Site Settings handlers
  const handleSaveSettings = () => {
    siteSettingsService.saveSettings(settingsForm as SiteSettings);
    setSiteSettings(siteSettingsService.getSettings());
  };

  // Icon handlers
  const handleEditIcon = (icon: SiteIcon) => {
    setEditingIcon(icon);
    setIconForm(icon);
    setShowModal(true);
  };

  const handleAddIcon = () => {
    setEditingIcon(null);
    setIconForm({
      id: `icon-${Date.now()}`,
      name: '',
      category: 'other',
      imageUrl: '',
      description: '',
      isActive: true
    });
    setShowModal(true);
  };

  const handleSaveIcon = () => {
    if (editingIcon) {
      siteSettingsService.updateIcon(editingIcon.id, iconForm);
    } else {
      siteSettingsService.addIcon(iconForm as SiteIcon);
    }
    setSiteIcons(siteSettingsService.getIcons());
    setShowModal(false);
  };

  const handleDeleteIcon = (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบไอคอนนี้?')) {
      siteSettingsService.deleteIcon(id);
      setSiteIcons(siteSettingsService.getIcons());
    }
  };

  const getFilteredIcons = () => {
    if (iconFilter === 'all') return siteIcons;
    return siteIcons.filter(icon => icon.category === iconFilter);
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">ระบบจัดการหลังบ้าน</h1>
          <p className="text-gray-600 mt-1">แก้ไขแบนเนอร์ รูปภาพ และไอคอน</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('banners')}
            className={`px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold transition-all whitespace-nowrap text-sm md:text-base ${
              activeTab === 'banners'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            🖼️ แบนเนอร์
          </button>
          <button
            onClick={() => setActiveTab('games')}
            className={`px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold transition-all whitespace-nowrap text-sm md:text-base ${
              activeTab === 'games'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            🎰 รูปเกม
          </button>
          <button
            onClick={() => setActiveTab('icons')}
            className={`px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold transition-all whitespace-nowrap text-sm md:text-base ${
              activeTab === 'icons'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            🎨 ไอคอน
          </button>
          <button
            onClick={() => { 
              setActiveTab('settings');
              if (siteSettings) setSettingsForm(siteSettings);
            }}
            className={`px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold transition-all whitespace-nowrap text-sm md:text-base ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            ⚙️ ตั้งค่าเว็บ
          </button>
        </div>

        {/* Content */}
        {activeTab === 'banners' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">รายการแบนเนอร์</h2>
              <button
                onClick={handleAddBanner}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg text-sm"
              >
                <IconPlus className="w-4 h-4" />
                เพิ่มแบนเนอร์
              </button>
            </div>

            <div className="space-y-4">
              {banners.sort((a, b) => a.order - b.order).map((banner) => (
                <div
                  key={banner.id}
                  className={`bg-white rounded-xl shadow-sm border-2 ${banner.isActive ? 'border-green-200' : 'border-gray-200'} overflow-hidden`}
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Preview */}
                    <div className="md:w-1/3 relative">
                      <div className={`h-36 md:h-48 ${banner.color} relative overflow-hidden`}>
                        {banner.bgImage && (
                          <div className="absolute inset-0 opacity-30">
                            <img
                              src={banner.bgImage}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => e.currentTarget.style.display = 'none'}
                            />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
                        <div className="p-4 relative z-10 text-white">
                          <h3 className="text-lg md:text-xl font-bold mb-1 line-clamp-1">{banner.title}</h3>
                          <p className="text-sm opacity-90 line-clamp-1">{banner.subtitle}</p>
                        </div>
                      </div>
                      {!banner.isActive && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="bg-red-500 text-white px-3 py-1 rounded-lg font-bold text-sm">ปิดใช้งาน</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 p-4 md:p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">{banner.title}</h3>
                          <p className="text-gray-600 text-sm truncate">{banner.subtitle}</p>
                        </div>
                        <div className="flex gap-2 ml-2">
                          <button
                            onClick={() => handleEditBanner(banner)}
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                            title="แก้ไข"
                          >
                            <IconEdit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBanner(banner.id)}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                            title="ลบ"
                          >
                            <IconTrash className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 md:gap-4 text-sm">
                        <span className="bg-gray-100 px-2 py-1 rounded text-gray-600">
                          #{banner.order}
                        </span>
                        <button
                          onClick={() => handleToggleBannerActive(banner.id)}
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            banner.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {banner.isActive ? '✓ เปิดใช้งาน' : '○ ปิด'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'games' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">รูปภาพเกมหวย</h2>
              <button
                onClick={handleAddGameImage}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg text-sm"
              >
                <IconPlus className="w-4 h-4" />
                เพิ่มเกม
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gameImages.map((image) => (
                <div
                  key={image.id}
                  className={`bg-white rounded-xl shadow-sm border-2 ${image.isActive ? 'border-green-200' : 'border-gray-200'} overflow-hidden`}
                >
                  {/* Preview */}
                  <div className="h-32 bg-gradient-to-br from-red-600 to-red-500 relative overflow-hidden">
                    {image.backgroundImage && (
                      <div className="absolute inset-0 opacity-30">
                        <img
                          src={image.backgroundImage}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => e.currentTarget.style.display = 'none'}
                        />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent"></div>
                    <div className="absolute inset-0 flex items-center p-4">
                      <div className="flex items-center gap-3">
                        {image.logoImage && (
                          <img 
                            src={image.logoImage} 
                            alt={image.gameName}
                            className="w-10 h-10 object-contain"
                            onError={(e) => e.currentTarget.style.display = 'none'}
                          />
                        )}
                        <span className="text-white font-bold text-lg drop-shadow-md">{image.gameName}</span>
                      </div>
                    </div>
                    {!image.isActive && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-3 py-1 rounded-lg font-bold text-sm">ปิดใช้งาน</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-bold text-gray-900">{image.gameName}</p>
                        <p className="text-xs text-gray-500">ID: {image.gameId}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        image.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        #{image.order}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditGameImage(image)}
                        className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg font-bold text-sm hover:bg-blue-100 transition flex items-center justify-center gap-1"
                      >
                        <IconEdit className="w-4 h-4" />
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDeleteGameImage(image.id)}
                        className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition"
                      >
                        <IconTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowModal(false)}>
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
              {/* Banner Modal */}
              {activeTab === 'banners' && (
                <>
                  <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                      {editingBanner ? 'แก้ไขแบนเนอร์' : 'เพิ่มแบนเนอร์ใหม่'}
                    </h2>
                    <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                      <IconX className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="p-4 md:p-6 space-y-6">
                    {/* Preview */}
                    <div className="rounded-xl overflow-hidden shadow-md">
                      <div className={`h-36 md:h-48 ${bannerForm.color} relative overflow-hidden`}>
                        {bannerForm.bgImage && (
                          <div className="absolute inset-0 opacity-30">
                            <img
                              src={bannerForm.bgImage}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => e.currentTarget.style.display = 'none'}
                            />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
                        <div className="p-4 md:p-6 relative z-10 text-white">
                          <h3 className="text-xl md:text-2xl font-bold mb-1">{bannerForm.title || 'ชื่อแบนเนอร์'}</h3>
                          <p className="text-sm opacity-90">{bannerForm.subtitle || 'คำบรรยายย่อย'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อแบนเนอร์</label>
                        <input
                          type="text"
                          value={bannerForm.title}
                          onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="เช่น แจ็คพอตสูงสุด"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">คำบรรยายย่อย</label>
                        <input
                          type="text"
                          value={bannerForm.subtitle}
                          onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="เช่น รางวัลใหญ่รออยู่"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">คำอธิบาย</label>
                        <input
                          type="text"
                          value={bannerForm.description}
                          onChange={(e) => setBannerForm({ ...bannerForm, description: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="คำอธิบายเพิ่มเติม"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">URL รูปภาพพื้นหลัง</label>
                        <input
                          type="text"
                          value={bannerForm.bgImage}
                          onChange={(e) => setBannerForm({ ...bannerForm, bgImage: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">สีพื้นหลัง</label>
                        <div className="grid grid-cols-4 gap-2">
                          {colorPresets.map((color) => (
                            <button
                              key={color.value}
                              onClick={() => setBannerForm({ ...bannerForm, color: color.value })}
                              className={`${color.value} h-10 md:h-12 rounded-lg border-4 transition ${
                                bannerForm.color === color.value ? 'border-blue-500 ring-2 ring-blue-200' : 'border-white hover:border-gray-300'
                              }`}
                              title={color.name}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">ลำดับ</label>
                        <input
                          type="number"
                          value={bannerForm.order}
                          onChange={(e) => setBannerForm({ ...bannerForm, order: parseInt(e.target.value) || 1 })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          min="1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">สถานะ</label>
                        <label className="flex items-center gap-3 cursor-pointer h-10">
                          <input
                            type="checkbox"
                            checked={bannerForm.isActive}
                            onChange={(e) => setBannerForm({ ...bannerForm, isActive: e.target.checked })}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">เปิดใช้งาน</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-semibold"
                    >
                      ยกเลิก
                    </button>
                    <button
                      onClick={handleSaveBanner}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                    >
                      บันทึก
                    </button>
                  </div>
                </>
              )}

              {/* Game Image Modal */}
              {activeTab === 'games' && (
                <>
                  <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                      {editingGameImage ? 'แก้ไขรูปเกม' : 'เพิ่มเกมใหม่'}
                    </h2>
                    <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                      <IconX className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="p-4 md:p-6 space-y-6">
                    {/* Preview */}
                    <div className="rounded-xl overflow-hidden shadow-md">
                      <div className="h-32 bg-gradient-to-br from-red-600 to-red-500 relative overflow-hidden">
                        {gameImageForm.backgroundImage && (
                          <div className="absolute inset-0 opacity-30">
                            <img
                              src={gameImageForm.backgroundImage}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => e.currentTarget.style.display = 'none'}
                            />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent"></div>
                        <div className="absolute inset-0 flex items-center p-4">
                          <div className="flex items-center gap-3">
                            {gameImageForm.logoImage && (
                              <img 
                                src={gameImageForm.logoImage} 
                                alt=""
                                className="w-10 h-10 object-contain"
                                onError={(e) => e.currentTarget.style.display = 'none'}
                              />
                            )}
                            <span className="text-white font-bold text-xl drop-shadow-md">
                              {gameImageForm.gameName || 'ชื่อเกม'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Game ID</label>
                        <input
                          type="text"
                          value={gameImageForm.gameId}
                          onChange={(e) => setGameImageForm({ ...gameImageForm, gameId: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="เช่น powerball"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อเกม</label>
                        <input
                          type="text"
                          value={gameImageForm.gameName}
                          onChange={(e) => setGameImageForm({ ...gameImageForm, gameName: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="เช่น POWERBALL®"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">URL โลโก้</label>
                        <input
                          type="text"
                          value={gameImageForm.logoImage}
                          onChange={(e) => setGameImageForm({ ...gameImageForm, logoImage: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="/image/us-powerball.png"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">URL รูปพื้นหลัง</label>
                        <input
                          type="text"
                          value={gameImageForm.backgroundImage}
                          onChange={(e) => setGameImageForm({ ...gameImageForm, backgroundImage: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="https://example.com/background.jpg"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">URL ไอคอน</label>
                        <input
                          type="text"
                          value={gameImageForm.iconImage}
                          onChange={(e) => setGameImageForm({ ...gameImageForm, iconImage: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="/image/us-powerball.png"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">ลำดับ</label>
                        <input
                          type="number"
                          value={gameImageForm.order}
                          onChange={(e) => setGameImageForm({ ...gameImageForm, order: parseInt(e.target.value) || 1 })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          min="1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">สถานะ</label>
                        <label className="flex items-center gap-3 cursor-pointer h-10">
                          <input
                            type="checkbox"
                            checked={gameImageForm.isActive}
                            onChange={(e) => setGameImageForm({ ...gameImageForm, isActive: e.target.checked })}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">เปิดใช้งาน</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-semibold"
                    >
                      ยกเลิก
                    </button>
                    <button
                      onClick={handleSaveGameImage}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                    >
                      บันทึก
                    </button>
                  </div>
                </>
              )}

              {/* Icon Modal */}
              {activeTab === 'icons' && (
                <>
                  <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                      {editingIcon ? 'แก้ไขไอคอน' : 'เพิ่มไอคอนใหม่'}
                    </h2>
                    <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                      <IconX className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="p-4 md:p-6 space-y-6">
                    {/* Preview */}
                    <div className="flex items-center justify-center p-8 bg-gray-100 rounded-xl">
                      {iconForm.imageUrl ? (
                        <img 
                          src={iconForm.imageUrl} 
                          alt={iconForm.name}
                          className="w-24 h-24 object-contain"
                          onError={(e) => e.currentTarget.style.display = 'none'}
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                          <IconImage className="w-12 h-12" />
                        </div>
                      )}
                    </div>

                    {/* Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">ID</label>
                        <input
                          type="text"
                          value={iconForm.id}
                          onChange={(e) => setIconForm({ ...iconForm, id: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="เช่น visa, powerball"
                          disabled={!!editingIcon}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อ</label>
                        <input
                          type="text"
                          value={iconForm.name}
                          onChange={(e) => setIconForm({ ...iconForm, name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="เช่น Visa Card"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">หมวดหมู่</label>
                        <select
                          value={iconForm.category}
                          onChange={(e) => setIconForm({ ...iconForm, category: e.target.value as SiteIcon['category'] })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="lottery">🎰 หวย</option>
                          <option value="payment">💳 การชำระเงิน</option>
                          <option value="social">👥 โซเชียล</option>
                          <option value="ui">🎨 UI</option>
                          <option value="other">📦 อื่นๆ</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">สถานะ</label>
                        <label className="flex items-center gap-3 cursor-pointer h-10">
                          <input
                            type="checkbox"
                            checked={iconForm.isActive}
                            onChange={(e) => setIconForm({ ...iconForm, isActive: e.target.checked })}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">เปิดใช้งาน</span>
                        </label>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">URL รูปภาพ</label>
                        <input
                          type="text"
                          value={iconForm.imageUrl}
                          onChange={(e) => setIconForm({ ...iconForm, imageUrl: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="https://example.com/icon.svg"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">คำอธิบาย</label>
                        <input
                          type="text"
                          value={iconForm.description}
                          onChange={(e) => setIconForm({ ...iconForm, description: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="คำอธิบายไอคอน"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-semibold"
                    >
                      ยกเลิก
                    </button>
                    <button
                      onClick={handleSaveIcon}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                    >
                      บันทึก
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Icons Tab Content */}
        {activeTab === 'icons' && (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">รูปไอคอนทั้งหมด</h2>
                <p className="text-sm text-gray-500">จัดการไอคอนที่ใช้ในเว็บ</p>
              </div>
              <button
                onClick={handleAddIcon}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg text-sm"
              >
                <IconPlus className="w-4 h-4" />
                เพิ่มไอคอน
              </button>
            </div>

            {/* Filter */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {iconCategories.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setIconFilter(cat.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                    iconFilter === cat.value
                      ? 'bg-gray-800 text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {getFilteredIcons().map((icon) => (
                <div
                  key={icon.id}
                  className={`bg-white rounded-xl shadow-sm border-2 ${icon.isActive ? 'border-green-200' : 'border-gray-200'} overflow-hidden group`}
                >
                  <div className="h-24 bg-gray-50 flex items-center justify-center p-4 relative">
                    {icon.imageUrl ? (
                      <img 
                        src={icon.imageUrl} 
                        alt={icon.name}
                        className="max-h-16 max-w-full object-contain"
                        onError={(e) => e.currentTarget.style.display = 'none'}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                        <IconImage className="w-8 h-8" />
                      </div>
                    )}
                    {!icon.isActive && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">ปิด</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-gray-900 text-sm truncate">{icon.name}</p>
                    <p className="text-xs text-gray-500 truncate">{icon.category}</p>
                    <div className="flex gap-1 mt-2">
                      <button
                        onClick={() => handleEditIcon(icon)}
                        className="flex-1 bg-blue-50 text-blue-600 py-1.5 rounded text-xs font-bold hover:bg-blue-100 transition"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDeleteIcon(icon.id)}
                        className="bg-red-50 text-red-600 px-2 py-1.5 rounded hover:bg-red-100 transition"
                      >
                        <IconTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Settings Tab Content */}
        {activeTab === 'settings' && siteSettings && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">ตั้งค่าเว็บไซต์</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Site Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อเว็บไซต์</label>
                <input
                  type="text"
                  value={settingsForm.siteName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, siteName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="TruvaMate"
                />
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">สโลแกน</label>
                <input
                  type="text"
                  value={settingsForm.siteTagline}
                  onChange={(e) => setSettingsForm({ ...settingsForm, siteTagline: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="บริการซื้อลอตเตอรี่ออนไลน์ระดับโลก"
                />
              </div>

              {/* Logo URL */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">URL โลโก้</label>
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={settingsForm.logoUrl}
                    onChange={(e) => setSettingsForm({ ...settingsForm, logoUrl: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/logo.png"
                  />
                  {settingsForm.logoUrl && (
                    <img 
                      src={settingsForm.logoUrl} 
                      alt="Logo Preview"
                      className="h-10 object-contain"
                      onError={(e) => e.currentTarget.style.display = 'none'}
                    />
                  )}
                </div>
              </div>

              {/* Favicon URL */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">URL Favicon</label>
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={settingsForm.faviconUrl}
                    onChange={(e) => setSettingsForm({ ...settingsForm, faviconUrl: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/favicon.ico"
                  />
                  {settingsForm.faviconUrl && (
                    <img 
                      src={settingsForm.faviconUrl} 
                      alt="Favicon Preview"
                      className="h-10 w-10 object-contain"
                      onError={(e) => e.currentTarget.style.display = 'none'}
                    />
                  )}
                </div>
              </div>

              {/* Primary Color */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">สีหลัก (Primary)</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settingsForm.primaryColor}
                    onChange={(e) => setSettingsForm({ ...settingsForm, primaryColor: e.target.value })}
                    className="w-12 h-10 rounded cursor-pointer border border-gray-300"
                  />
                  <input
                    type="text"
                    value={settingsForm.primaryColor}
                    onChange={(e) => setSettingsForm({ ...settingsForm, primaryColor: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="#dc2626"
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">สีรอง (Secondary)</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settingsForm.secondaryColor}
                    onChange={(e) => setSettingsForm({ ...settingsForm, secondaryColor: e.target.value })}
                    className="w-12 h-10 rounded cursor-pointer border border-gray-300"
                  />
                  <input
                    type="text"
                    value={settingsForm.secondaryColor}
                    onChange={(e) => setSettingsForm({ ...settingsForm, secondaryColor: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="#1f2937"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <h3 className="font-bold text-gray-700 mb-4">ตัวอย่าง Header</h3>
              <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {settingsForm.logoUrl ? (
                    <img src={settingsForm.logoUrl} alt="Logo" className="h-8 object-contain" />
                  ) : (
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: settingsForm.primaryColor }}
                    >
                      T
                    </div>
                  )}
                  <div>
                    <span className="font-bold text-gray-900">{settingsForm.siteName || 'TruvaMate'}</span>
                    <p className="text-xs text-gray-500">{settingsForm.siteTagline || 'สโลแกน'}</p>
                  </div>
                </div>
                <button 
                  className="px-4 py-2 rounded-lg text-white font-bold text-sm"
                  style={{ backgroundColor: settingsForm.primaryColor }}
                >
                  เข้าสู่ระบบ
                </button>
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  siteSettingsService.resetToDefault();
                  setSiteSettings(siteSettingsService.getSettings());
                  setSettingsForm(siteSettingsService.getSettings());
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-semibold"
              >
                รีเซ็ตค่าเริ่มต้น
              </button>
              <button
                onClick={handleSaveSettings}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                บันทึกการตั้งค่า
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
