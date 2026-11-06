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
  const [copied, setCopied] = useState(false);

  const availableTours = tourData.find(s => s.series === formData.series)?.tours || [];
  const currentTourDetail = availableTours.find(t => t.name === formData.tourName);
  const availableSchedules = currentTourDetail?.schedules || [];
  const showDayOptions = currentTourDetail?.hasDayOptions || false;

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

  // 一鍵複製純數字帳號（相容所有手機與瀏覽器環境）
  const handleCopyAccount = async () => {
    const rawNumber = "20480100005240";
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(rawNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
        return;
      } catch (err) {
        console.warn("Clipboard API 失敗，切換備用方案", err);
      }
    }
    // 降級備用複製機制
    const textArea = document.createElement("textarea");
    textArea.value = rawNumber;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      alert("請手動複製帳號：20480100005240");
    }
    document.body.removeChild(textArea);
  };

  // 點擊送出時執行詳細防呆校驗
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. 行程檢核
    if (!formData.series || !formData.tourName || !formData.schedule) {
      alert("請確認已選擇【行程系列】、【行程名稱】與【出團檔期】！");
      return;
    }
    if (showDayOptions && !formData.days) {
      alert("請選擇【行程天數】！");
      return;
    }

    // 2. 基本資料檢核
    if (!formData.name || !formData.nationality || !formData.gender || !formData.birthDate || !formData.idNumber || !formData.phone || !formData.email) {
      alert("請完整填寫【旅客基本資料】所有必填欄位！");
      return;
    }

    // 3. 需求檢核
    if (!formData.diet || !formData.roomType) {
      alert("請完整選擇【飲食習慣】與【住宿安排】！");
      return;
    }

    // 4. 自駕專屬檢核
    if (isDrivingTour) {
      if (!formData.driveGroup || !formData.driveRole) {
        alert("自駕行程請完整選擇【自駕分組】與【車輛/角色配置】！");
        return;
      }
      if (formData.driveGroup === "重機組" && formData.driveRole === "駕駛" && !formData.motoModel) {
        alert("重機駕駛請選擇【重機車種】！");
        return;
      }
    }

    // 5. 支付方式檢核
    if (!formData.paymentMethod) {
      alert("請選擇支付方式（銀行匯款 或 信用卡刷卡）！");
      return;
    }

    // 6. 統編檢核
    if (formData.needTaxId && (!formData.companyTitle || !formData.taxId)) {
      alert("勾選開立統編者，請填寫公司抬頭與統一編號！");
      return;
    }

    // 7. 特殊條款檢核
    if (isTibetTour && !formData.agreedTibet) {
      alert("您所報名之行程涉及西藏入藏手續，請閱讀並勾選【西藏入藏專屬特殊規範】！");
      return;
    }
    if (isDrivingTour && !formData.agreedDriving) {
      alert("您所報名之行程為自駕行程，請閱讀並勾選【中國自駕行程切結書】！");
      return;
    }

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
        "天數": formData.days || "",
        "出團檔期": formData.schedule,
        "中文姓名": formData.name,
        "國籍": formData.nationality,
        "性別": formData.gender,
        "出生年月日": formData.birthDate,
        "身分證_護照號碼": formData.idNumber,
        "手機號碼": formData.phone,
        "Email": formData.email,
        "LINE名稱_ID": formData.lineId || "",
        "飲食習慣": formData.diet,
        "飲食備註": formData.dietNotes || "",
        "住宿安排": formData.roomType,
        "其他需求": formData.otherReq || "",
        "自駕分組": formData.driveGroup || "",
        "自駕角色_配置": formData.driveRole || "",
        "重機車種": formData.motoModel || "",
        "支付方式": formData.paymentMethod,
        "客戶匯款後五碼": "",
        "刷卡連結": "",
        "應付訂金": 15000,
        "是否開立統編": formData.needTaxId ? "是" : "否",
        "公司抬頭": formData.companyTitle || "",
        "統一編號": formData.taxId || "",
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

      if (response.ok || result.created >= 1 || (result && !result.error)) {
        setSubmitSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        console.error("SheetDB 儲存失敗:", result);
        alert(`報名傳送未完成：${result.error || result.message || "請檢查網路或稍後重試"}`);
      }
    } catch (error) {
      console.error("報名發送失敗:", error);
      alert("連線發生異常，請檢查網路連線或直接洽詢客服。");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==================== 成功送出：專屬付款與對帳教學頁面 ====================
  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-[#121110] text-[#EDE8DF] py-12 px-4 sm:px-6 lg:px-8 font-sans flex items-center justify-center">
        <div className="max-w-2xl w-full bg-[#1A1816] rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
          
          {/* 成功標頭 */}
          <div className="bg-gradient-to-r from-[#8A1C14] to-[#5a120c] p-8 text-center text-white">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide">報名資料已成功送出！</h1>
            <p className="text-white/80 text-sm mt-1">系統已保留您的參團意向，請依照以下說明完成訂金繳付</p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            
            {/* 訂單摘要卡片 */}
            <div className="bg-[#24211D] rounded-xl p-5 border border-white/5 space-y-2 text-sm">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-stone-400">專屬訂單編號</span>
                <span className="font-mono text-xl font-black text-[#F59E0B] tracking-wider">{orderNumber}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-stone-400">報名行程</span>
                <span className="font-medium text-white text-right">{formData.tourName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">出團檔期</span>
                <span className="text-white font-mono">{formData.schedule}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">旅客姓名</span>
                <span className="text-white">{formData.name}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2">
                <span className="text-stone-400">應付訂金金額</span>
                <span className="text-[#F59E0B] font-bold text-base">NT$ 15,000 元</span>
              </div>
            </div>

            {/* 匯款流程詳細說明卡片 */}
            {formData.paymentMethod === "匯款" ? (
              <div className="bg-[#231F1C] rounded-xl p-6 border-2 border-[#8A1C14]/60 space-y-5">
                <div className="flex items-center gap-2 text-[#F59E0B] font-bold text-lg border-b border-white/10 pb-3">
                  <span>🏦</span>
                  <span>銀行匯款帳戶資訊</span>
                </div>

                <div className="space-y-3 text-sm text-stone-300">
                  <div className="flex justify-between"><span className="text-stone-400">收款銀行：</span><span className="font-semibold text-white">台新銀行 (銀行代碼 812)</span></div>
                  <div className="flex justify-between"><span className="text-stone-400">分行別：</span><span className="font-semibold text-white">內湖分行</span></div>
                  <div className="flex justify-between"><span className="text-stone-400">戶名：</span><span className="font-semibold text-white">德吉旅行社有限公司</span></div>
                  <div className="flex justify-between items-center pt-1"><span className="text-stone-400">帳號（附連字號）：</span><span className="font-mono text-white">2048-01-0000524-0</span></div>
                </div>

                {/* 一鍵複製純數字帳號區塊 */}
                <div className="bg-[#121110] p-4 rounded-lg border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-stone-400 block">網銀轉帳專用（純數字無連字號）：</span>
                    <span className="font-mono text-xl font-bold tracking-widest text-[#F59E0B]">20480100005240</span>
                  </div>
                  <button
                    onClick={handleCopyAccount}
                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                      copied 
                        ? 'bg-green-600 text-white' 
                        : 'bg-[#8A1C14] hover:bg-[#a32219] text-white shadow-md'
                    }`}
                  >
                    {copied ? (
                      <><span>✓</span><span>已複製純數字！</span></>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>一鍵複製帳號</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 對帳教學指引 */}
                <div className="bg-amber-950/30 border border-amber-600/40 rounded-lg p-4 space-y-2 text-xs sm:text-sm text-amber-200/90 leading-relaxed">
                  <p className="font-bold text-[#F59E0B] text-sm flex items-center gap-1.5">
                    <span>💡</span> 匯款後對帳操作教學：
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 text-stone-300">
                    <li>請透過網路銀行 APP 或實體 ATM 完成訂金匯款（NT$ 15,000）。</li>
                    <li>匯款完成後，點擊下方按鈕前往「<strong className="text-white">客戶查詢系統</strong>」。</li>
                    <li>輸入您的「<strong className="text-white">中文姓名</strong>」與「<strong className="text-white">身分證字號</strong>」查詢報名紀錄。</li>
                    <li>點進訂單後，於繳費區回填「<strong className="text-[#F59E0B]">匯款帳號後五碼</strong>」並送出，專員將立即為您完成對帳並保留名額！</li>
                  </ol>
                </div>
              </div>
            ) : (
              /* 刷卡流程說明卡片 */
              <div className="bg-[#231F1C] rounded-xl p-6 border-2 border-blue-500/40 space-y-4">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-lg border-b border-white/10 pb-3">
                  <span>💳</span>
                  <span>信用卡線上刷卡步驟</span>
                </div>
                <div className="text-sm text-stone-300 space-y-2 leading-relaxed">
                  <p>您已選擇以信用卡支付訂金（NT$ 15,000 元）。</p>
                  <p>為確保交易與身分安全，業務專員將於核對資料後為您生成加密的專屬刷卡頁面。</p>
                </div>
                <div className="bg-blue-950/40 border border-blue-500/40 rounded-lg p-4 text-xs sm:text-sm text-blue-200/90 space-y-1.5">
                  <p className="font-bold text-white">💡 如何進行刷卡：</p>
                  <p>請稍候片刻前往「客戶查詢系統」，登入後若專員已綁定刷卡單，點擊「前往信用卡支付頁面」按鈕即可在安全金流環境完成刷卡。</p>
                </div>
              </div>
            )}

            {/* 操作按鈕群 */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href="/query"
                className="flex-1 bg-[#F59E0B] hover:bg-[#d97706] text-black font-extrabold py-3.5 px-4 rounded-xl text-center transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                <span>前往「客戶查詢系統」回填對帳</span>
                <span>→</span>
              </Link>
              <Link
                href="/"
                className="sm:w-36 bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium py-3.5 px-4 rounded-xl text-center transition-colors border border-white/10"
              >
                返回首頁
              </Link>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ==================== 入口關卡：模組一 一般旅遊契約 (6 點完整條約) ====================
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
              onClick={() => {
                if (!formData.agreedGeneral) {
                  alert("請先閱讀條款並勾選同意框！");
                  return;
                }
                setIsGatewayPassed(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full py-4 px-4 text-lg font-bold rounded-lg text-white transition-all shadow-md bg-[#8A1C14] hover:bg-[#9c221a]"
            >
              我已同意條款，開始填寫報名表 →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== 報名表主體 ====================
  return (
    <div className="min-h-screen bg-[#FDFBF7] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => setIsGatewayPassed(false)} className="inline-flex items-center text-[#8A1C14] hover:underline mb-6 text-sm">
          ← 上一步：返回重閱一般旅遊契約
        </button>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden border-t-8 border-[#8A1C14]">
          <div className="p-6 sm:p-10">
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
                    <select name="series" value={formData.series} onChange={handleSeriesChange} className="w-full rounded border-gray-300 border p-2 focus:ring-[#F59E0B]">
                      <option value="">請選擇行程系列</option>
                      {tourData.map(s => <option key={s.series} value={s.series}>{s.series}</option>)}
                    </select>
                  </div>
                  {formData.series && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">行程名稱 *</label>
                      <select name="tourName" value={formData.tourName} onChange={handleChange} className="w-full rounded border-gray-300 border p-2 focus:ring-[#F59E0B]">
                        <option value="">請選擇行程</option>
                        {availableTours.map(t => <option key={t.tourId} value={t.name}>{t.name}</option>)}
                      </select>
                    </div>
                  )}
                  {showDayOptions && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">行程天數 *</label>
                      <select name="days" value={formData.days} onChange={handleChange} className="w-full rounded border-gray-300 border p-2 focus:ring-[#F59E0B]">
                        <option value="">請選擇天數</option>
                        {currentTourDetail.dayOptions.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  )}
                  {formData.tourName && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">出團檔期 *</label>
                      <select name="schedule" value={formData.schedule} onChange={handleChange} className="w-full rounded border-gray-300 border p-2 focus:ring-[#F59E0B]">
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
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full rounded border-gray-300 border p-2 focus:ring-[#F59E0B]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">國籍 *</label>
                    <select name="nationality" value={formData.nationality} onChange={handleChange} className="w-full rounded border-gray-300 border p-2 focus:ring-[#F59E0B]">
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
                      <label className="flex items-center cursor-pointer">
                        <input type="radio" name="gender" value="男" checked={formData.gender === "男"} onChange={handleChange} className="text-[#8A1C14] focus:ring-[#8A1C14]" />
                        <span className="ml-2">男</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input type="radio" name="gender" value="女" checked={formData.gender === "女"} onChange={handleChange} className="text-[#8A1C14] focus:ring-[#8A1C14]" />
                        <span className="ml-2">女</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">出生年月日 (西元) *</label>
                    <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="w-full rounded border-gray-300 border p-2 focus:ring-[#F59E0B]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">身分證字號 (外籍填護照號碼) *</label>
                    <input type="text" name="idNumber" value={formData.idNumber} onChange={handleChange} className="w-full rounded border-gray-300 border p-2 focus:ring-[#F59E0B]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">聯絡電話 (手機) *</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full rounded border-gray-300 border p-2 focus:ring-[#F59E0B]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">電子信箱 (Email) *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full rounded border-gray-300 border p-2 focus:ring-[#F59E0B]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LINE 名稱或 ID</label>
                    <input type="text" name="lineId" value={formData.lineId} onChange={handleChange} className="w-full rounded border-gray-300 border p-2 focus:ring-[#F59E0B]" placeholder="方便業務聯繫用" />
                  </div>
                </div>
              </section>

              {/* 區塊三：行程需求 */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">三、行程需求與偏好</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">飲食習慣 *</label>
                    <select name="diet" value={formData.diet} onChange={handleChange} className="w-full rounded border-gray-300 border p-2 focus:ring-[#F59E0B]">
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
                    <select name="roomType" value={formData.roomType} onChange={handleChange} className="w-full rounded border-gray-300 border p-2 focus:ring-[#F59E0B]">
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

              {/* 區塊四：自駕配置 (條件呈現) */}
              {isDrivingTour && (
                <section className="bg-gray-100 p-6 rounded-lg border border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    🚗 自駕車輛與分組配置
                  </h2>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">自駕分組 *</label>
                      <select name="driveGroup" value={formData.driveGroup} onChange={handleChange} className="w-full rounded border-gray-300 border p-2 focus:ring-[#F59E0B]">
                        <option value="">請選擇</option>
                        <option value="開車組">🚙 開車組</option>
                        <option value="重機組">🏍️ 重機組</option>
                      </select>
                    </div>

                    {formData.driveGroup === "開車組" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">車輛配置 *</label>
                        <select name="driveRole" value={formData.driveRole} onChange={handleChange} className="w-full rounded border-gray-300 border p-2 focus:ring-[#F59E0B]">
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
                        <select name="driveRole" value={formData.driveRole} onChange={handleChange} className="w-full rounded border-gray-300 border p-2 focus:ring-[#F59E0B]">
                          <option value="">請選擇</option>
                          <option value="駕駛">駕駛</option>
                          <option value="乘客">乘客</option>
                        </select>
                      </div>
                    )}

                    {formData.driveGroup === "重機組" && formData.driveRole === "駕駛" && (
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">重機車種選擇 *</label>
                        <select name="motoModel" value={formData.motoModel} onChange={handleChange} className="w-full rounded border-gray-300 border p-2 focus:ring-[#F59E0B]">
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

              {/* 區塊五：結帳與發票 (修復原生 Radio 隱藏問題) */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">四、結帳與發票資訊</h2>
                <div className="bg-[#fcf8f2] p-4 rounded mb-6 text-center border border-[#f5e6d3]">
                  <p className="text-lg font-medium text-[#8A1C14]">行程支付訂金：每位 15,000 元新台幣</p>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">選擇支付方式 *</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div 
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: "匯款" }))}
                      className={`border-2 rounded-xl p-4 cursor-pointer text-center transition-all ${
                        formData.paymentMethod === '匯款' 
                          ? 'border-[#8A1C14] bg-red-50/70 shadow-sm' 
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <span className="block text-lg font-bold text-gray-900">🏦 銀行匯款</span>
                      <span className="block text-xs text-gray-500 mt-1">台新帳戶・匯款後回填後五碼</span>
                    </div>

                    <div 
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: "刷卡" }))}
                      className={`border-2 rounded-xl p-4 cursor-pointer text-center transition-all ${
                        formData.paymentMethod === '刷卡' 
                          ? 'border-[#8A1C14] bg-red-50/70 shadow-sm' 
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <span className="block text-lg font-bold text-gray-900">💳 信用卡刷卡</span>
                      <span className="block text-xs text-gray-500 mt-1">專員生成專屬線上刷卡單</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" name="needTaxId" checked={formData.needTaxId} onChange={handleChange} className="h-5 w-5 text-[#8A1C14] rounded focus:ring-[#8A1C14]" />
                    <span className="ml-2 text-gray-700">代轉收據需要開立統一編號</span>
                  </label>
                  {formData.needTaxId && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 bg-gray-50 p-4 rounded border">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">公司抬頭 *</label>
                        <input type="text" name="companyTitle" value={formData.companyTitle} onChange={handleChange} className="w-full rounded border-gray-300 border p-2 focus:ring-[#F59E0B]" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">統一編號 *</label>
                        <input type="text" name="taxId" value={formData.taxId} onChange={handleChange} className="w-full rounded border-gray-300 border p-2 focus:ring-[#F59E0B]" maxLength="8" />
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* 區塊六：特殊行程條款確認 */}
              {(isTibetTour || isDrivingTour) && (
                <section className="space-y-8">
                  <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">五、特殊行程條款確認</h2>

                  {/* 西藏規範 */}
                  {isTibetTour && (
                    <div className="bg-red-50/40 p-6 rounded-lg border border-red-200">
                      <div className="flex items-center justify-between mb-4 border-b border-red-200 pb-3">
                        <h3 className="text-lg font-bold text-[#8A1C14]">🏔️【西藏入藏專屬特殊規範】</h3>
                        <span className="bg-[#8A1C14] text-white text-xs px-2.5 py-1 rounded font-medium">西藏行程必簽</span>
                      </div>

                      <div className="space-y-4 text-sm text-gray-700 leading-relaxed mb-6">
                        <div className="bg-white p-4 rounded border border-red-100 shadow-sm">
                          <h4 className="font-bold text-gray-900 mb-1"><span className="text-[#8A1C14]">1.</span> 職業誠實宣告與免責：</h4>
                          <p className="text-gray-600 pl-4">本人鄭重聲明，目前職業身分<strong className="text-red-700">「並非」現役軍人、警察、國安相關人員或新聞工作者（記者）</strong>。因當地政策無法接待上述身分。本人保證所填屬實，若隱瞞導致無法辦理入藏函或遭拒入境，<strong className="text-gray-900">衍生之所有取消費與全額團費由本人負擔，旅行社概不負責。</strong></p>
                        </div>

                        <div className="bg-white p-4 rounded border border-red-100 shadow-sm">
                          <h4 className="font-bold text-gray-900 mb-1"><span className="text-[#8A1C14]">2.</span> 嚴格集合規定與無退款聲明：</h4>
                          <p className="text-gray-600 pl-4">因入藏函團進團出之規範，指定集合時地嚴格執行。若因個人遲到錯過集合送機，導致無法通過查驗入藏，<strong className="text-red-700">屬個人責任無任何補救措施，且無法要求任何退款或補償。</strong></p>
                        </div>

                        <div className="bg-white p-4 rounded border border-red-100 shadow-sm">
                          <h4 className="font-bold text-gray-900 mb-1"><span className="text-[#8A1C14]">3.</span> 高齡旅客健康檢查規定：</h4>
                          <p className="text-gray-600 pl-4">報名西藏行程滿<strong className="text-gray-900">64歲以上者</strong>，為高原安全<strong className="text-red-700">須於出發前三個月完成簡易健康檢查</strong>（血壓、脈搏、心跳等基礎數值）。</p>
                        </div>

                        <div className="bg-white p-4 rounded border border-red-100 shadow-sm">
                          <h4 className="font-bold text-gray-900 mb-1"><span className="text-[#8A1C14]">4.</span> 入藏證件繳交規範：</h4>
                          <p className="text-gray-600 pl-4">為辦理入藏函，旅客<strong className="text-red-700">須於出發前三個月</strong>提供效期合格之護照與清晰台胞證正反面圖檔，以免延誤核批。</p>
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
                          />
                          <span className="ml-3 text-sm font-semibold text-gray-900 leading-relaxed group-hover:text-[#8A1C14] transition-colors">
                            本人已逐項審閱、充分知悉並同意遵守上述【西藏入藏專屬特殊規範】全部 4 項規定與法律責任。
                          </span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* 自駕切結 */}
                  {isDrivingTour && (
                    <div className="bg-amber-50/50 p-6 rounded-lg border border-amber-200">
                      <div className="flex items-center justify-between mb-4 border-b border-amber-200 pb-3">
                        <h3 className="text-lg font-bold text-amber-900">🚗【中國自駕行程切結書】</h3>
                        <span className="bg-amber-600 text-white text-xs px-2.5 py-1 rounded font-medium">自駕行程專屬</span>
                      </div>

                      <div className="space-y-4 text-sm text-gray-700 leading-relaxed mb-6">
                        <div className="bg-white p-4 rounded border border-amber-100 shadow-sm">
                          <h4 className="font-bold text-gray-900 mb-1"><span className="text-amber-700">1.</span> 駕駛資格與證件：</h4>
                          <p className="text-gray-600 pl-4">駕駛者確認具備有效合格駕照與豐富駕駛經驗，配合辦理臨時駕照手續。若資格不符相關損失由本人承擔。</p>
                        </div>

                        <div className="bg-white p-4 rounded border border-amber-100 shadow-sm">
                          <h4 className="font-bold text-gray-900 mb-1"><span className="text-amber-700">2.</span> 車輛損害與違規責任：</h4>
                          <p className="text-gray-600 pl-4">自駕期間若因個人過失或違規致車損、人員傷亡或違規罰鍰，<strong className="text-red-700">由本人承擔所有法責、罰金及車輛維修營業損失。</strong></p>
                        </div>

                        <div className="bg-white p-4 rounded border border-amber-100 shadow-sm">
                          <h4 className="font-bold text-gray-900 mb-1"><span className="text-amber-700">3.</span> 車隊紀律與安全：</h4>
                          <p className="text-gray-600 pl-4">嚴格服從車隊指揮，<strong className="text-red-700">嚴禁危險駕駛或酒駕</strong>。違規情節重大主辦方有權立即終止駕駛權利且不退費。</p>
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
                  disabled={isSubmitting}
                  className="w-full py-4 px-4 text-xl font-bold rounded-lg text-white transition-all shadow-md bg-[#8A1C14] hover:bg-[#9c221a] hover:shadow-lg disabled:bg-gray-400 cursor-pointer"
                >
                  {isSubmitting ? '報名資料上傳中，請稍候...' : '確認條款並送出報名'}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
