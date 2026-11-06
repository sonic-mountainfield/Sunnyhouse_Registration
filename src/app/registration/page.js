"use client";

import { useState } from "react";
import Link from "next/link";

// 旅遊行程資料庫
const tourData = [
  {
    series: "西藏系列",
    tours: [
      { tourId: "TE", name: "林芝桃花・頂級西藏青藏鐵路12日", hasDayOptions: false, schedules: [{code: "TE1", date: "03/19-03/30"}, {code: "TE2", date: "04/02-04/13"}, {code: "TE3", date: "10/22-11/02"}, {code: "TE4", date: "11/05-11/16"}] },
      { tourId: "TB", name: "西藏聖母峰大環線・神山聖湖", hasDayOptions: true, dayOptions: ["10天", "12天"], schedules: [{code: "TB1", date: "04/02-04/13"}, {code: "TB2", date: "04/23-05/04"}, {code: "TB3", date: "06/04-06/15"}, {code: "TB4", date: "07/09-07/20"}, {code: "TB5", date: "08/13-08/24"}, {code: "TB6", date: "09/10-09/21"}, {code: "TB7", date: "09/24-10/05"}, {code: "TB8", date: "10/08-10/19"}, {code: "TB9", date: "10/22-11/02"}] },
      { tourId: "TK", name: "阿里岡仁波齊轉山之旅", hasDayOptions: false, schedules: [{code: "TK1", date: "06/04-06/15"}, {code: "TK2", date: "09/10-09/21"}] }
    ]
  },
  {
    series: "新疆系列",
    tours: [
      { tourId: "XS", name: "南疆・帕米爾高原・盤龍古道", hasDayOptions: false, schedules: [{code: "XS1", date: "04/02-04/11"}, {code: "XS2", date: "10/22-10/31"}] }
    ]
  },
  {
    series: "中國自駕系列",
    tours: [
      { tourId: "TC318", name: "此生必駕318・重機/四驅車自駕", hasDayOptions: false, schedules: [{code: "TC318-1", date: "04/14-04/26"}, {code: "TC318-2", date: "10/13-10/25"}] },
      { tourId: "TC", name: "聖母峰・重機/四驅車自駕", hasDayOptions: false, schedules: [{code: "TC1", date: "04/23-05/02"}, {code: "TC2", date: "10/22-10/31"}] },
      { tourId: "XSD", name: "帕米爾高原・盤龍古道 重機/四驅車自駕", hasDayOptions: false, schedules: [{code: "XSD1", date: "04/02-04/11"}, {code: "XSD2", date: "10/22-10/31"}] }
    ]
  },
  {
    series: "埃及系列",
    tours: [
      { tourId: "EG", name: "埃及撒哈拉之旅", hasDayOptions: false, schedules: [{code: "EG1", date: "2026/12/04-12/15"}, {code: "EG2", date: "2027/01/22-02/02"}, {code: "EG3", date: "2027/02/26-03/09"}, {code: "EG4", date: "2027/04/02-04/13"}, {code: "EG5", date: "2027/04/30-05/11"}] }
    ]
  }
];

export default function RegistrationForm() {
  // 表單資料狀態管理
  const [formData, setFormData] = useState({
    series: "", tourName: "", days: "", schedule: "",
    name: "", nationality: "", gender: "", birthDate: "", idNumber: "", phone: "", email: "", lineId: "",
    diet: "", dietNotes: "", roomType: "", otherReq: "",
    driveGroup: "", driveRole: "", motoModel: "",
    paymentMethod: "", needTaxId: false, companyTitle: "", taxId: "",
    agreedGeneral: false, agreedTibet: false, agreedDriving: false
  });

  // 系統狀態
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  // 動態推導目前可選行程與條款顯示
  const availableTours = tourData.find(s => s.series === formData.series)?.tours || [];
  const currentTourDetail = availableTours.find(t => t.name === formData.tourName);
  const availableSchedules = currentTourDetail?.schedules || [];
  const showDayOptions = currentTourDetail?.hasDayOptions || false;
  
  const isTibetTour = formData.series === "西藏系列";
  const isDrivingTour = formData.series === "中國自駕系列";

  // 處理輸入變更
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // 處理系列變更 (重置下層與特定條款)
  const handleSeriesChange = (e) => {
    setFormData(prev => ({
      ...prev,
      series: e.target.value,
      tourName: "", days: "", schedule: "",
      driveGroup: "", driveRole: "", motoModel: "",
      agreedTibet: false, agreedDriving: false
    }));
  };

  // 檢查所有必填條款是否勾選
  const canSubmit = formData.agreedGeneral && 
                    (!isTibetTour || formData.agreedTibet) && 
                    (!isDrivingTour || formData.agreedDriving);

  // 送出表單到 SheetDB
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    
    setIsSubmitting(true);

    // 產生訂單編號 (SY + YYMMDD + 3碼隨機)
    const dateStr = new Date().toISOString().slice(2,10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
    const newOrderNumber = `SY${dateStr}-${randomStr}`;
    setOrderNumber(newOrderNumber);

    // 準備上傳到 SheetDB 的資料格式 (必須與 Excel 欄位一模一樣)
    const payload = {
      data: [{
        "訂單編號": newOrderNumber,
        "報名時間": new Date().toLocaleString('zh-TW', { hour12: false }),
        "訂單狀態": "等候支付訂金",
        "行程系列": formData.series,
        "行程名稱": formData.tourName,
        "天數": formData.days,
        "出團檔期": formData.schedule,
        "中文姓名": formData.name,
        "國籍": formData.nationality,
        "性別": formData.gender,
        "出生年月日": formData.birthDate,
        "身分證_護照號碼": formData.idNumber,
        "手機號碼": formData.phone,
        "Email": formData.email,
        "LINE名稱_ID": formData.lineId,
        "飲食習慣": formData.diet,
        "飲食備註": formData.dietNotes,
        "住宿安排": formData.roomType,
        "其他需求": formData.otherReq,
        "自駕分組": formData.driveGroup,
        "自駕角色_配置": formData.driveRole,
        "重機車種": formData.motoModel,
        "支付方式": formData.paymentMethod,
        "客戶匯款後五碼": "",
        "刷卡連結": "",
        "應付訂金": 15000,
        "是否開立統編": formData.needTaxId ? "是" : "否",
        "公司抬頭": formData.companyTitle,
        "統一編號": formData.taxId,
        "西藏特殊規定同意": isTibetTour ? "TRUE" : "",
        "自駕切結書同意": isDrivingTour ? "TRUE" : ""
      }]
    };

    try {
      const response = await fetch('https://sheetdb.io/api/v1/6xxfvdvjl1t6l?sheet=Registration', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (result.created === 1) {
        setSubmitSuccess(true);
      }
    } catch (error) {
      console.error("報名失敗:", error);
      alert("系統連線發生錯誤，請稍後再試或聯繫客服。");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center border-t-8 border-[#8A1C14]">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">報名資料已送出！</h2>
          <p className="text-gray-600 mb-4">您的訂單編號為：<br/><span className="text-xl font-mono text-[#8A1C14] font-bold block mt-1">{orderNumber}</span></p>
          <p className="text-sm text-gray-500 mb-8">感謝您的報名，我們的業務專員將會盡快與您聯繫確認後續事宜。</p>
          <Link href="/" className="bg-[#8A1C14] text-white px-6 py-2 rounded hover:bg-[#9c221a] transition-colors inline-block">
            返回首頁
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center text-[#8A1C14] hover:underline mb-6">
          ← 返回首頁
        </Link>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden border-t-8 border-[#8A1C14]">
          <div className="p-8">
            <div className="text-center mb-8 border-b border-gray-200 pb-8">
              <h1 className="text-3xl font-bold text-gray-900">陽光小屋旅遊報名表</h1>
              <p className="mt-2 text-gray-600">填寫完成後系統將自動為您保留名額</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              
              {/* === 區塊一：行程選擇 === */}
              <section className="bg-orange-50/50 p-6 rounded-lg border border-orange-100">
                <h2 className="text-xl font-semibold text-[#8A1C14] mb-4 flex items-center gap-2">
                  <span className="bg-[#8A1C14] text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">1</span> 選擇行程與出發檔期
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">行程系列 *</label>
                    <select name="series" value={formData.series} onChange={handleSeriesChange} className="w-full rounded border-gray-300 border p-2 focus:ring-[#F59E0B]" required>
                      <option value="">請選擇行程系列</option>
                      {tourData.map(s => <option key={s.series} value={s.series}>{s.series}</option>)}
                    </select>
                  </div>
                  {formData.series && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">行程名稱 *</label>
                      <select name="tourName" value={formData.tourName} onChange={handleChange} className="w-full rounded border-gray-300 border p-2 focus:ring-[#F59E0B]" required>
                        <option value="">請選擇行程</option>
                        {availableTours.map(t => <option key={t.tourId} value={t.name}>{t.name}</option>)}
                      </select>
                    </div>
                  )}
                  {showDayOptions && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">行程天數 *</label>
                      <select name="days" value={formData.days} onChange={handleChange} className="w-full rounded border-gray-300 border p-2 focus:ring-[#F59E0B]" required>
                        <option value="">請選擇天數</option>
                        {currentTourDetail.dayOptions.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  )}
                  {formData.tourName && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">出團檔期 *</label>
                      <select name="schedule" value={formData.schedule} onChange={handleChange} className="w-full rounded border-gray-300 border p-2 focus:ring-[#F59E0B]" required>
                        <option value="">請選擇檔期</option>
                        {availableSchedules.map(sch => <option key={sch.code} value={sch.code}>{sch.code} ｜ {sch.date}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              </section>

              {/* === 區塊二：旅客基本資料 === */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">二、旅客基本資料</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">中文姓名 *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full rounded border-gray-300 border p-2 focus:ring-[#F59E0B]" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">國籍 *</label>
                    <select name="nationality" value={formData.nationality} onChange={handleChange} className="w-full rounded border-gray-300 border p-2 focus:ring-[#F59E0B]" required>
                      <option value="">請選擇國籍</option>
                      <option value="台灣">台灣</option>
                      <option value="中國">中國</option>
                      <option value="港澳">港澳</option>
                      <option value="新馬">新馬</option>
                      <option value="其他">其他</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">性別 *</label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center"><input type="radio" name="gender" value="男" onChange={handleChange} required className="text-[#8A1C14] focus:ring-[#8A1C14]" /> <span className="ml-2">男</span></label>
                      <label className="flex items-center"><input type="radio" name="gender" value="女" onChange={handleChange} required className="text-[#8A1C14] focus:ring-[#8A1C14]" /> <span className="ml-2">女</span></label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">出生年月日 (西元) *</label>
                    <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="w-full rounded border-gray-300 border p-2 focus:ring-[#F59E0B]" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">身分證字號 (外籍填護照號碼) *</label>
                    <input type="text" name="idNumber" value={formData.idNumber} onChange={handleChange} className="w-full rounded border-gray-300 border p-2 focus:ring-[#F59E0B]" required uppercase="true" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">聯絡電話 (手機) *</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full rounded border-gray-300 border p-2 focus:ring-[#F59E0B]" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">電子信箱 (Email) *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full rounded border-gray-300 border p-2 focus:ring-[#F59E0B]" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LINE 名稱或 ID</label>
                    <input type="text" name="lineId" value={formData.lineId} onChange={handleChange} className="w-full rounded border-gray-300 border p-2 focus:ring-[#F59E0B]" placeholder="方便業務聯繫用" />
                  </div>
                </div>
              </section>

              {/* === 區塊三：需求偏好 === */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">三、行程需求與偏好</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">飲食習慣 *</label>
                    <select name="diet" value={formData.diet} onChange={handleChange} className="w-full rounded border-gray-300 border p-2 focus:ring-[#F5
