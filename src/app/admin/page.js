"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import emailjs from '@emailjs/browser';

// EmailJS 設定值常數
const EMAILJS_SERVICE_ID = "service_wu8dua2";
const EMAILJS_PUBLIC_KEY = "gAivgFufM8L44AAow";
const TEMPLATE_B_CREDITCARD = "template_dgejm0a";
const TEMPLATE_C_CONFIRM = "template_cb6oean";
const TEMPLATE_D_BALANCE_NOTICE = "template_yscszni";
const TEMPLATE_E_BALANCE_SETTLED = "template_zmu9rni";

// 完整團號與出發日期主檔（統一標註 2027 年，供電子看板計算 D-30 / D-25 / D-20 倒數與剩餘名額）
const MASTER_SCHEDULES = [
  // 西藏系列（需辦理入藏函，嚴格執行 D-30 / D-25 / D-20 控管）
  { code: "TE1", series: "西藏系列", tourName: "TE｜林芝桃花・頂級西藏青藏鐵路12日", dateRange: "2027/03/19-03/30", startDate: "2027-03-19", defaultCapacity: 16, isTibet: true },
  { code: "TE2", series: "西藏系列", tourName: "TE｜林芝桃花・頂級西藏青藏鐵路12日", dateRange: "2027/04/02-04/13", startDate: "2027-04-02", defaultCapacity: 16, isTibet: true },
  { code: "TE3", series: "西藏系列", tourName: "TE｜林芝桃花・頂級西藏青藏鐵路12日", dateRange: "2027/10/22-11/02", startDate: "2027-10-22", defaultCapacity: 16, isTibet: true },
  { code: "TE4", series: "西藏系列", tourName: "TE｜林芝桃花・頂級西藏青藏鐵路12日", dateRange: "2027/11/05-11/16", startDate: "2027-11-05", defaultCapacity: 16, isTibet: true },

  { code: "TB1", series: "西藏系列", tourName: "TB｜西藏聖母峰大環線・神山聖湖", dateRange: "2027/04/02-04/13", startDate: "2027-04-02", defaultCapacity: 16, isTibet: true },
  { code: "TB2", series: "西藏系列", tourName: "TB｜西藏聖母峰大環線・神山聖湖", dateRange: "2027/04/23-05/04", startDate: "2027-04-23", defaultCapacity: 16, isTibet: true },
  { code: "TB3", series: "西藏系列", tourName: "TB｜西藏聖母峰大環線・神山聖湖", dateRange: "2027/06/04-06/15", startDate: "2027-06-04", defaultCapacity: 16, isTibet: true },
  { code: "TB4", series: "西藏系列", tourName: "TB｜西藏聖母峰大環線・神山聖湖", dateRange: "2027/07/09-07/20", startDate: "2027-07-09", defaultCapacity: 16, isTibet: true },
  { code: "TB5", series: "西藏系列", tourName: "TB｜西藏聖母峰大環線・神山聖湖", dateRange: "2027/08/13-08/24", startDate: "2027-08-13", defaultCapacity: 16, isTibet: true },
  { code: "TB6", series: "西藏系列", tourName: "TB｜西藏聖母峰大環線・神山聖湖", dateRange: "2027/09/10-09/21", startDate: "2027-09-10", defaultCapacity: 16, isTibet: true },
  { code: "TB7", series: "西藏系列", tourName: "TB｜西藏聖母峰大環線・神山聖湖", dateRange: "2027/09/24-10/05", startDate: "2027-09-24", defaultCapacity: 16, isTibet: true },
  { code: "TB8", series: "西藏系列", tourName: "TB｜西藏聖母峰大環線・神山聖湖", dateRange: "2027/10/08-10/19", startDate: "2027-10-08", defaultCapacity: 16, isTibet: true },
  { code: "TB9", series: "西藏系列", tourName: "TB｜西藏聖母峰大環線・神山聖湖", dateRange: "2027/10/22-11/02", startDate: "2027-10-22", defaultCapacity: 16, isTibet: true },

  { code: "TK1", series: "西藏系列", tourName: "TK｜阿里岡仁波齊轉山之旅", dateRange: "2027/06/04-06/15", startDate: "2027-06-04", defaultCapacity: 16, isTibet: true },
  { code: "TK2", series: "西藏系列", tourName: "TK｜阿里岡仁波齊轉山之旅", dateRange: "2027/09/10-09/21", startDate: "2027-09-10", defaultCapacity: 16, isTibet: true },

  // 新疆系列
  { code: "XS1", series: "新疆系列", tourName: "XS｜南疆・帕米爾高原・盤龍古道", dateRange: "2027/04/02-04/11", startDate: "2027-04-02", defaultCapacity: 16, isTibet: false },
  { code: "XS2", series: "新疆系列", tourName: "XS｜南疆・帕米爾高原・盤龍古道", dateRange: "2027/10/22-10/31", startDate: "2027-10-22", defaultCapacity: 16, isTibet: false },

  // 中國自駕系列（TC 含西藏段亦適用入藏規則）
  { code: "TC318-1", series: "中國自駕系列", tourName: "TC318｜此生必駕318・重機/四驅車自駕", dateRange: "2027/04/14-04/26", startDate: "2027-04-14", defaultCapacity: 12, isTibet: true },
  { code: "TC318-2", series: "中國自駕系列", tourName: "TC318｜此生必駕318・重機/四驅車自駕", dateRange: "2027/10/13-10/25", startDate: "2027-10-13", defaultCapacity: 12, isTibet: true },
  { code: "TC1", series: "中國自駕系列", tourName: "TC｜聖母峰・重機/四驅車自駕", dateRange: "2027/04/23-05/02", startDate: "2027-04-23", defaultCapacity: 12, isTibet: true },
  { code: "TC2", series: "中國自駕系列", tourName: "TC｜聖母峰・重機/四驅車自駕", dateRange: "2027/10/22-10/31", startDate: "2027-10-22", defaultCapacity: 12, isTibet: true },
  { code: "XSD1", series: "中國自駕系列", tourName: "XSD｜帕米爾高原・盤龍古道 重機/四驅車自駕", dateRange: "2027/04/02-04/11", startDate: "2027-04-02", defaultCapacity: 12, isTibet: false },
  { code: "XSD2", series: "中國自駕系列", tourName: "XSD｜帕米爾高原・盤龍古道 重機/四驅車自駕", dateRange: "2027/10/22-10/31", startDate: "2027-10-22", defaultCapacity: 12, isTibet: false },

  // 埃及系列
  { code: "EG1", series: "埃及系列", tourName: "EG｜埃及撒哈拉之旅", dateRange: "2026/12/04-12/15", startDate: "2026-12-04", defaultCapacity: 16, isTibet: false },
  { code: "EG2", series: "埃及系列", tourName: "EG｜埃及撒哈拉之旅", dateRange: "2027/01/22-02/02", startDate: "2027-01-22", defaultCapacity: 16, isTibet: false },
  { code: "EG3", series: "埃及系列", tourName: "EG｜埃及撒哈拉之旅", dateRange: "2027/02/26-03/09", startDate: "2027-02-26", defaultCapacity: 16, isTibet: false },
  { code: "EG4", series: "埃及系列", tourName: "EG｜埃及撒哈拉之旅", dateRange: "2027/04/02-04/13", startDate: "2027-04-02", defaultCapacity: 16, isTibet: false },
  { code: "EG5", series: "埃及系列", tourName: "EG｜埃及撒哈拉之旅", dateRange: "2027/04/30-05/11", startDate: "2027-04-30", defaultCapacity: 16, isTibet: false }
];

// 強化版日期解析：支援 YYYY/MM/DD、美式 MM/DD/YYYY、民國年 YYY/MM/DD，並可從訂單編號備援抓取
const parseTaiwanDate = (rawStr, orderId = "") => {
  if (rawStr) {
    const str = rawStr.toString().trim();

    // 1. 匹配 YYYY/MM/DD 或 YYYY-MM-DD 或 YYYY年MM月DD日
    const ymdMatch = str.match(/(\d{4})[\/\-年](\d{1,2})[\/\-月](\d{1,2})/);
    if (ymdMatch) {
      return new Date(parseInt(ymdMatch[1], 10), parseInt(ymdMatch[2], 10) - 1, parseInt(ymdMatch[3], 10));
    }

    // 2. 匹配美式格式 MM/DD/YYYY（Google 試算表預設語系常自動轉成此格式）
    const mdyMatch = str.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (mdyMatch) {
      return new Date(parseInt(mdyMatch[3], 10), parseInt(mdyMatch[1], 10) - 1, parseInt(mdyMatch[2], 10));
    }

    // 3. 匹配民國年 YYY/MM/DD（如 115/11/17）
    const rocMatch = str.match(/^(\d{2,3})[\/\-年](\d{1,2})[\/\-月](\d{1,2})/);
    if (rocMatch) {
      return new Date(parseInt(rocMatch[1], 10) + 1911, parseInt(rocMatch[2], 10) - 1, parseInt(rocMatch[3], 10));
    }
  }

  // 4. 終極備援：直接從訂單編號 (如 SY261117-XXX) 解析出年月日
  if (orderId) {
    const idMatch = orderId.toString().match(/SY(\d{2})(\d{2})(\d{2})/);
    if (idMatch) {
      return new Date(2000 + parseInt(idMatch[1], 10), parseInt(idMatch[2], 10) - 1, parseInt(idMatch[3], 10));
    }
  }

  return null;
};

// 取得該日期所屬週一日期字串 (YYYY/MM/DD)
const getMondayKey = (dateObj) => {
  const d = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (dt) => `${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')}`;
  return {
    key: fmt(monday),
    label: `${fmt(monday)} ~ ${String(sunday.getMonth() + 1).padStart(2, '0')}/${String(sunday.getDate()).padStart(2, '0')}`
  };
};

// 計算日期加減天數並格式化為 MM/DD
const formatOffsetDate = (startDateStr, offsetDays) => {
  if (!startDateStr) return "-";
  const [y, m, d] = startDateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + offsetDays);
  return `${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')}`;
};

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 階段頁籤切換：'deposit' (訂金審核) | 'balance' (尾款請款) | 'board' (業務收客電子看板)
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

  // 【電子看板】專用狀態
  const [reportGranularity, setReportGranularity] = useState("monthly"); // 'monthly' | 'weekly'
  const [boardSeriesFilter, setBoardSeriesFilter] = useState("全部系列");
  const [boardStatusFilter, setBoardStatusFilter] = useState("upcoming"); // 'upcoming' | 'activeOnly' | 'all'
  const [customCapacities, setCustomCapacities] = useState({});
  const [editingCapCode, setEditingCapCode] = useState(null);
  const [tempCapValue, setTempCapValue] = useState("");
  const [expandedScheduleCode, setExpandedScheduleCode] = useState(null);

  // 載入本地暫存的各團總名額設定
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sunnyhouse_tour_capacities");
      if (saved) setCustomCapacities(JSON.parse(saved));
    } catch (e) {
      console.warn("讀取本地名額設定失敗", e);
    }
  }, []);

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

  // 取得所有報名資料（並嘗試同步 Schedules 名額分頁）
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://sheetdb.io/api/v1/6xxfvdvjl1t6l?sheet=Registration');
      const data = await response.json();
      setOrders(Array.isArray(data) ? data.reverse() : []);

      // 嘗試讀取雲端 Schedules 分頁名額設定（若尚未建立該分頁則自動忽略）
      try {
        const capRes = await fetch('https://sheetdb.io/api/v1/6xxfvdvjl1t6l?sheet=Schedules');
        if (capRes.ok) {
          const capData = await capRes.json();
          if (Array.isArray(capData)) {
            const cloudMap = {};
            capData.forEach(row => {
              if (row["團號"] && row["總名額"]) {
                cloudMap[row["團號"].trim()] = Number(row["總名額"]);
              }
            });
            setCustomCapacities(prev => ({ ...prev, ...cloudMap }));
          }
        }
      } catch (capErr) {
        // 雲端尚無 Schedules 分頁時靜默略過
      }
    } catch (error) {
      console.error("載入失敗:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 儲存某團總名額（同步本地與雲端 Schedules 分頁）
  const handleSaveCapacity = async (code) => {
    const num = parseInt(tempCapValue, 10);
    if (isNaN(num) || num < 1) {
      alert("請輸入大於 0 的有效名額數字！");
      return;
    }

    const updated = { ...customCapacities, [code]: num };
    setCustomCapacities(updated);
    setEditingCapCode(null);

    try {
      localStorage.setItem("sunnyhouse_tour_capacities", JSON.stringify(updated));
    } catch (e) {}

    try {
      const patchRes = await fetch(`https://sheetdb.io/api/v1/6xxfvdvjl1t6l/團號/${encodeURIComponent(code)}?sheet=Schedules`, {
        method: 'PATCH',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { "總名額": num } })
      });
      const patchJson = await patchRes.json();
      if (!patchJson.updated) {
        await fetch(`https://sheetdb.io/api/v1/6xxfvdvjl1t6l?sheet=Schedules`, {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: [{ "團號": code, "總名額": num }] })
        });
      }
    } catch (e) {
      // 若尚未建立 Schedules 分頁，本地已生效
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
    if (activeTab === "balance") {
      baseList = orders.filter(o =>
        ["已收到訂金", "已發送確認信", "報名成功"].includes(o["訂單狀態"])
      );
    }
    if (selectedTour === "全部行程") return baseList;
    return baseList.filter(o => o["行程名稱"] === selectedTour);
  }, [orders, selectedTour, activeTab]);

  // ==========================================
  // 【業務電子看板】統計計算邏輯
  // ==========================================
  const dashboardStats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(todayStart);
    sevenDaysAgo.setDate(todayStart.getDate() - 6); // 含今天共 7 天

    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const activeOrders = orders.filter(o => o["訂單狀態"] !== "已取消");
    const isConfirmed = (o) => ["已收到訂金", "已發送確認信", "報名成功"].includes(o["訂單狀態"]);

    let weeklyTotal = 0;
    let weeklyConfirmed = 0;
    let monthlyTotal = 0;
    let monthlyConfirmed = 0;

    // 依時間週期分組（每月 / 每週）
    const periodMap = {};

    activeOrders.forEach(o => {
      const regDate = parseTaiwanDate(o["報名時間"], o["訂單編號"]);
      const confirmed = isConfirmed(o);
      const series = o["行程系列"] || "其他系列";

      if (regDate) {
        if (regDate >= sevenDaysAgo && regDate <= now) {
          weeklyTotal += 1;
          if (confirmed) weeklyConfirmed += 1;
        }
        if (regDate.getFullYear() === currentYear && regDate.getMonth() === currentMonth) {
          monthlyTotal += 1;
          if (confirmed) monthlyConfirmed += 1;
        }

        let groupKey = "";
        let groupLabel = "";
        if (reportGranularity === "monthly") {
          const mStr = String(regDate.getMonth() + 1).padStart(2, '0');
          groupKey = `${regDate.getFullYear()}-${mStr}`;
          groupLabel = `${regDate.getFullYear()} 年 ${mStr} 月`;
        } else {
          const wk = getMondayKey(regDate);
          groupKey = wk.key;
          groupLabel = `${wk.label} 週`;
        }

        if (!periodMap[groupKey]) {
          periodMap[groupKey] = {
            key: groupKey,
            label: groupLabel,
            total: 0,
            confirmed: 0,
            pending: 0,
            seriesBreakdown: {}
          };
        }

        if (boardSeriesFilter === "全部系列" || series === boardSeriesFilter) {
          periodMap[groupKey].total += 1;
          if (confirmed) periodMap[groupKey].confirmed += 1;
          else periodMap[groupKey].pending += 1;
          periodMap[groupKey].seriesBreakdown[series] = (periodMap[groupKey].seriesBreakdown[series] || 0) + 1;
        }
      }
    });

    const periodReports = Object.values(periodMap)
      .filter(p => p.total > 0)
      .sort((a, b) => b.key.localeCompare(a.key));

    // 建立各團梯次收客與倒數清單（合併主檔與試算表中出現的梯次）
    const scheduleMap = {};
    MASTER_SCHEDULES.forEach(sch => {
      scheduleMap[sch.code] = {
        ...sch,
        confirmedList: [],
        pendingList: []
      };
    });

    activeOrders.forEach(o => {
      const code = (o["出團檔期"] || "").trim();
      if (!code) return;
      if (!scheduleMap[code]) {
        const seriesName = o["行程系列"] || "其他系列";
        const tourName = o["行程名稱"] || code;
        scheduleMap[code] = {
          code,
          series: seriesName,
          tourName,
          dateRange: "依公告檔期",
          startDate: "",
          defaultCapacity: seriesName === "中國自駕系列" ? 12 : 16,
          isTibet: seriesName === "西藏系列" || code.startsWith("TC"),
          confirmedList: [],
          pendingList: []
        };
      }
      if (isConfirmed(o)) {
        scheduleMap[code].confirmedList.push(o);
      } else {
        scheduleMap[code].pendingList.push(o);
      }
    });

    // 計算每團距離出發日天數、西藏三階段警戒與剩餘名額
    let urgentTibetCount = 0;

    const scheduleRows = Object.values(scheduleMap).map(sch => {
      const capacity = customCapacities[sch.code] || sch.defaultCapacity;
      const confirmedCount = sch.confirmedList.length;
      const pendingCount = sch.pendingList.length;
      const totalOccupied = confirmedCount + pendingCount;
      const remainingConfirmed = Math.max(0, capacity - confirmedCount);
      const remainingAll = Math.max(0, capacity - totalOccupied);

      let daysUntil = null;
      if (sch.startDate) {
        const [y, m, d] = sch.startDate.split("-").map(Number);
        const depDate = new Date(y, m - 1, d);
        daysUntil = Math.ceil((depDate - todayStart) / (1000 * 60 * 60 * 24));
      }

      let stageBadge = { text: "正常收客中", color: "bg-emerald-100 text-emerald-800 border-emerald-200", subText: "" };
      let isCutoffStopped = false;

      if (daysUntil !== null) {
        if (daysUntil < 0) {
          stageBadge = { text: "已出發 / 歷史團", color: "bg-gray-100 text-gray-500 border-gray-200", subText: `已出發 ${Math.abs(daysUntil)} 天` };
          isCutoffStopped = true;
        } else if (sch.isTibet) {
          if (daysUntil <= 20) {
            stageBadge = { text: "🔴 行政結案死線 (≤20天)", color: "bg-red-100 text-red-800 border-red-300", subText: "證件/機票行政須完成" };
            isCutoffStopped = true;
            urgentTibetCount += 1;
          } else if (daysUntil <= 25) {
            stageBadge = { text: "⛔ 停止收客 (D-25已過)", color: "bg-orange-100 text-orange-800 border-orange-300", subText: `距D-20行政截止剩 ${daysUntil - 20} 天` };
            isCutoffStopped = true;
            urgentTibetCount += 1;
          } else if (daysUntil <= 30) {
            stageBadge = { text: "⚠️ 最終收客期 (D-30警報)", color: "bg-amber-100 text-amber-900 border-amber-300", subText: `距D-25停止收客剩 ${daysUntil - 25} 天` };
            urgentTibetCount += 1;
          } else {
            stageBadge = { text: "🟢 正常收客中", color: "bg-emerald-100 text-emerald-800 border-emerald-200", subText: `距D-30最終收客剩 ${daysUntil - 30} 天` };
          }
        } else {
          if (daysUntil <= 20) {
            stageBadge = { text: "🟠 出團前20日準備", color: "bg-orange-100 text-orange-800 border-orange-200", subText: `倒數 ${daysUntil} 天出發` };
          } else if (daysUntil <= 30) {
            stageBadge = { text: "🟡 出發前30日衝刺", color: "bg-amber-100 text-amber-800 border-amber-200", subText: `倒數 ${daysUntil} 天出發` };
          } else {
            stageBadge = { text: "🟢 正常收客中", color: "bg-emerald-100 text-emerald-800 border-emerald-200", subText: `倒數 ${daysUntil} 天出發` };
          }
        }
      }

      return {
        ...sch,
        capacity,
        confirmedCount,
        pendingCount,
        totalOccupied,
        remainingConfirmed,
        remainingAll,
        daysUntil,
        stageBadge,
        isCutoffStopped,
        d30Date: formatOffsetDate(sch.startDate, -30),
        d25Date: formatOffsetDate(sch.startDate, -25),
        d20Date: formatOffsetDate(sch.startDate, -20)
      };
    });

    return {
      weeklyTotal,
      weeklyConfirmed,
      monthlyTotal,
      monthlyConfirmed,
      totalActive: activeOrders.length,
      totalConfirmedAll: activeOrders.filter(isConfirmed).length,
      urgentTibetCount,
      periodReports,
      scheduleRows
    };
  }, [orders, reportGranularity, boardSeriesFilter, customCapacities]);

  // 過濾電子看板的梯次列表
  const filteredBoardSchedules = useMemo(() => {
    return dashboardStats.scheduleRows.filter(sch => {
      if (boardSeriesFilter !== "全部系列" && sch.series !== boardSeriesFilter) return false;
      if (boardStatusFilter === "upcoming") {
        return sch.daysUntil === null || sch.daysUntil >= 0;
      }
      if (boardStatusFilter === "activeOnly") {
        return sch.totalOccupied > 0;
      }
      return true;
    });
  }, [dashboardStats.scheduleRows, boardSeriesFilter, boardStatusFilter]);

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
      <div className="max-w-[1440px] mx-auto relative">

        {/* 頂部導航列 */}
        <div className="flex justify-between items-center mb-6 border-b border-gray-300 pb-2">
          <div className="flex gap-2">
            <Link href="/query" className="bg-white text-gray-600 hover:text-gray-900 px-6 py-2 rounded-t-lg font-bold border border-b-0 border-gray-300">
              隊員報名查詢
            </Link>
            <div className="bg-[#2c3e50] text-white px-6 py-2 rounded-t-lg font-bold">管理員後台（內部專用）</div>
          </div>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
            ← 返回客戶首頁
          </Link>
        </div>

        {/* 報名名單總覽標頭與三大工作頁籤 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-100">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                陽光小屋業務與帳務管理系統
                {isLoading && <span className="text-sm font-normal text-blue-500 animate-pulse">資料同步中...</span>}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                系統總進單 <span className="font-bold text-gray-800">{orders.length}</span> 筆 ｜ 有效未取消 <span className="font-bold text-green-600">{dashboardStats.totalActive}</span> 筆
              </p>
            </div>

            <div className="flex items-center gap-3 mt-4 sm:mt-0">
              {activeTab !== "board" && (
                <>
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
                </>
              )}
              <button onClick={fetchOrders} className="bg-white border border-gray-300 text-gray-700 px-4 py-1.5 rounded text-sm hover:bg-gray-50 flex items-center gap-1 shadow-sm">
                <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                重新整理
              </button>
            </div>
          </div>

          {/* 三大階段工作頁籤 */}
          <div className="flex flex-wrap gap-3 pt-4">
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
                {orders.length}
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
                {orders.filter(o => ["已收到訂金", "已發送確認信", "報名成功"].includes(o["訂單狀態"])).length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("board")}
              className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
                activeTab === "board"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100"
              }`}
            >
              <span>📊 ③ 業務收客電子看板（內部戰情）</span>
              {dashboardStats.urgentTibetCount > 0 && (
                <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                  {dashboardStats.urgentTibetCount} 團警戒
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 頁籤 1：【訂金與新報名審核】                                */}
        {/* ========================================================= */}
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
                  const isProcessing = updatingId ===
