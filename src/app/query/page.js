"use client";

import { useState } from "react";
import Link from "next/link";

// 檔期代碼與出發日期對照表
const scheduleDateMap = {
  // 西藏系列
  "TE1": "03/19-03/30", "TE2": "04/02-04/13", "TE3": "10/22-11/02", "TE4": "11/05-11/16",
  "TB1": "04/02-04/13", "TB2": "04/23-05/04", "TB3": "06/04-06/15", "TB4": "07/09-07/20",
  "TB5": "08/13-08/24", "TB6": "09/10-09/21", "TB7": "09/24-10/05", "TB8": "10/08-10/19", "TB9": "10/22-11/02",
  "TK1": "06/04-06/15", "TK2": "09/10-09/21",
  // 新疆系列
  "XS1": "04/02-04/11", "XS2": "10/22-10/31",
  // 中國自駕系列
  "TC318-1": "04/14-04/26", "TC318-2": "10/13-10/25",
  "TC1": "04/23-05/02", "TC2": "10/22-10/31",
  "XSD1": "04/02-04/11", "XSD2": "10/22-10/31",
  // 埃及系列
  "EG1": "2026/12/04-12/15", "EG2": "2027/01/22-02/02", "EG3": "2027/02/26-03/09", 
  "EG4": "2027/04/02-04/13", "EG5": "2027/04/30-05/11"
};

// 格式化顯示「團號 + 出發日期」
const formatSchedule = (code) => {
  if (!code) return "未指定";
  const cleanCode = code.toString().trim();
  const dateStr = scheduleDateMap[cleanCode];
  return dateStr ? `${cleanCode}（${dateStr}）` : cleanCode;
};

export default function QueryForm() {
  const [searchData, setSearchData] = useState({ name: "", idNumber: "" });
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [orderList, setOrderList] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [last5Digits, setLast5Digits] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const handleSearchChange = (e) => {
    setSearchData({ ...searchData, [e.target.name]: e.target.value });
  };

  // 高容錯智慧查詢
  const handleSearch = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    setErrorMsg("");
    setOrderList([]);
    setSelectedOrder(null);
    setUpdateSuccess(false);

    const cleanName = searchData.name.trim();
    const cleanId = searchData.idNumber.trim().toUpperCase();

    try {
      // 方案 A：精確搜尋 (含 URL 編碼)
      const queryUrl = `https://sheetdb.io/api/v1/6xxfvdvjl1t6l/search?sheet=Registration&${encodeURIComponent("中文姓名")}=${encodeURIComponent(cleanName)}&${encodeURIComponent("身分證_護照號碼")}=${encodeURIComponent(cleanId)}`;
      let response = await fetch(queryUrl);
      let data = await response.json();

      // 方案 B 備用容錯：若精準搜尋未命中，抓取全表在前端比對
      if (!data || data.length === 0 || data.error) {
        const fallbackRes = await fetch(`https://sheetdb.io/api/v1/6xxfvdvjl1t6l?sheet=Registration`);
        const allRows = await fallbackRes.json();
        
        if (Array.isArray(allRows)) {
          data = allRows.filter(row => {
            const rowName = (row["中文姓名"] || "").toString().trim();
            const rowId = (row["身分證_護照號碼"] || "").toString().trim().toUpperCase();
            return rowName === cleanName && rowId === cleanId;
          });
        }
      }

      if (data && data.length > 0) {
        setOrderList(data.reverse());
      } else {
        setErrorMsg("查無報名資料。請確認 Google 試算表內是否已有該筆資料，或檢查姓名與身分證是否輸入正確。");
      }
    } catch (error) {
      console.error("查詢失敗:", error);
      setErrorMsg("系統連線發生錯誤，請稍後再試。");
    } finally {
      setIsSearching(false);
    }
  };

  // 回填匯款後五碼
  const handleUpdateTransfer = async () => {
    if (!last5Digits || last5Digits.trim().length < 5) {
      alert("請輸入完整的帳號後五碼！");
      return;
    }
    setIsUpdating(true);

    const payload = {
      data: {
        "客戶匯款後五碼": last5Digits.trim(),
        "訂單狀態": "已匯款等候確認"
      }
    };

    try {
      const updateUrl = `https://sheetdb.io/api/v1/6xxfvdvjl1t6l/訂單編號/${encodeURIComponent(selectedOrder["訂單編號"])}?sheet=Registration`;
      
      const response = await fetch(updateUrl, {
        method: 'PATCH',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      
      if (result.updated || result.rows) {
        setUpdateSuccess(true);
        setSelectedOrder(prev => ({
          ...prev,
          "客戶匯款後五碼": last5Digits.trim(),
          "訂單狀態": "已匯款等候確認"
        }));
        setOrderList(prevList => prevList.map(order => 
          order["訂單編號"] === selectedOrder["訂單編號"] 
            ? { ...order, "客戶匯款後五碼": last5Digits.trim(), "訂單狀態": "已匯款等候確認" } 
            : order
        ));
      } else {
        alert("更新未成功，請確認試算表寫入權限。");
      }
    } catch (error) {
      console.error("更新失敗:", error);
      alert("更新失敗，請檢查網路連線。");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center text-[#8A1C14] hover:underline mb-6 text-sm font-semibold">
          ← 返回首頁
        </Link>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden border-t-8 border-[#5c6b73]">
          <div className="p-6 sm:p-10">
            <div className="text-center mb-8 border-b border-gray-200 pb-8">
              <h1 className="text-3xl font-bold text-gray-900">客戶查詢系統</h1>
              <p className="mt-2 text-gray-600">請輸入報名時填寫的姓名與證號以核對訂單資料</p>
            </div>

            {/* 搜尋表單 */}
            {!selectedOrder && (
              <>
                <form onSubmit={handleSearch} className="mb-10">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">中文姓名</label>
                      <input 
                        type="text" 
                        name="name" 
                        value={searchData.name} 
                        onChange={handleSearchChange} 
                        className="w-full rounded border-gray-300 border p-3 focus:ring-[#5c6b73] focus:border-[#5c6b73]" 
                        placeholder="例：王小明" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">身分證/護照號碼</label>
                      <input 
                        type="text" 
                        name="idNumber" 
                        value={searchData.idNumber} 
                        onChange={handleSearchChange} 
                        className="w-full rounded border-gray-300 border p-3 focus:ring-[#5c6b73] focus:border-[#5c6b73]" 
                        placeholder="例：A123456789 (不分大小寫)" 
                        required 
                      />
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <button 
                      type="submit" 
                      disabled={isSearching} 
                      className="bg-[#5c6b73] hover:bg-[#4a565d] text-white px-10 py-3 rounded-lg font-bold transition-colors disabled:bg-gray-400 shadow-sm"
                    >
                      {isSearching ? '查詢中，請稍候...' : '查詢訂單'}
                    </button>
                  </div>
                </form>

                {errorMsg && (
                  <div className="bg-red-50 text-red-700 p-4 rounded-lg text-center mb-6 border border-red-200 text-sm">
                    {errorMsg}
                  </div>
                )}

                {/* 訂單列表卡片區 */}
                {orderList.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-gray-800 mb-3 border-b pb-2">
                      查詢到 {orderList.length} 筆符合的報名紀錄：
                    </h3>
                    {orderList.map((order) => (
                      <div 
                        key={order["訂單編號"]} 
                        className="bg-gray-50 border border-gray-200 rounded-lg p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:shadow-md transition-shadow gap-4"
                      >
                        <div>
                          <span className="text-xs text-gray-500 font-mono block mb-1">訂單編號：{order["訂單編號"]}</span>
                          <h4 className="font-bold text-[#8A1C14] text-lg">{order["行程名稱"]}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            出團檔期：<span className="font-semibold text-gray-900">{formatSchedule(order["出團檔期"])}</span> ｜ 狀態：<span className="font-bold text-orange-700">{order["訂單狀態"]}</span>
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            setSelectedOrder(order);
                            setUpdateSuccess(false);
                            setLast5Digits("");
                          }}
                          className="bg-white border border-[#5c6b73] text-[#5c6b73] px-5 py-2.5 rounded-lg hover:bg-[#5c6b73] hover:text-white transition-colors text-sm font-bold whitespace-nowrap shadow-sm"
                        >
                          查看完整明細與繳費 →
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* 完整詳細明細頁面 */}
            {selectedOrder && (
              <div className="space-y-6">
                <button 
                  onClick={() => setSelectedOrder(null)} 
                  className="text-sm text-gray-500 hover:text-gray-900 mb-2 flex items-center gap-1 font-medium"
                >
                  ← 返回訂單清單
                </button>
                
                {/* 1. 訂單狀態標頭 */}
                <div className="bg-gradient-to-r from-stone-50 to-orange-50/40 rounded-xl border border-stone-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-xs font-mono text-gray-500 block mb-1">訂單編號：{selectedOrder["訂單編號"]}</span>
                    <h2 className="text-2xl font-bold text-[#8A1C14]">{selectedOrder["行程名稱"]}</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      出團檔期：<strong className="text-gray-900 font-semibold">{formatSchedule(selectedOrder["出團檔期"])}</strong>
                      {selectedOrder["天數"] && <span> ｜ 行程天數：<strong className="text-gray-900">{selectedOrder["天數"]}</strong></span>}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-start sm:items-end">
                    <span className="text-xs text-gray-400 mb-1">報名時間：{selectedOrder["報名時間"]}</span>
                    <span className="bg-orange-100 text-orange-900 text-sm font-bold px-4 py-1.5 rounded-full border border-orange-200">
                      狀態：{selectedOrder["訂單狀態"]}
                    </span>
                  </div>
                </div>

                {/* 2. 旅客完整報名資料核對卡 */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                      <span className="text-[#8A1C14]">●</span> 旅客基本證件資料
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div className="bg-gray-50 p-3 rounded">
                        <span className="text-gray-500 text-xs block">中文姓名</span>
                        <span className="font-semibold text-gray-900 text-base">{selectedOrder["中文姓名"]}</span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <span className="text-gray-500 text-xs block">性別 / 國籍</span>
                        <span className="font-medium text-gray-900">{selectedOrder["性別"]} / {selectedOrder["國籍"]}</span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <span className="text-gray-500 text-xs block">出生年月日</span>
                        <span className="font-mono text-gray-900">{selectedOrder["出生年月日"]}</span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <span className="text-gray-500 text-xs block">身分證/護照號碼</span>
                        <span className="font-mono font-semibold text-gray-900">{selectedOrder["身分證_護照號碼"]}</span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <span className="text-gray-500 text-xs block">聯絡手機</span>
                        <span className="font-mono text-gray-900">{selectedOrder["手機號碼"]}</span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded sm:col-span-2">
                        <span className="text-gray-500 text-xs block">電子信箱 Email</span>
                        <span className="text-gray-900 break-all">{selectedOrder["Email"]}</span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <span className="text-gray-500 text-xs block">LINE 名稱/ID</span>
                        <span className="text-gray-900">{selectedOrder["LINE名稱_ID"] || "未提供"}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                      <span className="text-[#8A1C14]">●</span> 餐飲與住宿安排需求
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div className="bg-gray-50 p-3 rounded">
                        <span className="text-gray-500 text-xs block">飲食習慣</span>
                        <span className="font-medium text-gray-900">
                          {selectedOrder["飲食習慣"]}
                          {selectedOrder["飲食備註"] ? ` (${selectedOrder["飲食備註"]})` : ''}
                        </span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded sm:col-span-2">
                        <span className="text-gray-500 text-xs block">住宿房型安排</span>
                        <span className="font-medium text-gray-900">{selectedOrder["住宿安排"]}</span>
                      </div>
                      {selectedOrder["其他需求"] && (
                        <div className="bg-gray-50 p-3 rounded sm:col-span-3">
                          <span className="text-gray-500 text-xs block">其他需求或留言</span>
                          <span className="text-gray-700">{selectedOrder["其他需求"]}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {(selectedOrder["自駕分組"] || selectedOrder["自駕角色_配置"]) && (
                    <div>
                      <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                        <span className="text-amber-700">●</span> 車輛與自駕分組配置
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div className="bg-amber-50/50 p-3 rounded border border-amber-100">
                          <span className="text-amber-800 text-xs block">自駕分組</span>
                          <span className="font-semibold text-gray-900">{selectedOrder["自駕分組"]}</span>
                        </div>
                        <div className="bg-amber-50/50 p-3 rounded border border-amber-100">
                          <span className="text-amber-800 text-xs block">車輛/角色配置</span>
                          <span className="font-medium text-gray-900">{selectedOrder["自駕角色_配置"]}</span>
                        </div>
                        {selectedOrder["重機車種"] && (
                          <div className="bg-amber-50/50 p-3 rounded border border-amber-100">
                            <span className="text-amber-800 text-xs block">重機車種</span>
                            <span className="font-medium text-gray-900">{selectedOrder["重機車種"]}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedOrder["是否開立統編"] === "是" && (
                    <div>
                      <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                        <span className="text-gray-700">●</span> 代轉收據開立資訊
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-gray-50 p-3 rounded">
                        <div>
                          <span className="text-gray-500 text-xs block">公司抬頭</span>
                          <span className="font-medium text-gray-900">{selectedOrder["公司抬頭"]}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs block">統一編號</span>
                          <span className="font-mono font-bold text-gray-900">{selectedOrder["統一編號"]}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. 重要備註提示框 */}
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 sm:p-5 rounded-r-xl shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="text-amber-600 text-xl leading-none">⚠️</span>
                    <div className="text-xs sm:text-sm text-amber-900 leading-relaxed space-y-1">
                      <p className="font-bold text-amber-950 text-sm sm:text-base">
                        資料核對與修正重要提醒：
                      </p>
                      <p>
                        為確保<strong>入藏函申請、團隊機票與邊防通行證</strong>順利出證，上述旅客之「中文姓名」、「身分證/護照號碼」及「出生年月日」必須與實際證件完全相符。
                      </p>
                      <p className="font-medium text-red-800">
                        ※ 若發現資料填寫錯誤或行程需求需要變更，基於航管與保險法規，系統不開放旅客自行線上修改。請儘速聯絡您的<strong>專屬旅遊業務專員</strong>或撥打客服，由專員為您進行人工覆核與更正。
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. 繳費與對帳操作區 */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b pb-3">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                      <span>付款處理</span>
                      <span className="text-xs font-normal text-gray-500">（選擇方式：{selectedOrder["支付方式"]}）</span>
                    </h4>
                    <span className="text-sm font-semibold text-[#8A1C14]">應付訂金：NT$ {selectedOrder["應付訂金"]}</span>
                  </div>
                  
                  {selectedOrder["支付方式"] === "匯款" && (!selectedOrder["客戶匯款後五碼"]) ? (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        您選擇以銀行匯款支付。完成轉帳後，請在此回填您的帳號後五碼以利財務人員對帳：
                      </p>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          maxLength="5" 
                          placeholder="請輸入帳號後五碼" 
                          value={last5Digits}
                          onChange={(e) => setLast5Digits(e.target.value)}
                          className="border border-gray-300 rounded-lg p-2.5 flex-grow focus:ring-[#8A1C14] font-mono"
                        />
                        <button 
                          onClick={handleUpdateTransfer} 
                          disabled={isUpdating} 
                          className="bg-[#8A1C14] hover:bg-[#9c221a] text-white px-5 py-2.5 rounded-lg font-bold text-sm disabled:bg-gray-400 whitespace-nowrap transition-colors"
                        >
                          {isUpdating ? '傳送中...' : '送出對帳'}
                        </button>
                      </div>
                      {updateSuccess && <p className="text-green-600 text-sm font-semibold">✓ 已成功送出後五碼，請靜候專員審核！</p>}
                    </div>
                  ) : selectedOrder["支付方式"] === "匯款" && selectedOrder["客戶匯款後五碼"] ? (
                    <div className="text-green-800 bg-green-50 p-4 rounded-lg border border-green-200 text-sm">
                      ✓ 已回填匯款後五碼：<strong className="font-mono text-base">{selectedOrder["客戶匯款後五碼"]}</strong>。財務專員將於核對後為您確認訂金。
                    </div>
                  ) : selectedOrder["支付方式"] === "刷卡" && selectedOrder["刷卡連結"] ? (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">專員已生成專屬刷卡付款連結，請點擊下方按鈕前往結帳：</p>
                      <a 
                        href={selectedOrder["刷卡連結"]} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-block bg-[#F59E0B] hover:bg-[#d97706] text-black px-6 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm"
                      >
                        前往信用卡線上付款 →
                      </a>
                    </div>
                  ) : (
                    <div className="text-amber-800 bg-amber-50 p-4 rounded-lg border border-amber-200 text-sm">
                      專員正在為您建立專屬刷卡連結，請稍後再次查詢，或留意您的 Email / LINE 通知。
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
