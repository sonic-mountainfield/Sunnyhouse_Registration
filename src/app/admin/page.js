"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import emailjs from '@emailjs/browser';

// EmailJS 設定值常數
const EMAILJS_SERVICE_ID = "service_wu8dua2";
const EMAILJS_PUBLIC_KEY = "gAivgFufM8L44AAow";
const TEMPLATE_B_CREDITCARD = "template_dgejm0a";
const TEMPLATE_C_CONFIRM = "template_cb6oean";
const TEMPLATE_D_BALANCE_NOTICE = "template_yscszni";
const TEMPLATE_E_BALANCE_SETTLED = "template_zmu9rni";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 階段頁籤切換：'deposit' (訂金審核) | 'balance' (尾款請款與結清)
  const [activeTab, setActiveTab] = useState("deposit");

  // 篩選與狀態管理
  const [selectedTour, setSelectedTour] = useState("全部行程");
  const [updatingId, setUpdatingId] = useState(null);

  // 【訂金】刷卡彈跳視窗狀態
  const [showCardModal, setShowCardModal] = useState(false);
  const [selectedOrderForCard, setSelectedOrderForCard] = useState(null);
  const [cardLink, setCardLink] = useState("");
  const [cardExpire, setCardExpire] = useState("");

  // 【尾款】帳單產生器彈跳視窗狀態
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [selectedOrderForBalance, setSelectedOrderForBalance] = useState(null);
  const [balanceItems, setBalanceItems] = useState([]);
  const [balancePayMethod, setBalancePayMethod] = useState("匯款");
  const [balanceCardLink, setBalanceCardLink] = useState("");
  const [balanceCardExpire, setBalanceCardExpire] = useState("");

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
      setOrders(Array.isArray(data) ? data.reverse() : []);
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

  // 根據頁籤與行程篩選過濾訂單
  const filteredOrders = useMemo(() => {
    let baseList = orders;
    // 若在「尾款請款與結清」頁籤，只顯示已付訂金/報名確認的正式團員
    if (activeTab === "balance") {
      baseList = orders.filter(o =>
        ["已收到訂金", "已發送確認信", "報名成功"].includes(o["訂單狀態"])
      );
    }
    if (selectedTour === "全部行程") return baseList;
    return baseList.filter(o => o["行程名稱"] === selectedTour);
  }, [orders, selectedTour, activeTab]);

  // 更新欄位寫回 SheetDB 的通用函式
  const updateSheetDB = async (orderId, updateData) => {
    const updateUrl = `https://sheetdb.io/api/v1/6xxfvdvjl1t6l/訂單編號/${encodeURIComponent(orderId)}?sheet=Registration`;
    const response = await fetch(updateUrl, {
      method: 'PATCH',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: updateData })
    });
    return await response.json();
  };

  // 處理訂金狀態變更
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

  // 處理尾款狀態變更
  const handleBalanceStatusChange = async (orderId, newBalanceStatus) => {
    setUpdatingId(orderId);
    try {
      const result = await updateSheetDB(orderId, { "尾款狀態": newBalanceStatus });
      if (result.updated) {
        setOrders(prev => prev.map(o => o["訂單編號"] === orderId ? { ...o, "尾款狀態": newBalanceStatus } : o));
      }
    } catch (error) {
      console.error("尾款狀態更新失敗:", error);
      alert("尾款狀態更新失敗，請檢查網路連線。");
    } finally {
      setUpdatingId(null);
    }
  };

  // 發送【訂金】正式報名確認信 (Template C)
  const handleSendConfirmEmail = async (order) => {
    if (!confirm(`確定要發送「正式報名確認信（訂金確認）」給 ${order["中文姓名"]} (${order["Email"]}) 嗎？`)) return;

    setUpdatingId(order["訂單編號"]);
    try {
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
          query_url: window.location.origin + "/query"
        },
        EMAILJS_PUBLIC_KEY
      );

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

  // 打開綁定【訂金】刷卡連結 Modal
  const openCardModal = (order) => {
    setSelectedOrderForCard(order);
    setCardLink(order["刷卡連結"] || "");
    setCardExpire(order["刷卡有效期限"] || "");
    setShowCardModal(true);
  };

  // 儲存【訂金】刷卡連結並寄信 (Template B)
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
      const result = await updateSheetDB(orderId, {
        "刷卡連結": cardLink,
        "刷卡有效期限": cardExpire,
        "訂單狀態": newStatus
      });

      if (result.updated) {
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
          EMAILJS_PUBLIC_KEY
        );

        setOrders(prev => prev.map(o => o["訂單編號"] === orderId ? { ...o, "訂單狀態": newStatus, "刷卡連結": cardLink, "刷卡有效期限": cardExpire } : o));
        alert("訂金刷卡連結已儲存，並成功寄出通知信！");
      }
    } catch (error) {
      console.error("處理刷卡連結失敗:", error);
      alert("處理失敗，請稍後再試。");
    } finally {
      setUpdatingId(null);
      setSelectedOrderForCard(null);
    }
  };

  // 打開【尾款】帳單產生器 Modal
  const openBalanceModal = (order) => {
    setSelectedOrderForBalance(order);
    // 若試算表已有明細 JSON 則解析載入，否則自動建立預設兩筆項目
    let parsedItems = [];
    if (order["尾款明細"]) {
      try {
        parsedItems = JSON.parse(order["尾款明細"]);
      } catch (e) {
        parsedItems = [];
      }
    }
    if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
      parsedItems = [
        { name: `${order["行程名稱"]} 團費`, amount: "" },
        { name: "扣除已付訂金", amount: -15000 }
      ];
    }
    setBalanceItems(parsedItems);
    setBalancePayMethod(order["尾款支付方式"] || order["支付方式"] || "匯款");
    setBalanceCardLink(order["尾款刷卡連結"] || "");
    setBalanceCardExpire(order["尾款有效期限"] || "");
    setShowBalanceModal(true);
  };

  // 計算尾款即時總金額
  const balanceTotalAmount = useMemo(() => {
    return balanceItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [balanceItems]);

  // 儲存【尾款】明細並寄送 Template D 請款通知信
  const handleSaveAndSendBalance = async (e) => {
    e.preventDefault();
    const validItems = balanceItems.filter(item => item.name.trim() !== "");
    if (validItems.length === 0) {
      alert("請至少填寫一項費用明細！");
      return;
    }
    if (balancePayMethod === "刷卡" && (!balanceCardLink || !balanceCardExpire)) {
      alert("選擇信用卡刷卡者，請完整填寫尾款刷卡連結與有效期限！");
      return;
    }

    const order = selectedOrderForBalance;
    const orderId = order["訂單編號"];
    setUpdatingId(orderId);
    setShowBalanceModal(false);

    // 整理給 EmailJS 的純文字明細清單
    const feeDetailsText = validItems
      .map(item => {
        const amt = Number(item.amount) || 0;
        const formattedAmt = amt < 0
          ? `-NT$ ${Math.abs(amt).toLocaleString()}`
          : `NT$ ${amt.toLocaleString()}`;
        return `• ${item.name}：${formattedAmt}`;
      })
      .join("\n");

    const newBalanceStatus = "已通知繳尾款";
    const updatePayload = {
      "尾款明細": JSON.stringify(validItems),
      "應付尾款": balanceTotalAmount,
      "尾款支付方式": balancePayMethod,
      "尾款刷卡連結": balancePayMethod === "刷卡" ? balanceCardLink : "",
      "尾款有效期限": balancePayMethod === "刷卡" ? balanceCardExpire : "",
      "尾款狀態": newBalanceStatus
    };

    try {
      const result = await updateSheetDB(orderId, updatePayload);
      if (result.updated) {
        await emailjs.send(
          EMAILJS_SERVICE_ID,
          TEMPLATE_D_BALANCE_NOTICE,
          {
            to_name: order["中文姓名"],
            to_email: order["Email"],
            order_id: orderId,
            tour_name: order["行程名稱"],
            schedule_date: order["出團檔期"],
            fee_details: feeDetailsText,
            balance_amount: balanceTotalAmount.toLocaleString(),
            payment_link: balancePayMethod === "刷卡"
              ? balanceCardLink
              : "（本次選擇銀行匯款，無需使用刷卡連結）",
            expire_date: balancePayMethod === "刷卡"
              ? balanceCardExpire
              : "（請於收到通知後 5 日內完成匯款）",
            query_url: window.location.origin + "/query"
          },
          EMAILJS_PUBLIC_KEY
        );

        setOrders(prev => prev.map(o => o["訂單編號"] === orderId ? { ...o, ...updatePayload } : o));
        alert("尾款明細已儲存，並成功寄發尾款請款通知信！");
      }
    } catch (error) {
      console.error("尾款請款發送失敗:", error);
      alert("尾款請款發送失敗，請稍後再試。");
    } finally {
      setUpdatingId(null);
      setSelectedOrderForBalance(null);
    }
  };

  // 發送【尾款】結清確認信 (Template E)
  const handleSendBalanceSettledEmail = async (order) => {
    if (!order["應付尾款"]) {
      alert("此筆訂單尚未開立尾款金額，請先點擊「開立尾款單」設定金額！");
      return;
    }
    if (!confirm(`確定已收到 ${order["中文姓名"]} 的尾款 NT$ ${Number(order["應付尾款"]).toLocaleString()} 元，並寄出「尾款結清確認信」嗎？`)) return;

    const orderId = order["訂單編號"];
    setUpdatingId(orderId);
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        TEMPLATE_E_BALANCE_SETTLED,
        {
          to_name: order["中文姓名"],
          to_email: order["Email"],
          order_id: orderId,
          tour_name: order["行程名稱"],
          schedule_date: order["出團檔期"],
          balance_amount: Number(order["應付尾款"]).toLocaleString(),
          payment_method: order["尾款支付方式"] || order["支付方式"],
          query_url: window.location.origin + "/query"
        },
        EMAILJS_PUBLIC_KEY
      );

      const newBalanceStatus = "尾款已結清";
      const result = await updateSheetDB(orderId, { "尾款狀態": newBalanceStatus });
      if (result.updated) {
        setOrders(prev => prev.map(o => o["訂單編號"] === orderId ? { ...o, "尾款狀態": newBalanceStatus } : o));
        alert("尾款結清確認信已寄出！全額帳務已標記結清。");
      }
    } catch (error) {
      console.error("發送尾款結清信失敗:", error);
      alert("發送信件失敗，請稍後再試。");
    } finally {
      setUpdatingId(null);
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
            <Link href="/query" className="bg-white text-gray-600 hover:text-gray-900 px-6 py-2 rounded-t-lg font-bold border border-b-0 border-gray-300">
              隊員報名查詢
            </Link>
            <div className="bg-[#2c3e50] text-white px-6 py-2 rounded-t-lg font-bold">管理員後台</div>
          </div>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
            ← 返回客戶首頁
          </Link>
        </div>

        {/* 報名名單總覽標頭與篩選器 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-100">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                報名與帳務管理總覽
                {isLoading && <span className="text-sm font-normal text-blue-500 animate-pulse">資料同步中...</span>}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                目前檢視共 <span className="font-bold text-green-600">{filteredOrders.length}</span> 筆資料
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

          {/* 階段切換頁籤：訂金 vs 尾款 */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setActiveTab("deposit")}
              className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
                activeTab === "deposit"
                  ? "bg-[#8A1C14] text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span>① 訂金與新報名審核</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === "deposit" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"}`}>
                全部 {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("balance")}
              className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
                activeTab === "balance"
                  ? "bg-[#2c3e50] text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span>② 尾款請款與結清</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === "balance" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"}`}>
                已付訂團員 {orders.filter(o => ["已收到訂金", "已發送確認信", "報名成功"].includes(o["訂單狀態"])).length}
              </span>
            </button>
          </div>
        </div>

        {/* 資料列表區：頁籤 1【訂金與新報名審核】 */}
        {activeTab === "deposit" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
                  <th className="p-4 font-semibold w-48">編號 / 時間</th>
                  <th className="p-4 font-semibold w-32">姓名 / 證號</th>
                  <th className="p-4 font-semibold">行程與梯次</th>
                  <th className="p-4 font-semibold w-56">聯絡電話 / Email</th>
                  <th className="p-4 font-semibold w-40">訂金方式與核對</th>
                  <th className="p-4 font-semibold w-48">訂金狀態審查</th>
                  <th className="p-4 font-semibold w-40 text-center">訂金通知操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, idx) => {
                  const isCancelled = order["訂單狀態"] === "已取消";
                  const isProcessing = updatingId === order["訂單編號"];
                  const isCreditCard = order["支付方式"] === "刷卡";

                  return (
                    <tr key={idx} className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${isCancelled ? 'opacity-70 bg-red-50 hover:bg-red-50' : ''}`}>
                      <td className="p-4 align-top">
                        <div className={`font-bold font-mono mb-1 ${isCancelled ? 'line-through text-red-500' : 'text-gray-800'}`}>
                          {order["訂單編號"]}
                        </div>
                        <div className="text-xs text-gray-400">{order["報名時間"]}</div>
                      </td>

                      <td className="p-4 align-top">
                        <div className={`font-bold text-base mb-1 ${isCancelled ? 'text-red-700' : 'text-gray-900'}`}>
                          {order["中文姓名"]} <span className="text-sm font-normal">({order["性別"]})</span>
                        </div>
                        <div className="text-xs text-gray-400">{order["身分證_護照號碼"]}</div>
                      </td>

                      <td className="p-4 align-top">
                        <div className={`font-medium mb-1 ${isCancelled ? 'text-red-700' : 'text-gray-800'}`}>{order["行程名稱"]}</div>
                        <div className="text-xs text-gray-500">{order["出團檔期"]} {order["天數"] && `(${order["天數"]})`}</div>
                      </td>

                      <td className="p-4 align-top text-gray-600">
                        <div className="mb-1">{order["手機號碼"]}</div>
                        <div className="text-xs">{order["Email"]}</div>
                      </td>

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
        )}

        {/* 資料列表區：頁籤 2【尾款請款與結清】 */}
        {activeTab === "balance" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100 border-b border-gray-200 text-gray-700">
                  <th className="p-4 font-semibold w-44">訂單編號 / 姓名</th>
                  <th className="p-4 font-semibold">行程梯次與特殊需求（計價參考）</th>
                  <th className="p-4 font-semibold w-52">尾款明細與應付金額</th>
                  <th className="p-4 font-semibold w-44">尾款支付與對帳</th>
                  <th className="p-4 font-semibold w-44">尾款狀態</th>
                  <th className="p-4 font-semibold w-44 text-center">尾款結清通知</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, idx) => {
                  const isProcessing = updatingId === order["訂單編號"];
                  const balanceMethod = order["尾款支付方式"] || order["支付方式"] || "匯款";
                  const hasBalanceBill = order["應付尾款"] !== "" && order["應付尾款"] !== undefined && order["應付尾款"] !== null;
                  const isSettled = order["尾款狀態"] === "尾款已結清";

                  return (
                    <tr key={idx} className={`border-b border-gray-100 hover:bg-slate-50 transition-colors ${isSettled ? 'bg-green-50/40' : ''}`}>
                      <td className="p-4 align-top">
                        <div className="font-bold font-mono text-gray-800 mb-1">{order["訂單編號"]}</div>
                        <div className="font-bold text-base text-gray-900">{order["中文姓名"]}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{order["手機號碼"]}</div>
                      </td>

                      <td className="p-4 align-top">
                        <div className="font-bold text-gray-800">{order["行程名稱"]}</div>
                        <div className="text-xs text-gray-500 mb-2">檔期：{order["出團檔期"]} {order["天數"] && `｜ ${order["天數"]}`}</div>
                        <div className="flex flex-wrap gap-1.5 text-[11px]">
                          {order["住宿安排"] && (
                            <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
                              🛏️ {order["住宿安排"]}
                            </span>
                          )}
                          {order["自駕分組"] && (
                            <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded">
                              🚗 {order["自駕分組"]} ({order["自駕角色_配置"]} {order["重機車種"]})
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4 align-top">
                        {hasBalanceBill ? (
                          <div className="space-y-2">
                            <div className="font-mono text-base font-extrabold text-[#8A1C14]">
                              NT$ {Number(order["應付尾款"]).toLocaleString()}
                            </div>
                            <button
                              onClick={() => openBalanceModal(order)}
                              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded border border-gray-300 font-medium"
                            >
                              ✏️ 查看 / 修改明細
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => openBalanceModal(order)}
                            className="bg-[#2c3e50] hover:bg-[#1a252f] text-white text-xs font-bold px-3 py-2 rounded shadow-sm flex items-center gap-1"
                          >
                            <span>🧾 開立尾款請款單</span>
                          </button>
                        )}
                      </td>

                      <td className="p-4 align-top">
                        {balanceMethod === "刷卡" ? (
                          <div className="space-y-1">
                            <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded font-bold">💳 尾款刷卡</span>
                            <div className="text-xs text-gray-500">
                              {order["尾款刷卡連結"] ? "已綁定刷卡連結" : "尚未產生連結"}
                            </div>
                            {order["尾款有效期限"] && (
                              <div className="text-[11px] text-red-600">效期：{order["尾款有效期限"]}</div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded font-bold">🏦 尾款匯款</span>
                            <div className={`font-mono text-sm font-bold ${order["尾款後五碼"] ? 'text-green-600' : 'text-gray-400'}`}>
                              {order["尾款後五碼"] ? `後五碼: ${order["尾款後五碼"]}` : "尚未回填"}
                            </div>
                          </div>
                        )}
                      </td>

                      <td className="p-4 align-top">
                        <select
                          value={order["尾款狀態"] || "未請款"}
                          onChange={(e) => handleBalanceStatusChange(order["訂單編號"], e.target.value)}
                          disabled={isProcessing}
                          className={`w-full border rounded px-2 py-1.5 text-sm font-medium focus:outline-none focus:ring-2
                            ${isSettled ? 'border-green-300 text-green-700 bg-green-50' :
                              order["尾款狀態"] === "已通知繳尾款" ? 'border-blue-300 text-blue-700 bg-blue-50' :
                              'border-gray-300 text-gray-700 bg-white'}`}
                        >
                          <option value="未請款">未請款</option>
                          <option value="已通知繳尾款">已通知繳尾款</option>
                          <option value="已匯款待核對">已匯款待核對</option>
                          <option value="尾款已結清">尾款已結清</option>
                        </select>
                      </td>

                      <td className="p-4 align-top text-center">
                        <button
                          onClick={() => handleSendBalanceSettledEmail(order)}
                          disabled={isProcessing || !hasBalanceBill}
                          className={`inline-flex items-center justify-center border px-3 py-1.5 rounded text-xs font-bold transition-colors w-full shadow-sm
                            ${!hasBalanceBill ? 'opacity-40 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200' :
                              isSettled
                                ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100'
                                : 'border-emerald-400 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'}`}
                        >
                          {isSettled ? '✓ 已結清 (可重寄)' : '✉ 發送結清確認信'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredOrders.length === 0 && !isLoading && (
                  <tr><td colSpan="6" className="p-10 text-center text-gray-500 text-lg">目前尚無已確認訂金的團員紀錄。</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal 1：【訂金】輸入刷卡連結與效期 */}
        {showCardModal && selectedOrderForCard && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200">
              <div className="bg-blue-600 px-6 py-4 flex justify-between items-center text-white">
                <h3 className="font-bold text-lg">💳 綁定訂金專屬刷卡單並寄送通知</h3>
                <button onClick={() => setShowCardModal(false)} className="text-white/80 hover:text-white font-bold text-xl">×</button>
              </div>

              <form onSubmit={handleSaveCardLink} className="p-6">
                <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
                  即將為客戶 <strong>{selectedOrderForCard["中文姓名"]}</strong> 發送訂金（NT$ 15,000）刷卡通知，請輸入加密結帳連結。
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

        {/* Modal 2：【尾款】費用明細帳單產生器 */}
        {showBalanceModal && selectedOrderForBalance && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-200 max-h-[90vh] flex flex-col">
              <div className="bg-[#2c3e50] px-6 py-4 flex justify-between items-center text-white">
                <h3 className="font-bold text-lg">🧾 開立尾款費用明細與請款通知</h3>
                <button onClick={() => setShowBalanceModal(false)} className="text-white/80 hover:text-white font-bold text-xl">×</button>
              </div>

              <form onSubmit={handleSaveAndSendBalance} className="p-6 overflow-y-auto space-y-6">
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-sm flex flex-wrap justify-between gap-2">
                  <div>
                    <span className="text-gray-500">團員：</span>
                    <strong className="text-gray-900">{selectedOrderForBalance["中文姓名"]}</strong>
                    <span className="text-gray-400 ml-2 font-mono">({selectedOrderForBalance["訂單編號"]})</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    房型：{selectedOrderForBalance["住宿安排"]}
                  </div>
                </div>

                {/* 動態明細項目列表 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-bold text-gray-800">費用明細項目（折抵或已付訂金請填負數，如 -15000）</label>
                    <button
                      type="button"
                      onClick={() => setBalanceItems([...balanceItems, { name: "", amount: "" }])}
                      className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded font-bold"
                    >
                      ＋ 新增項目
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {balanceItems.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="項目名稱（例：單人房差、重機升級）"
                          value={item.name}
                          onChange={(e) => {
                            const updated = [...balanceItems];
                            updated[i].name = e.target.value;
                            setBalanceItems(updated);
                          }}
                          className="flex-grow border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-[#2c3e50] outline-none"
                          required
                        />
                        <input
                          type="number"
                          placeholder="金額"
                          value={item.amount}
                          onChange={(e) => {
                            const updated = [...balanceItems];
                            updated[i].amount = e.target.value;
                            setBalanceItems(updated);
                          }}
                          className="w-32 border border-gray-300 rounded p-2 text-sm font-mono text-right focus:ring-2 focus:ring-[#2c3e50] outline-none"
                          required
                        />
                        {balanceItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setBalanceItems(balanceItems.filter((_, idx) => idx !== i))}
                            className="text-gray-400 hover:text-red-600 px-2 font-bold text-lg"
                            title="刪除此列"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex justify-between items-center">
                    <span className="font-bold text-gray-800">本次應付尾款總計：</span>
                    <span className="font-mono text-xl font-black text-[#8A1C14]">
                      NT$ {balanceTotalAmount.toLocaleString()} 元
                    </span>
                  </div>
                </div>

                {/* 尾款支付方式設定 */}
                <div className="border-t pt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">尾款支付方式</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setBalancePayMethod("匯款")}
                        className={`p-3 rounded-lg border-2 text-sm font-bold ${
                          balancePayMethod === "匯款"
                            ? "border-[#8A1C14] bg-red-50 text-[#8A1C14]"
                            : "border-gray-200 text-gray-600"
                        }`}
                      >
                        🏦 銀行匯款（回填後五碼）
                      </button>
                      <button
                        type="button"
                        onClick={() => setBalancePayMethod("刷卡")}
                        className={`p-3 rounded-lg border-2 text-sm font-bold ${
                          balancePayMethod === "刷卡"
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-gray-200 text-gray-600"
                        }`}
                      >
                        💳 信用卡線上刷卡
                      </button>
                    </div>
                  </div>

                  {balancePayMethod === "刷卡" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50/60 p-4 rounded-lg border border-blue-200">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">尾款刷卡付款連結 URL *</label>
                        <input
                          type="url"
                          required
                          value={balanceCardLink}
                          onChange={(e) => setBalanceCardLink(e.target.value)}
                          placeholder="https://..."
                          className="w-full border border-gray-300 p-2 rounded text-sm bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">尾款刷卡有效期限 *</label>
                        <input
                          type="text"
                          required
                          value={balanceCardExpire}
                          onChange={(e) => setBalanceCardExpire(e.target.value)}
                          placeholder="例：2026/05/15 23:59 前"
                          className="w-full border border-gray-300 p-2 rounded text-sm bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t flex justify-end gap-3">
                  <button type="button" onClick={() => setShowBalanceModal(false)} className="px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 font-bold">
                    取消
                  </button>
                  <button type="submit" className="px-6 py-2.5 bg-[#8A1C14] hover:bg-[#9c221a] text-white rounded font-bold shadow flex items-center gap-2">
                    ✉ 儲存明細並寄發尾款通知信
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
