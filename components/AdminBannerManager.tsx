import React, { useState, useEffect } from 'react';
import { IconX, IconPlus, IconEdit, IconTrash, IconUpload, IconImage } from './Icons';
import bannerService, { Banner } from '../services/bannerService';

export const AdminBannerManager: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    // Load banners from service on mount
    setBanners(bannerService.getBanners());
  }, []);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState<Partial<Banner>>({
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

  const colorPresets = [
    { name: 'Black', value: 'bg-black' },
    { name: 'Red', value: 'bg-gradient-to-r from-red-600 to-red-500' },
    { name: 'Blue', value: 'bg-gradient-to-r from-blue-600 to-indigo-600' },
    { name: 'Green', value: 'bg-gradient-to-r from-green-600 to-emerald-600' },
    { name: 'Purple', value: 'bg-gradient-to-r from-purple-600 to-pink-600' },
    { name: 'Orange', value: 'bg-gradient-to-r from-orange-600 to-red-600' },
    { name: 'Teal', value: 'bg-gradient-to-r from-teal-600 to-cyan-600' },
    { name: 'Yellow', value: 'bg-gradient-to-r from-yellow-600 to-orange-500' }
  ];

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData(banner);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingBanner(null);
    setFormData({
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

  const handleSave = () => {
    if (editingBanner) {
      // Update existing banner
      bannerService.updateBanner(editingBanner.id, formData);
      setBanners(bannerService.getBanners());
    } else {
      // Add new banner
      const newBanner: Banner = {
        ...formData,
        id: Math.max(...banners.map(b => b.id), 0) + 1
      } as Banner;
      bannerService.addBanner(newBanner);
      setBanners(bannerService.getBanners());
    }
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบแบนเนอร์นี้?')) {
      bannerService.deleteBanner(id);
      setBanners(bannerService.getBanners());
    }
  };

  const handleToggleActive = (id: number) => {
    bannerService.toggleActive(id);
    setBanners(bannerService.getBanners());
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">จัดการแบนเนอร์</h1>
            <p className="text-gray-600 mt-1">แก้ไขและจัดการแบนเนอร์หน้าหลัก</p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg"
          >
            <IconPlus className="w-5 h-5" />
            เพิ่มแบนเนอร์
          </button>
        </div>

        {/* Banner List */}
        <div className="space-y-4">
          {banners.sort((a, b) => a.order - b.order).map((banner) => (
            <div
              key={banner.id}
              className={`bg-white rounded-xl shadow-sm border-2 ${banner.isActive ? 'border-green-200' : 'border-gray-200'} overflow-hidden`}
            >
              <div className="flex flex-col md:flex-row">
                {/* Preview */}
                <div className="md:w-1/3 relative">
                  <div className={`h-48 ${banner.color} relative overflow-hidden`}>
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
                      <h3 className="text-xl font-bold mb-1">{banner.title}</h3>
                      <p className="text-sm opacity-90">{banner.subtitle}</p>
                    </div>
                  </div>
                  {!banner.isActive && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold">ปิดใช้งาน</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{banner.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{banner.subtitle}</p>
                      <p className="text-gray-500 text-xs">{banner.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(banner)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                        title="แก้ไข"
                      >
                        <IconEdit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(banner.id)}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                        title="ลบ"
                      >
                        <IconTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">ขนาด:</span>
                      <span className="ml-2 font-semibold text-gray-900">{banner.width} × {banner.height} px</span>
                    </div>
                    <div>
                      <span className="text-gray-500">ลำดับ:</span>
                      <span className="ml-2 font-semibold text-gray-900">#{banner.order}</span>
                    </div>
                    <button
                      onClick={() => handleToggleActive(banner.id)}
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        banner.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {banner.isActive ? '✓ เปิดใช้งาน' : '○ ปิดใช้งาน'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowModal(false)}>
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingBanner ? 'แก้ไขแบนเนอร์' : 'เพิ่มแบนเนอร์ใหม่'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <IconX className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Preview */}
                <div className="rounded-xl overflow-hidden shadow-md">
                  <div className={`h-48 ${formData.color} relative overflow-hidden`}>
                    {formData.bgImage && (
                      <div className="absolute inset-0 opacity-30">
                        <img
                          src={formData.bgImage}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => e.currentTarget.style.display = 'none'}
                        />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
                    <div className="p-6 relative z-10 text-white">
                      <h3 className="text-2xl font-bold mb-1">{formData.title || 'ชื่อแบนเนอร์'}</h3>
                      <p className="text-sm opacity-90">{formData.subtitle || 'คำบรรยายย่อย'}</p>
                      <p className="text-xs opacity-75 mt-1">{formData.description || 'คำอธิบาย'}</p>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อแบนเนอร์</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="เช่น แจ็คพอตสูงสุด"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">คำบรรยายย่อย</label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="เช่น รางวัลใหญ่รออยู่"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">คำอธิบาย</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="เช่น โอกาสทองที่จะเปลี่ยนชีวิต"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">รายละเอียดเพิ่มเติม</label>
                    <textarea
                      value={formData.detail}
                      onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="รายละเอียดที่จะแสดงในป๊อปอัพ"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">URL รูปภาพพื้นหลัง</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.bgImage}
                        onChange={(e) => setFormData({ ...formData, bgImage: e.target.value })}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://example.com/image.jpg"
                      />
                      <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2">
                        <IconUpload className="w-4 h-4" />
                        อัพโหลด
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">สีพื้นหลัง</label>
                    <div className="grid grid-cols-4 gap-2">
                      {colorPresets.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setFormData({ ...formData, color: color.value })}
                          className={`${color.value} h-12 rounded-lg border-4 transition ${
                            formData.color === color.value ? 'border-blue-500 ring-2 ring-blue-200' : 'border-white hover:border-gray-300'
                          }`}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ความกว้าง (px)</label>
                    <input
                      type="number"
                      value={formData.width}
                      onChange={(e) => setFormData({ ...formData, width: parseInt(e.target.value) || 1200 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="800"
                      max="2000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ความสูง (px)</label>
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) || 400 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="200"
                      max="800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ลำดับการแสดง</label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">สถานะ</label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">เปิดใช้งานแบนเนอร์นี้</span>
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
                  onClick={handleSave}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
