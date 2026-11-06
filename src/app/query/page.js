"use client";

import { useState } from "react";
import Link from "next/link";

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

    // 自動去除前後空白，並將身分證轉為大寫
    const cleanName = searchData.name.trim();
    const cleanId = searchData.idNumber.trim().toUpperCase();

    try {
      // 方案 A：直接使用 SheetDB 精確搜尋 (附帶 encodeURIComponent 避免中文亂碼)
      const queryUrl = `https://sheetdb.io/api/v1/6xxfvdvjl1t6l/search?sheet=Registration&${encodeURIComponent("中文姓名")}=${encodeURIComponent(cleanName)}&${encodeURIComponent("身分證_護照號碼")}=${encodeURIComponent(cleanId)}`;
      let response = await fetch(queryUrl);
      let data = await response.json();

      // 方案 B 備用容錯：若精準搜尋未命中，抓取全表在前端進行不分大小寫比對
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
        setOrderList(data.reverse()); // 最新訂單排在最上方
      } else {
        setErrorMsg("查無報名資料。請確認 Google 試算表內是否已有該筆資料，或檢查姓名與身分證是否相符。");
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
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center text-[#8A1C14] hover:underline mb-6 text-sm font-semibold">
          ← 返回首頁
        </Link>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden border-t-8 border-[#5c6b73]">
          <div className="p-6 sm:p-8">
            <div className="text-center mb-8 border-b border-gray-200 pb-8">
              <h1 className="text-3xl font-bold text-gray-900">客戶查詢系統</h1>
              <p className="mt-2 text-gray-600">請輸入報名時填寫的資料以查詢訂單進度</p>
            </div>

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
                            出團檔期：<span className="font-medium text-gray-800">{order["出團檔期"]}</span> ｜ 狀態：<span className="font-bold text-orange-700">{order["訂單狀態"]}</span>
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
                          查看明細與繳費 →
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {selectedOrder && (
              <div>
                <button 
                  onClick={() => setSelectedOrder(null)} 
                  className="text-sm text-gray-500 hover:text-gray-900 mb-4 flex items-center gap-1 font-medium"
                >
                  ← 返回訂單清單
                </button>
                
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-4 gap-2">
                    <h3 className="text-xl font-bold text-[#8A1C14]">{selectedOrder["行程名稱"]}</h3>
                    <span className="bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full border border-orange-200">
                      狀態：{selectedOrder["訂單狀態"]}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 text-sm">
                    <div><span className="text-gray-500 block text-xs">訂單編號</span><span className="font-mono font-bold text-gray-900">{selectedOrder["訂單編號"]}</span></div>
                    <div><span className="text-gray-500 block text-xs">報名時間</span>{selectedOrder["報名時間"]}</div>
                    <div><span className="text-gray-500 block text-xs">出團檔期</span><span className="font-medium text-gray-900">{selectedOrder["出團檔期"]}</span></div>
                    <div><span className="text-gray-500 block text-xs">應付訂金</span><span className="text-[#8A1C14] font-bold text-base">NT$ {selectedOrder["應付訂金"]}</span></div>
                  </div>

                  {/* 繳費操作區 */}
                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-3">
                    <h4 className="font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                      <span>付款處理</span>
                      <span className="text-xs font-normal text-gray-500">（選擇方式：{selectedOrder["支付方式"]}）</span>
                    </h4>
                    
                    {selectedOrder["支付方式"] === "匯款" && (!selectedOrder["客戶匯款後五碼"]) ? (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600">完成銀行轉帳後，請在此回填您的帳號後五碼以利對帳：</p>
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
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
