"use client";

import { useState } from "react";
import Link from "next/link";

export default function QueryForm() {
  const [searchData, setSearchData] = useState({ name: "", idNumber: "" });
  const [isSearching, setIsSearching] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // 回填後五碼的狀態管理
  const [last5Digits, setLast5Digits] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const handleSearchChange = (e) => {
    setSearchData({ ...searchData, [e.target.name]: e.target.value });
  };

  // 1. 查詢訂單 (GET 請求)
  const handleSearch = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    setErrorMsg("");
    setOrderResult(null);
    setUpdateSuccess(false);

    try {
      // 呼叫 SheetDB 的 Search API
      const response = await fetch(
        `https://sheetdb.io/api/v1/6xxfvdvjl1t6l/search?sheet=Registration&中文姓名=${searchData.name}&身分證_護照號碼=${searchData.idNumber}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        // 取最新的一筆訂單顯示
        setOrderResult(data[data.length - 1]);
      } else {
        setErrorMsg("查無報名資料，請確認姓名與身分證字號是否輸入正確。");
      }
    } catch (error) {
      console.error("查詢失敗:", error);
      setErrorMsg("系統連線發生錯誤，請稍後再試。");
    } finally {
      setIsSearching(false);
    }
  };

  // 2. 回填匯款後五碼 (PATCH 更新請求)
  const handleUpdateTransfer = async () => {
    if (!last5Digits || last5Digits.length < 5) {
      alert("請輸入完整的帳號後五碼！");
      return;
    }
    setIsUpdating(true);

    // 準備更新的資料 (更新狀態與後五碼)
    const payload = {
      data: {
        "客戶匯款後五碼": last5Digits,
        "訂單狀態": "已匯款等候確認"
      }
    };

    try {
      // SheetDB 支援指定欄位更新： /欄位名稱/欄位值
      const updateUrl = `https://sheetdb.io/api/v1/6xxfvdvjl1t6l/訂單編號/${orderResult["訂單編號"]}?sheet=Registration`;
      
      const response = await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      
      if (result.updated) {
        setUpdateSuccess(true);
        // 更新畫面上的狀態顯示
        setOrderResult({
          ...orderResult,
          "客戶匯款後五碼": last5Digits,
          "訂單狀態": "已匯款等候確認"
        });
      }
    } catch (error) {
      console.error("更新失敗:", error);
      alert("更新失敗，請稍後再試。");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center text-[#8A1C14] hover:underline mb-6">
          ← 返回首頁
        </Link>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden border-t-8 border-[#5c6b73]">
          <div className="p-8">
            <div className="text-center mb-8 border-b border-gray-200 pb-8">
              <h1 className="text-3xl font-bold text-gray-900">客戶查詢系統</h1>
              <p className="mt-2 text-gray-600">請輸入報名時填寫的資料以查詢訂單狀態</p>
            </div>

            {/* 查詢表單區塊 */}
            <form onSubmit={handleSearch} className="mb-10">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">中文姓名</label>
                  <input type="text" name="name" value={searchData.name} onChange={handleSearchChange} className="w-full rounded border-gray-300 border p-3 focus:ring-[#5c6b73]" placeholder="請輸入姓名" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">身分證/護照號碼</label>
                  <input type="text" name="idNumber" value={searchData.idNumber} onChange={handleSearchChange} className="w-full rounded border-gray-300 border p-3 focus:ring-[#5c6b73]" placeholder="請輸入證號" required />
                </div>
              </div>
              <div className="mt-6 text-center">
                <button 
                  type="submit" 
                  disabled={isSearching}
                  className="bg-[#5c6b73] text-white px-10 py-3 rounded-lg font-bold hover:bg-[#4a565d] transition-colors disabled:bg-gray-400"
                >
                  {isSearching ? '搜尋中...' : '查詢訂單'}
                </button>
              </div>
            </form>

            {/* 錯誤訊息 */}
            {errorMsg && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center mb-6 border border-red-200">
                {errorMsg}
              </div>
            )}

            {/* 查詢結果區塊 */}
            {orderResult && (
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 animate-fade-in-up">
                <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-4">
                  <h3 className="text-xl font-bold text-[#8A1C14]">訂單資訊</h3>
                  <span className="bg-orange-100 text-orange-800 text-sm font-bold px-3 py-1 rounded-full">
                    狀態：{orderResult["訂單狀態"]}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 mb-6">
                  <p><span className="text-gray-500 block text-xs">訂單編號</span><span className="font-mono font-medium">{orderResult["訂單編號"]}</span></p>
                  <p><span className="text-gray-500 block text-xs">報名時間</span>{orderResult["報名時間"]}</p>
                  <p className="sm:col-span-2"><span className="text-gray-500 block text-xs">報名行程</span>{orderResult["行程名稱"]}</p>
                  <p><span className="text-gray-500 block text-xs">出團檔期</span>{orderResult["出團檔期"]}</p>
                  <p><span className="text-gray-500 block text-xs">應付訂金</span><span className="text-[#8A1C14] font-bold">NT$ {orderResult["應付訂金"]}</span></p>
                </div>

                {/* 動態操作區塊：依據支付方式與狀態呈現不同介面 */}
                <div className="bg-white p-5 rounded border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-3">繳費操作區 ({orderResult["支付方式"]})</h4>
                  
                  {/* 情境 1：選擇匯款，且尚未填寫後五碼 */}
                  {orderResult["支付方式"] === "匯款" && (!orderResult["客戶匯款後五碼"] || orderResult["客戶匯款後五碼"] === "") ? (
                    <div>
                      <p className="text-sm text-gray-600 mb-3">請於完成匯款後，於下方回填您的帳號後五碼，以便財務人員對帳。</p>
                      <div className="flex gap-3">
                        <input 
                          type="text" 
                          maxLength="5" 
                          placeholder="請輸入後五碼" 
                          value={last5Digits}
                          onChange={(e) => setLast5Digits(e.target.value)}
                          className="border border-gray-300 rounded p-2 flex-grow focus:ring-[#8A1C14]"
                        />
                        <button 
                          onClick={handleUpdateTransfer}
                          disabled={isUpdating}
                          className="bg-[#8A1C14] text-white px-4 py-2 rounded hover:bg-[#9c221a] disabled:bg-gray-400"
                        >
                          {isUpdating ? '送出中...' : '送出對帳'}
                        </button>
                      </div>
                      {updateSuccess && <p className="text-green-600 text-sm mt-2">✅ 已成功送出後五碼！</p>}
                    </div>
                  ) : 
                  
                  /* 情境 2：選擇匯款，已經填寫後五碼 */
                  orderResult["支付方式"] === "匯款" && orderResult["客戶匯款後五碼"] ? (
                    <div className="text-green-700 bg-green-50 p-3 rounded">
                      您已回填匯款後五碼：<strong className="font-mono">{orderResult["客戶匯款後五碼"]}</strong>。請靜候財務人員確認。
                    </div>
                  ) : 
                  
                  /* 情境 3：選擇刷卡，且後台已貼上刷卡連結 */
                  orderResult["支付方式"] === "刷卡" && orderResult["刷卡連結"] ? (
                    <div>
                      <p className="text-sm text-gray-600 mb-3">業務專員已為您建立專屬刷卡連結，請點擊下方按鈕前往支付訂金。</p>
                      <a 
                        href={orderResult["刷卡連結"]} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block bg-[#F59E0B] text-white px-6 py-2 rounded font-bold hover:bg-[#d97706] transition-colors"
                      >
                        前往信用卡支付頁面 →
                      </a>
                    </div>
                  ) : 
                  
                  /* 情境 4：選擇刷卡，但後台還沒貼連結 */
                  orderResult["支付方式"] === "刷卡" && !orderResult["刷卡連結"] ? (
                    <div className="text-orange-700 bg-orange-50 p-3 rounded">
                      專員正在為您建立刷卡連結，請稍後再回來查詢，或留意您的 Email/LINE 通知。
                    </div>
                  ) : null}

                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
