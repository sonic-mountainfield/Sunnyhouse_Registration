"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import emailjs from '@emailjs/browser';

// EmailJS 設定值常數
const EMAILJS_SERVICE_ID = "service_wu8dua2";
const EMAILJS_PUBLIC_KEY = "gAivgFufM8L44AAow";
const TEMPLATE_B_CREDITCARD = "template_dgejm0a";
const TEMPLATE_C_CONFIRM = "template_cb6oean";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // 篩選與狀態管理
  const [selectedTour, setSelectedTour] = useState("全部行程");
  const [updatingId, setUpdatingId] = useState(null);

  // 刷卡彈跳視窗狀態管理
  const [showCardModal, setShowCardModal] = useState(false);
  const [selectedOrderForCard, setSelectedOrderForCard] = useState(null);
  const [cardLink, setCardLink] = useState("");
  const [cardExpire, setCardExpire] = useState("");

  // 登入驗證
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "sunny2026") {
      setIsAuthenticated(true);
      fetchOrders();
    } else {
      alert("密碼錯誤！");
    }
  };

  // 取得所有報名資料
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://sheetdb.io/api/v1/6xxfvdvjl1t6l?sheet=Registration');
      const data = await response.json();
      setOrders(data.reverse()); // 最新報名在最上面
    } catch (error) {
      console.error("載入失敗:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 動態產生行程篩選清單
  const uniqueTours = useMemo(() => {
    const tours = orders.map(o => o["行程名稱"]).filter(Boolean);
    return ["全部行程", ...new Set(tours)];
  }, [orders]);

  // 根據篩選條件過濾訂單
  const filteredOrders = useMemo(() => {
    if (selectedTour === "全部行程") return orders;
    return orders.filter(o => o["行程名稱"] === selectedTour);
  }, [orders, selectedTour]);

  // 更新單一欄位寫回 SheetDB 的通用函式
  const updateSheetDB = async (orderId, updateData) => {
    const updateUrl = `https://sheetdb.io/api/v1/6xxfvdvjl1t6l/訂單編號/${orderId}?sheet=Registration`;
    const response = await fetch(updateUrl, {
      method: 'PATCH',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: updateData })
    });
    return await response.json();
  };

  // 處理一般下拉選單狀態變更
  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const result = await updateSheetDB(orderId, { "訂單狀態": newStatus });
      if (result.updated) {
        setOrders(prev => prev.map(o => o["訂單編號"] === orderId ? { ...o, "訂單狀態": newStatus } : o));
      }
    } catch (error) {
      console.error("狀態更新失敗:", error);
      alert("狀態更新失敗，請檢查網路連線。");
    } finally {
      setUpdatingId(null);
    }
  };

  // 處理發送正式確認信 (Template C)
  const handleSendConfirmEmail = async (order) => {
    if (!confirm(`確定要發送「正式報名確認信」給 ${order["中文姓名"]} (${order["Email"]}) 嗎？`)) return;
    
    setUpdatingId(order["訂單編號"]);
    try {
      // 1. 寄出 EmailJS 信件
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        TEMPLATE_C_CONFIRM,
        {
          to_name: order["中文姓名"],
          to_email: order["Email"],
          order_id: order["訂單編號"],
          tour_name: order["行程名稱"],
          schedule_date: order["出團檔期"],
          payment_method: order["支付方式"],
          query_url: window.location.origin + "/query" // 自動取得當前網址
        },
        { publicKey: EMAILJS_PUBLIC_KEY }
      );

      // 2. 信件寄出成功後，更新 SheetDB 狀態
      const newStatus = "已發送確認信";
      const result = await updateSheetDB(order["訂單編號"], { "訂單狀態": newStatus });
      
      if (result.updated) {
        setOrders(prev => prev.map(o => o["訂單編號"] === order["訂單編號"] ? { ...o, "訂單狀態": newStatus } : o));
        alert("報名確認信已成功寄出！狀態已更新。");
      }
    } catch (error) {
      console.error("發送確認信失敗:", error);
      alert("發送信件失敗，請稍後再試。");
    } finally {
      setUpdatingId(null);
    }
  };

  // 打開綁定刷卡連結的 Modal
  const openCardModal = (order) => {
    setSelectedOrderForCard(order);
    setCardLink(order["刷卡連結"] || "");
    setCardExpire(order["刷卡有效期限"] || "");
    setShowCardModal(true);
  };

  // 儲存刷卡連結並寄信 (Template B)
  const handleSaveCardLink = async (e) => {
    e.preventDefault();
    if (!cardLink || !cardExpire) {
      alert("請完整輸入刷卡連結與有效期限");
      return;
    }

    const orderId = selectedOrderForCard["訂單編號"];
    setUpdatingId(orderId);
    setShowCardModal(false);

    try {
      const newStatus = "已發送刷卡連結";
      // 1. 更新 SheetDB (寫入連結、期限、狀態)
      const result = await updateSheetDB(orderId, {
        "刷卡連結": cardLink,
        "刷卡有效期限": cardExpire,
        "訂單狀態": newStatus
      });

      if (result.updated) {
        // 2. 寄出 Template B 刷卡通知信
        await emailjs.send(
          EMAILJS_SERVICE_ID,
          TEMPLATE_B_CREDITCARD,
          {
            to_name: selectedOrderForCard["中文姓名"],
            to_email: selectedOrderForCard["Email"],
            order_id: orderId,
            tour_name: selectedOrderForCard["行程名稱"],
            schedule_date: selectedOrderForCard["出團檔期"],
            payment_link: cardLink,
            expire_date: cardExpire,
            query_url: window.location.origin + "/query"
          },
          { publicKey: EMAILJS_PUBLIC_KEY }
        );

        // 3. 更新本地 UI
        setOrders(prev => prev.map(o => o["訂單編號"] === orderId ? { ...o, "訂單狀態": newStatus, "刷卡連結": cardLink, "刷卡有效期限": cardExpire } : o));
        alert("刷卡連結已儲存，並成功寄出刷卡通知信！");
      }
    } catch (error) {
      console.error("處理刷卡連結失敗:", error);
      alert("處理失敗，請稍後再試。");
    } finally {
      setUpdatingId(null);
      setSelectedOrderForCard(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-sm w-full">
          <h2 className="text-2xl font-bold text-center mb-6 text-[#8A1C14]">陽光小屋 - 業務管理系統</h2>
          <form onSubmit={handleLogin}>
            <input 
              type="password" placeholder="請輸入管理員密碼" value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-3 rounded mb-4 focus:ring-[#8A1C14]" required
            />
            <button type="submit" className="w-full bg-[#8A1C14] text-white py-3 rounded font-bold hover:bg-[#9c221a]">登入系統</button>
          </form>
          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:underline">返回客戶首頁</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7f9] p-4 sm:p-6 font-sans">
      <div className="max-w-[1400px] mx-auto relative">
        
        {/* 頂部導航列 */}
        <div className="flex justify-between items-center mb-6 border-b border-gray-300 pb-2">
          <div className="flex gap-2">
            <div className="bg-white text-gray-600 px-6 py-2 rounded-t-lg font-bold border border-b-0 border-gray-300">隊員報名查詢</div>
            <div className="bg-[#2c3e50] text-white px-6 py-2 rounded-t-lg font-bold">管理員後台</div>
          </div>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
            ← 返回客戶首頁
          </Link>
        </div>

        {/* 報名名單總覽標頭與篩選器 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              報名名單總覽
              {isLoading && <span className="text-sm font-normal text-blue-500 animate-pulse">資料同步中...</span>}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              目前篩選行程共 <span className="font-bold text-green-600">{filteredOrders.length}</span> / {orders.length} 筆資料
            </p>
          </div>
          
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <label className="text-sm text-gray-600">行程篩選：</label>
            <select 
              value={selectedTour} 
              onChange={(e) => setSelectedTour(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-[#2c3e50]"
            >
              {uniqueTours.map(tour => (
                <option key={tour} value={tour}>{tour}</option>
              ))}
            </select>
            <button onClick={fetchOrders} className="bg-white border border-gray-300 text-gray-700 px-4 py-1.5 rounded text-sm hover:bg-gray-50 flex items-center gap-1 shadow-sm">
              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              重新整理
            </button>
          </div>
        </div>

        {/* 資料列表區 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
                <th className="p-4 font-semibold w-48">編號 / 時間</th>
                <th className="p-4 font-semibold w-32">姓名 / 證號</th>
                <th className="p-4 font-semibold">行程與梯次</th>
                <th className="p-4 font-semibold w-56">聯絡電話 / Email</th>
                <th className="p-4 font-semibold w-32">付款方式與核對</th>
                <th className="p-4 font-semibold w-48">狀態審查</th>
                <th className="p-4 font-semibold w-36 text-center">通知操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, idx) => {
                const isCancelled = order["訂單狀態"] === "已取消";
                const isProcessing = updatingId === order["訂單編號"];
                const isCreditCard = order["支付方式"] === "刷卡";

                return (
                  <tr key={idx} className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${isCancelled ? 'opacity-70 bg-red-50 hover:bg-red-50' : ''}`}>
                    
                    {/* 編號 / 時間 */}
                    <td className="p-4 align-top">
                      <div className={`font-bold font-mono mb-1 ${isCancelled ? 'line-through text-red-500' : 'text-gray-800'}`}>
                        {order["訂單編號"]}
                      </div>
                      <div className="text-xs text-gray-400">{order["報名時間"]}</div>
                    </td>

                    {/* 姓名 / 證號 */}
                    <td className="p-4 align-top">
                      <div className={`font-bold text-base mb-1 ${isCancelled ? 'text-red-700' : 'text-gray-900'}`}>
                        {order["中文姓名"]} <span className="text-sm font-normal">({order["性別"]})</span>
                      </div>
                      <div className="text-xs text-gray-400">{order["身分證_護照號碼"]}</div>
                    </td>

                    {/* 行程與梯次 */}
                    <td className="p-4 align-top">
                      <div className={`font-medium mb-1 ${isCancelled ? 'text-red-700' : 'text-gray-800'}`}>{order["行程名稱"]}</div>
                      <div className="text-xs text-gray-500">{order["出團檔期"]}</div>
                    </td>

                    {/* 聯絡電話 / Email */}
                    <td className="p-4 align-top text-gray-600">
                      <div className="mb-1">{order["手機號碼"]}</div>
                      <div className="text-xs">{order["Email"]}</div>
                    </td>

                    {/* 付款方式與核對 */}
                    <td className="p-4 align-top">
                      {isCreditCard ? (
                        <div className="space-y-2">
                          <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded font-bold">💳 刷卡單</span>
                          {order["刷卡連結"] ? (
                             <button onClick={() => openCardModal(order)} className="block text-[11px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded border border-gray-300 w-full text-left truncate">
                               已綁定 (點擊修改)
                             </button>
                          ) : (
                            <button onClick={() => openCardModal(order)} className="block text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded shadow-sm w-full text-center font-bold">
                              ＋ 生成刷卡連結
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded font-bold">🏦 銀行匯款</span>
                          <div className={`font-mono text-sm font-bold ${order["客戶匯款後五碼"] ? 'text-green-600' : 'text-gray-400'}`}>
                            {order["客戶匯款後五碼"] ? `後五碼: ${order["客戶匯款後五碼"]}` : "未回填"}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* 狀態審查 */}
                    <td className="p-4 align-top">
                      <select 
                        value={order["訂單狀態"] || ""}
                        onChange={(e) => handleStatusChange(order["訂單編號"], e.target.value)}
                        disabled={isProcessing}
                        className={`w-full border rounded px-2 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 
                          ${isProcessing ? 'opacity-50 cursor-wait' : ''}
                          ${isCancelled ? 'border-red-300 text-red-600 bg-white' : 
                            order["訂單狀態"]?.includes("發送") ? 'border-blue-300 text-blue-700 bg-blue-50' : 
                            'border-gray-300 text-gray-700 bg-white'}`}
                      >
                        <option value="等候支付訂金">等候支付訂金</option>
                        <option value="已匯款等候確認">已匯款等候確認</option>
                        <option value="已發送刷卡連結">已發送刷卡連結</option>
                        <option value="客戶已刷卡">客戶已刷卡</option>
                        <option value="已收到訂金">已收到訂金</option>
                        <option value="已發送確認信">已發送確認信</option>
                        <option value="報名成功">報名成功</option>
                        <option value="已取消">已取消</option>
                      </select>
                    </td>

                    {/* 通知操作 (發送 Template C 確認信) */}
                    <td className="p-4 align-top text-center">
                      {isCancelled ? (
                        <div className="inline-flex items-center justify-center border border-gray-200 bg-gray-100 text-gray-400 px-3 py-1.5 rounded text-xs">
                          ✕ 已取消
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleSendConfirmEmail(order)}
                          disabled={isProcessing}
                          className={`inline-flex items-center justify-center border px-3 py-1.5 rounded text-xs font-bold transition-colors w-full shadow-sm
                            ${isProcessing ? 'opacity-50 cursor-wait' : ''}
                            ${order["訂單狀態"] === "已發送確認信" 
                              ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100' 
                              : 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-400'}`}
                        >
                          {order["訂單狀態"] === "已發送確認信" ? '✓ 已發送 (可重寄)' : '✉ 發送確認信'}
                        </button>
                      )}
                    </td>

                  </tr>
                );
              })}
              {filteredOrders.length === 0 && !isLoading && (
                <tr><td colSpan="7" className="p-10 text-center text-gray-500 text-lg">目前尚無符合條件的報名紀錄。</td></tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Modal: 輸入刷卡連結與效期 */}
        {showCardModal && selectedOrderForCard && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200">
              <div className="bg-blue-600 px-6 py-4 flex justify-between items-center text-white">
                <h3 className="font-bold text-lg">💳 綁定專屬刷卡單並寄送通知</h3>
                <button onClick={() => setShowCardModal(false)} className="text-white/80 hover:text-white font-bold text-xl">×</button>
              </div>
              
              <form onSubmit={handleSaveCardLink} className="p-6">
                <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
                  即將為客戶 <strong>{selectedOrderForCard["中文姓名"]}</strong> 發送刷卡通知，請輸入由金流後台生成的加密結帳連結。
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">線上刷卡付款連結 URL *</label>
                    <input 
                      type="url" required
                      value={cardLink}
                      onChange={(e) => setCardLink(e.target.value)}
                      placeholder="https://..."
                      className="w-full border border-gray-300 p-2.5 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">刷卡有效期限 *</label>
                    <input 
                      type="text" required
                      value={cardExpire}
                      onChange={(e) => setCardExpire(e.target.value)}
                      placeholder="例：2026/12/31 23:59 前"
                      className="w-full border border-gray-300 p-2.5 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3 border-t pt-4">
                  <button type="button" onClick={() => setShowCardModal(false)} className="px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 font-bold">取消</button>
                  <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded font-bold shadow hover:bg-blue-700 flex items-center gap-2">
                    ✉ 儲存並寄發通知信
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
