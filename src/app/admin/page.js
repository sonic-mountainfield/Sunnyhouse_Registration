"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 登入驗證 (簡易密碼防護)
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
      // 反轉讓最新報名的在最上面
      setOrders(data.reverse());
    } catch (error) {
      console.error("載入失敗:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-sm w-full">
          <h2 className="text-2xl font-bold text-center mb-6 text-[#8A1C14]">陽光小屋 - 業務後台登入</h2>
          <form onSubmit={handleLogin}>
            <input 
              type="password" 
              placeholder="請輸入管理員密碼" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-3 rounded mb-4 focus:ring-[#8A1C14]"
              required
            />
            <button type="submit" className="w-full bg-[#8A1C14] text-white py-3 rounded font-bold">登入系統</button>
          </form>
          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:underline">返回客戶首頁</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">報名訂單管理總覽</h1>
          <div className="flex gap-4">
            <button onClick={fetchOrders} className="bg-blue-600 text-white px-4 py-2 rounded text-sm">重新整理資料</button>
            <a href="https://docs.google.com/spreadsheets" target="_blank" rel="noopener noreferrer" className="bg-green-600 text-white px-4 py-2 rounded text-sm flex items-center gap-1">
              前往 Google Sheets 編輯
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          {isLoading ? (
            <div className="p-10 text-center text-gray-500">載入資料中...</div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="p-3 font-semibold text-gray-700">報名時間</th>
                  <th className="p-3 font-semibold text-gray-700">姓名/電話</th>
                  <th className="p-3 font-semibold text-gray-700">行程名稱 (檔期)</th>
                  <th className="p-3 font-semibold text-gray-700">支付方式</th>
                  <th className="p-3 font-semibold text-gray-700">訂單狀態</th>
                  <th className="p-3 font-semibold text-gray-700">匯款後五碼</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-orange-50">
                    <td className="p-3 text-gray-500 text-xs">{order["報名時間"]}</td>
                    <td className="p-3">
                      <div className="font-bold text-gray-800">{order["中文姓名"]}</div>
                      <div className="text-xs text-gray-500">{order["手機號碼"]}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-[#8A1C14] truncate max-w-xs">{order["行程名稱"]}</div>
                      <div className="text-xs text-gray-500">{order["出團檔期"]}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${order["支付方式"] === '刷卡' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                        {order["支付方式"]}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-orange-700">{order["訂單狀態"]}</td>
                    <td className="p-3 font-mono">{order["客戶匯款後五碼"] || "-"}</td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan="6" className="p-6 text-center text-gray-500">目前尚無任何報名紀錄。</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
