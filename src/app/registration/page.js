"use client";

import { useState } from "react";
import Link from "next/link";

// 完整旅遊行程與檔期資料庫
const tourData = [
  {
    series: "西藏系列",
    tours: [
      { tourId: "TE", name: "TE｜林芝桃花・頂級西藏青藏鐵路12日", hasDayOptions: false, schedules: [
        {code: "TE1", date: "03/19-03/30"}, {code: "TE2", date: "04/02-04/13"}, 
        {code: "TE3", date: "10/22-11/02"}, {code: "TE4", date: "11/05-11/16"}
      ]},
      { tourId: "TB", name: "TB｜西藏聖母峰大環線・神山聖湖", hasDayOptions: true, dayOptions: ["10天", "12天"], schedules: [
        {code: "TB1", date: "04/02-04/13"}, {code: "TB2", date: "04/23-05/04"}, {code: "TB3", date: "06/04-06/15"}, 
        {code: "TB4", date: "07/09-07/20"}, {code: "TB5", date: "08/13-08/24"}, {code: "TB6", date: "09/10-09/21"}, 
        {code: "TB7", date: "09/24-10/05"}, {code: "TB8", date: "10/08-10/19"}, {code: "TB9", date: "10/22-11/02"}
      ]},
      { tourId: "TK", name: "TK｜阿里岡仁波齊轉山之旅", hasDayOptions: false, schedules: [
        {code: "TK1", date: "06/04-06/15"}, {code: "TK2", date: "09/10-09/21"}
      ]}
    ]
  },
  {
    series: "新疆系列",
    tours: [
      { tourId: "XS", name: "XS｜南疆・帕米爾高原・盤龍古道", hasDayOptions: false, schedules: [
        {code: "XS1", date: "04/02-04/11"}, {code: "XS2", date: "10/22-10/31"}
      ]}
    ]
  },
  {
    series: "中國自駕系列",
    tours: [
      { tourId: "TC318", name: "TC318｜此生必駕318・重機/四驅車自駕", hasDayOptions: false, schedules: [
        {code: "TC318-1", date: "04/14-04/26"}, {code: "TC318-2", date: "10/13-10/25"}
      ]},
      { tourId: "TC", name: "TC｜聖母峰・重機/四驅車自駕", hasDayOptions: false, schedules: [
        {code: "TC1", date: "04/23-05/02"}, {code: "TC2", date: "10/22-10/31"}
      ]},
      { tourId: "XSD", name: "XSD｜帕米爾高原・盤龍古道 重機/四驅車自駕", hasDayOptions: false, schedules: [
        {code: "XSD1", date: "04/02-04/11"}, {code: "XSD2", date: "10/22-10/31"}
      ]}
    ]
  },
  {
    series: "埃及系列",
    tours: [
      { tourId: "EG", name: "EG｜埃及撒哈拉之旅", hasDayOptions: false, schedules: [
        {code: "EG1", date: "2026/12/04-12/15"}, {code: "EG2", date: "2027/01/22-02/02"}, 
        {code: "EG3", date: "2027/02/26-03/09"}, {code: "EG4", date: "2027/04/02-04/13"}, 
        {code: "EG5", date: "2027/04/30-05/11"}
      ]}
    ]
  }
];

export default function RegistrationForm() {
  const [isGatewayPassed, setIsGatewayPassed] = useState(false);

  const [formData, setFormData] = useState({
    series: "", tourName: "", days: "", schedule: "",
    name: "", nationality: "", gender: "", birthDate: "", idNumber: "", phone: "", email: "", lineId: "",
    diet: "", dietNotes: "", roomType: "", otherReq: "",
    driveGroup: "", driveRole: "", motoModel: "",
    paymentMethod: "", needTaxId: false, companyTitle: "", taxId: "",
    agreedGeneral: false, agreedTibet: false, agreedDriving: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const availableTours = tourData.find(s => s.series === formData.series)?.tours || [];
  const currentTourDetail = availableTours.find(t => t.name === formData.tourName);
  const availableSchedules = currentTourDetail?.schedules || [];
  const showDayOptions = currentTourDetail?.hasDayOptions || false;

  // 判定是否適用西藏規範與自駕切結書
  const isDrivingTour = formData.series === "中國自駕系列";
  const isTibetTour = formData.series === "西藏系列" || (formData.tourName && formData.tourName.startsWith("TC"));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSeriesChange = (e) => {
    setFormData(prev => ({
      ...prev,
      series: e.target.value,
      tourName: "", days: "", schedule: "",
      driveGroup: "", driveRole: "", motoModel: "",
      agreedTibet: false, agreedDriving: false
    }));
  };

  const canSubmit = formData.agreedGeneral && 
                    (!isTibetTour || formData.agreedTibet) && 
                    (!isDrivingTour || formData.agreedDriving);

  const handleCopyAccount = async () => {
    try {
      await navigator.clipboard.writeText("20480100005240");
      alert("✅ 銀行帳號已成功複製！");
    } catch (err) {
      console.error("複製失敗:", err);
      alert("複製失敗，請手動選取複製。");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    
    setIsSubmitting(true);

    const dateStr = new Date().toISOString().slice(2,10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
    const newOrderNumber = `SY${dateStr}-${randomStr}`;
    setOrderNumber(newOrderNumber);

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

  // 成功送出畫面
  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full text-center border-t-8 border-[#8A1C14]">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">報名資料已送出！</h2>
          <p className="text-gray-600 mb-6">您的訂單編號為：<br/><span className="text-2xl font-mono text-[#8A1C14] font-bold block mt-2">{orderNumber}</span></p>
          
          <div className="bg-gray-50 p-6 rounded-lg text-left mb-8 border border-gray-200">
            {formData.paymentMethod === '匯款' ? (
              <>
                <h3 className="font-bold text-[#8A1C14] mb-4 text-lg border-b border-gray-200 pb-2">🏦 匯款資訊與後續步驟</h3>
                <ul className="text-gray-700 space-y-2 mb-5">
                  <li><strong>銀行：</strong>台新銀行 (代碼 812)</li>
                  <li><strong>分行：</strong>內湖分行</li>
                  <li><strong>戶名：</strong>德吉旅行社有限公司</li>
                  <li className="flex items-center gap-3 mt-3 p-3 bg-white rounded border border-gray-200">
                    <span className="font-mono text-lg font-bold tracking-wider text-gray-900">20480100005240</span>
                    <button 
                      onClick={handleCopyAccount}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm px-3 py-1.5 rounded transition-colors ml-auto flex items-center gap-1 font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      複製帳號
                    </button>
                  </li>
                </ul>
                <div className="bg-orange-50 p-4 rounded border border-orange-100 text-sm text-orange-800 leading-relaxed">
                  <strong>💡 匯款完成後請注意：</strong><br/>
                  請返回首頁進入 <Link href="/query" className="underline font-bold text-[#8A1C14]">客戶查詢系統</Link>，輸入您的「姓名」與「身分證字號」，並在系統中回填您的<strong>帳號後五碼</strong>，以便財務人員進行對帳。
                </div>
              </>
            ) : (
              <>
                <h3 className="font-bold text-[#8A1C14] mb-4 text-lg border-b border-gray-200 pb-2">💳 刷卡支付後續步驟</h3>
                <div className="text-gray-700 space-y-3">
                  <p>感謝您選擇信用卡支付。為了保障交易安全，業務專員在核對報名資料後，會為您建立專屬的加密刷卡連結。</p>
                  <div className="bg-orange-50 p-4 rounded border border-orange-100 text-sm text-orange-800 leading-relaxed mt-4">
                    <strong>💡 如何獲取刷卡連結：</strong><br/>
                    稍後請返回首頁進入 <Link href="/query" className="underline font-bold text-[#8A1C14]">客戶查詢系統</Link>。當專員建檔完成後，您就可以在查詢系統中直接點擊按鈕，前往安全的第三方金流頁面完成訂金支付。
                  </div>
                </div>
              </>
            )}
          </div>

          <Link href="/" className="bg-[#8A1C14] text-white px-8 py-3 rounded-lg hover:bg-[#9c221a] transition-colors inline-block font-bold shadow-md">
            ← 返回首頁
          </Link>
        </div>
      </div>
    );
  }

  // 入口同意關卡 (模組一：一般旅遊契約與報名聲明 6 點)
  if (!isGatewayPassed) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] py-10 px-4 sm:px-6 lg:px-8 font-sans flex items-center justify-center">
        <div className="max-w-3xl w-full bg-white rounded-xl shadow-lg overflow-hidden border-t-8 border-[#8A1C14]">
          <div className="p-6 sm:p-10">
            <Link href="/" className="inline-flex items-center text-[#8A1C14] hover:underline mb-6 text-sm">
              ← 返回首頁
            </Link>
            
            <div className="text-center mb-6 border-b pb-4">
              <h1 className="text-2xl font-bold text-gray-900 tracking-wide">行程報名須知與契約聲明</h1>
              <p className="text-sm text-gray-500 mt-1">為保障您的旅遊權益，請詳閱並確認以下契約條款後開始填表</p>
            </div>

            <div className="bg-gray-50 rounded-lg border border-gray-200 p-5 sm:p-6 mb-6 max-h-[460px] overflow-y-auto space-y-5 text-sm text-gray-700 leading-relaxed">
              <h2 className="text-base font-bold text-[#8A1C14] border-b border-gray-200 pb-2">
                【一般旅遊契約與報名聲明】
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">1. 定型化契約與個資同意：</h3>
                  <p className="text-gray-600">本公司各項旅遊行程均依據交通部觀光署頒布之《國外旅遊定型化契約書》規範執行。旅客於本系統完成報名並繳交訂金後，即視為已充分審閱並同意該契約之所有條款。為辦理旅遊業務，旅客同意陽光小屋旅遊依《個人資料保護法》蒐集、處理及利用本人之個人資料（含護照、台胞證等特種個資）。</p>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-1">2. 報名繳費與取消退費：</h3>
                  <p className="text-gray-600">報名經確認後，請於期限內繳付訂金，逾期未繳者系統將自動取消保留名額。若旅客因個人因素取消行程，取消扣款規定將嚴格依照《國外旅遊定型化契約書》第十三條之級距比例辦理。若機票或飯店已開立且產生之實際損失高於契約規定之比例，將依實際損失金額向旅客收取。</p>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-1">3. 護照效期與簽證責任：</h3>
                  <p className="text-gray-600">旅客請務必自行確認護照效期於「回國日」起算，必須具備<strong className="text-gray-900 font-semibold">六個月以上</strong>之有效效期。若因旅客提供之護照、台胞證等證件資料有誤，或因個人因素導致無法順利登機或入境，所衍生之所有損失及額外費用，均由旅客自行負責。</p>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-1">4. 住宿房型與單人房差：</h3>
                  <p className="text-gray-600">團體行程住宿以「雙人房（雙床）」為基礎。若旅客為單人報名且選擇「要求單人房」，須補足單人房差費用；若選擇「可併房」，本公司將協助安排與其他同性團員同房，若最終無法成功配房，仍須補足單人房差。</p>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-1">5. 行前資訊與集合義務：</h3>
                  <p className="text-gray-600">詳閱行前通知書並確實瞭解「集合時間」、「集合地點」與「送機資訊」為旅客之基本義務。若旅客因遲到錯過航班或集合，視同自願放棄行程，本公司將不予退費。</p>
                </div>

                <div className="bg-red-50/60 p-3 rounded border border-red-100">
                  <h3 className="font-bold text-[#8A1C14] mb-1">6. Lite行程特別聲明：</h3>
                  <p className="text-gray-700">報名 Lite 行程之旅客請務必注意，Lite 系列行程之團費<strong className="text-[#8A1C14] font-semibold">不包含全段機票、部分餐食及當地司機與領隊之小費</strong>，詳細費用明細請依該行程之網頁說明為準。</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#fcf8f2] border border-[#f5e6d3] mb-6">
              <label className="flex items-start cursor-pointer group">
                <input 
                  type="checkbox" 
                  name="agreedGeneral" 
                  checked={formData.agreedGeneral} 
                  onChange={handleChange} 
                  className="mt-1 h-5 w-5 text-[#8A1C14] border-gray-300 rounded focus:ring-[#8A1C14] cursor-pointer" 
                />
                <span className="ml-3 text-sm font-medium text-gray-800 leading-relaxed group-hover:text-[#8A1C14] transition-colors">
                  本人已詳細閱讀、充分理解並完全同意上述【一般旅遊契約與報名聲明】所有條款內容與各項權益規範。
                </span>
              </label>
            </div>

            <button
              onClick={() => setIsGatewayPassed(true)}
              disabled={!formData.agreedGeneral}
              className={`w-full py-4 px-4 text-lg font-bold rounded-lg text-white transition-all shadow-md
                ${formData.agreedGeneral ? 'bg-[#8A1C14] hover:bg-[#9c221a] hover:shadow-lg' : 'bg-gray-300 cursor-not-allowed'}
              `}
            >
              我已同意條款，開始填寫報名表 →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 報名表單主體畫面
  return (
    <div className="min-h-screen bg-[#FDFBF7] py-8 px-4 sm:px-6 lg:px-8 font-sans animate-fade-in-up">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => setIsGatewayPassed(false)} className="inline-flex items-center text-[#8A1C14] hover:underline mb-6 text-sm">
          ← 上一步：返回重閱一般旅遊契約
        </button>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden border-t-8 border-[#8A1C14]">
          <div className="p-8">
            <div className="text-center mb-8 border-b border-gray-200 pb-8">
              <h1 className="text-3xl font-bold text-gray-900">陽光小屋旅遊報名表</h1>
              <p className="mt-2 text-gray-600">填寫完成後系統將自動為您保留名額</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              
              {/* 區塊一：行程選擇 */}
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

              {/* 區塊二：旅客基本資料 */}
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
                    <input type="text" name="idNumber" value={formData.idNumber} onChange={handleChange} className="w-full rounded border-gray-300 border p-2 focus:ring-[#F59E0B]" required />
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

              {/* 區塊三：需求偏好 */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">三、行程需求與偏好</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">飲食習慣 *</label>
                    <select name="diet" value={formData.diet} onChange={handleChange} className="w-full rounded border-gray-300 border p-2 focus:ring-[#F59E0B]" required>
                      <option value="">請選擇</option>
                      <option value="葷食">葷食</option>
                      <option value="素食">素食</option>
                    </select>
                  </div>
                  {formData.diet === "素食" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">素食備註</label>
                      <input type="text" name="dietNotes" value={formData.dietNotes} onChange={handleChange} placeholder="例：全素、蛋奶素、鍋邊素" className="w-full rounded border-gray-300 border p-2 focus:ring-[#F59E0B]" />
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">住宿安排 *</label>
                    <select name="roomType" value={formData.roomType} onChange={handleChange} className="w-full rounded border-gray-300 border p-2 focus:ring-[#F59E0B]" required>
                      <option value="">請選擇房型安排</option>
                      <option value="單人報名，要求單人房 (需補單房差)">單人報名，要求單人房 (需補單房差)</option>
                      <option value="單人報名，可併房 (雙床房)">單人報名，可併房 (雙床房)</option>
                      <option value="多人報名，雙床房 (兩張單人床)">多人報名，雙床房 (兩張單人床)</option>
                      <option value="多人報名，一大床房">多人報名，一大床房</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">其他需求留言</label>
                    <textarea name="otherReq" value={formData.otherReq} onChange={handleChange} rows="2" className="w-full rounded border-gray-300 border p-2 focus:ring-[#F59E0B]"></textarea>
                  </div>
                </div>
              </section>

              {/* 區塊四：自駕配置 */}
              {isDrivingTour && (
                <section className="bg-gray-100 p-6 rounded-lg border border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    🚗 自駕車輛與分組配置
                  </h2>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">自駕分組 *</label>
                      <select name="driveGroup" value={formData.driveGroup} onChange={handleChange} className="w-full rounded border-gray-300 border p-2 focus:ring-[#F59E0B]" required>
                        <option value="">請選擇</option>
                        <option value="開車組">🚙 開車組</option>
                        <option value="重機組">🏍️ 重機組</option>
                      </select>
                    </div>

                    {formData.driveGroup === "開車組" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">車輛配置 *</label>
                        <select name="driveRole" value={formData.driveRole} onChange={handleChange} className="w-full rounded border-gray-300 border p-2 focus:ring-[#F59E0B]" required>
                          <option value="">請選擇</option>
                          <option value="四人一車">四人一車</option>
                          <option value="三人一車">三人一車</option>
                          <option value="兩人一車">兩人一車</option>
                        </select>
                      </div>
                    )}

                    {formData.driveGroup === "重機組" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">乘車角色 *</label>
                        <select name="driveRole" value={formData.driveRole} onChange={handleChange} className="w-full rounded border-gray-300 border p-2 focus:ring-[#F59E0B]" required>
                          <option value="">請選擇</option>
                          <option value="駕駛">駕駛</option>
                          <option value="乘客">乘客</option>
                        </select>
                      </div>
                    )}

                    {formData.driveGroup === "重機組" && formData.driveRole === "駕駛" && (
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">重機車種選擇 *</label>
                        <select name="motoModel" value={formData.motoModel} onChange={handleChange} className="w-full rounded border-gray-300 border p-2 focus:ring-[#F59E0B]" required>
                          <option value="">請選擇車種</option>
                          <option value="450~700cc ADV或低座高車款">450~700cc ADV 或低座高車款</option>
                          <option value="800~1000cc ADV或低座高車款">800~1000cc ADV 或低座高車款</option>
                          <option value="BMW R1250GS">BMW R1250GS</option>
                        </select>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* 區塊五：結帳與發票 */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">四、結帳與發票資訊</h2>
                <div className="bg-[#fcf8f2] p-4 rounded mb-6 text-center border border-[#f5e6d3]">
                  <p className="text-lg font-medium text-[#8A1C14]">行程支付訂金：每位 15,000 元新台幣</p>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">選擇支付方式 *</label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`border-2 rounded-lg p-4 cursor-pointer text-center transition-colors ${formData.paymentMethod === '匯款' ? 'border-[#8A1C14] bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="paymentMethod" value="匯款" onChange={handleChange} className="hidden" required />
                      <span className="block text-lg font-medium text-gray-900">🏦 銀行匯款</span>
                      <span className="block text-sm text-gray-500 mt-1">送出後請於查詢系統回填後五碼</span>
                    </label>
                    <label className={`border-2 rounded-lg p-4 cursor-pointer text-center transition-colors ${formData.paymentMethod === '刷卡' ? 'border-[#8A1C14] bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="paymentMethod" value="刷卡" onChange={handleChange} className="hidden" required />
                      <span className="block text-lg font-medium text-gray-900">💳 信用卡刷卡</span>
                      <span className="block text-sm text-gray-500 mt-1">送出後專員將發送刷卡連結</span>
                    </label>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input type="checkbox" name="needTaxId" checked={formData.needTaxId} onChange={handleChange} className="h-5 w-5 text-[#8A1C14] rounded focus:ring-[#8A1C14]" />
                    <span className="ml-2 text-gray-700">代轉收據需要開立統一編號</span>
                  </label>
                  {formData.needTaxId && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 bg-gray-50 p-4 rounded border">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">公司抬頭 *</label>
                        <input type="text" name="companyTitle" value={formData.companyTitle} onChange={handleChange} className="w-full rounded border-gray-300 border p-2 focus:ring-[#F59E0B]" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">統一編號 *</label>
                        <input type="text" name="taxId" value={formData.taxId} onChange={handleChange} className="w-full rounded border-gray-300 border p-2 focus:ring-[#F59E0B]" required maxLength="8" />
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* 區塊六：特殊行程條款確認 (模組二 & 模組三) */}
              {(isTibetTour || isDrivingTour) && (
                <section className="space-y-8">
                  <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">五、特殊行程條款確認</h2>

                  {/* 模組二：西藏入藏專屬特殊規範 (4項條列式) */}
                  {isTibetTour && (
                    <div className="bg-red-50/40 p-6 rounded-lg border border-red-200">
                      <div className="flex items-center justify-between mb-4 border-b border-red-200 pb-3">
                        <h3 className="text-lg font-bold text-[#8A1C14] flex items-center gap-2">
                          🏔️【西藏入藏專屬特殊規範】
                        </h3>
                        <span className="bg-[#8A1C14] text-white text-xs px-2.5 py-1 rounded font-medium">
                          西藏系列行程必簽
                        </span>
                      </div>

                      <div className="space-y-4 text-sm text-gray-700 leading-relaxed mb-6">
                        <div className="bg-white p-4 rounded border border-red-100 shadow-sm">
                          <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                            <span className="text-[#8A1C14]">1.</span> 職業誠實宣告與免責：
                          </h4>
                          <p className="text-gray-600 pl-4">
                            本人鄭重聲明，目前之職業及身分<strong className="text-red-700">「並非」現役軍人、警察、國安相關人員或新聞工作者（記者）</strong>。因當地政策規定，旅行社無法接待上述職業身分之旅客。本人保證所提供之資料絕對屬實，若因隱瞞、偽造或不誠實告知，導致無法順利辦理「入藏函」或遭拒絕入境，<strong className="text-gray-900">所有衍生之取消費用、交通損失及全額團費均由本人自行負擔，陽光小屋旅遊概不負責，亦無任何過失。</strong>
                          </p>
                        </div>

                        <div className="bg-white p-4 rounded border border-red-100 shadow-sm">
                          <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                            <span className="text-[#8A1C14]">2.</span> 嚴格集合規定與無退款聲明：
                          </h4>
                          <p className="text-gray-600 pl-4">
                            因應入藏函之嚴格核驗與團進團出規定，本公司將明確指定入藏之「集合地點與時間」。本人清楚知悉並同意：若因個人因素遲到、錯過指定之集合或送機時間，將導致無法通過安檢與查驗，進而無法進入西藏。<strong className="text-red-700">一旦錯過指定集合與入藏時間，將「無任何補救措施」，且「無法要求任何形式之退款或補償」。</strong>
                          </p>
                        </div>

                        <div className="bg-white p-4 rounded border border-red-100 shadow-sm">
                          <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                            <span className="text-[#8A1C14]">3.</span> 高齡旅客健康檢查規定：
                          </h4>
                          <p className="text-gray-600 pl-4">
                            報名西藏行程之旅客，若報名時年齡達<strong className="text-gray-900">64歲（含足64歲）以上</strong>，為確保高原旅遊之安全，<strong className="text-red-700">須於出發前三個月完成簡易健康檢查</strong>。檢查報告須包含血壓、脈搏、心跳等基本數值（無須進行抽血或驗尿），詳細檢驗規範與流程請配合業務人員之說明與安排。
                          </p>
                        </div>

                        <div className="bg-white p-4 rounded border border-red-100 shadow-sm">
                          <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                            <span className="text-[#8A1C14]">4.</span> 入藏證件繳交規範：
                          </h4>
                          <p className="text-gray-600 pl-4">
                            為順利辦理入藏函手續，旅客<strong className="text-red-700">須於出發前三個月</strong>，提供具備有效效期之護照與台胞證。請務必依照本公司規定之格式，清晰拍攝台胞證之正反面圖檔並完成上傳，以免延誤入藏申請審查作業。
                          </p>
                        </div>
                      </div>

                      <div className="p-3.5 rounded bg-white border-2 border-red-200">
                        <label className="flex items-start cursor-pointer group">
                          <input 
                            type="checkbox" 
                            name="agreedTibet" 
                            checked={formData.agreedTibet} 
                            onChange={handleChange} 
                            className="mt-1 h-5 w-5 text-[#8A1C14] border-gray-300 rounded focus:ring-[#8A1C14] cursor-pointer" 
                            required 
                          />
                          <span className="ml-3 text-sm font-semibold text-gray-900 leading-relaxed group-hover:text-[#8A1C14] transition-colors">
                            本人已逐項審閱、充分知悉並同意遵守上述【西藏入藏專屬特殊規範】全部 4 項規定與法律責任。
                          </span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* 模組三：中國自駕行程切結書 (3項條列式) */}
                  {isDrivingTour && (
                    <div className="bg-amber-50/50 p-6 rounded-lg border border-amber-200">
                      <div className="flex items-center justify-between mb-4 border-b border-amber-200 pb-3">
                        <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                          🚗【中國自駕行程切結書】
                        </h3>
                        <span className="bg-amber-600 text-white text-xs px-2.5 py-1 rounded font-medium">
                          自駕行程專屬切結
                        </span>
                      </div>

                      <div className="space-y-4 text-sm text-gray-700 leading-relaxed mb-6">
                        <div className="bg-white p-4 rounded border border-amber-100 shadow-sm">
                          <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                            <span className="text-amber-700">1.</span> 駕駛資格與證件：
                          </h4>
                          <p className="text-gray-600 pl-4">
                            選擇「重機/汽車駕駛」之旅客，確認自身具備合格且有效之駕駛執照，並具備足夠之駕駛經驗。本人同意配合主辦方辦理當地臨時駕照或相關證件手續，<strong className="text-gray-900">若因個人資格不符導致無法合法駕駛，相關損失由本人自行承擔。</strong>
                          </p>
                        </div>

                        <div className="bg-white p-4 rounded border border-amber-100 shadow-sm">
                          <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                            <span className="text-amber-700">2.</span> 車輛損害與違規責任：
                          </h4>
                          <p className="text-gray-600 pl-4">
                            自駕期間，若因本人之故意、過失或違反當地交通法規（如超速、違規停車等），導致車輛損毀、人員傷亡或收到交通罰單，<strong className="text-red-700">本人願負擔所有法律責任、罰鍰及車輛維修與營業損失之賠償費用。</strong>
                          </p>
                        </div>

                        <div className="bg-white p-4 rounded border border-amber-100 shadow-sm">
                          <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                            <span className="text-amber-700">3.</span> 車隊紀律與安全：
                          </h4>
                          <p className="text-gray-600 pl-4">
                            基於團隊安全考量，自駕期間必須嚴格遵守車隊領隊之指揮，<strong className="text-red-700">嚴禁酒後駕車或危險駕駛</strong>。若因嚴重違反導致安全疑慮，<strong className="text-gray-900">本公司有權立即終止本人之駕駛權利，且不予退還任何費用。</strong>
                          </p>
                        </div>
                      </div>

                      <div className="p-3.5 rounded bg-white border-2 border-amber-300">
                        <label className="flex items-start cursor-pointer group">
                          <input 
                            type="checkbox" 
                            name="agreedDriving" 
                            checked={formData.agreedDriving} 
                            onChange={handleChange} 
                            className="mt-1 h-5 w-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500 cursor-pointer" 
                            required 
                          />
                          <span className="ml-3 text-sm font-semibold text-gray-900 leading-relaxed group-hover:text-amber-800 transition-colors">
                            本人已逐項審閱、充分知悉並同意簽署遵守上述【中國自駕行程切結書】全部 3 項條款。
                          </span>
                        </label>
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* 送出報名按鈕 */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className={`w-full py-4 px-4 text-xl font-bold rounded-lg text-white transition-all shadow-md
                    ${canSubmit && !isSubmitting ? 'bg-[#8A1C14] hover:bg-[#9c221a] hover:shadow-lg' : 'bg-gray-400 cursor-not-allowed'}
                  `}
                >
                  {isSubmitting ? '資料傳送中，請稍候...' : '確認條款並送出報名'}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
