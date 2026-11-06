"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans flex flex-col">
      {/* 頂部導覽列 (藏紅色頂邊飾條) */}
      <header className="bg-white shadow-sm border-t-8 border-[#8A1C14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* 簡易版太陽與小屋 Logo 意象 */}
            <div className="relative flex items-center justify-center w-10 h-10">
              <div className="absolute inset-0 bg-[#F59E0B] rounded-full opacity-20 animate-pulse"></div>
              <svg className="w-8 h-8 text-[#8A1C14]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="text-2xl font-extrabold tracking-wider text-gray-900">
              陽光小屋旅遊
            </span>
          </div>
        </div>
      </header>

      {/* 主要內容區 */}
      <main className="flex-grow max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[#8A1C14] mb-4 tracking-wide">
            客戶服務入口系統
          </h1>
          <p className="text-lg text-gray-600">西藏旅遊第一品牌・為您提供最專業的行程服務</p>
        </div>

        {/* 三大系統入口卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* 工具 A：報名系統 */}
          <Link href="/registration" className="group block">
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-b-4 border-transparent hover:border-[#F59E0B] h-full flex flex-col">
              <div className="bg-[#8A1C14] p-6 text-center group-hover:bg-[#9c221a] transition-colors">
                <svg className="w-12 h-12 text-white mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div className="p-6 flex-grow flex flex-col justify-center text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">行程報名系統</h2>
                <p className="text-gray-500">填寫旅客基本資料、選擇行程與梯次，並完成訂金繳付。</p>
              </div>
            </div>
          </Link>

          {/* 工具 B：查詢系統 */}
          <Link href="/query" className="group block">
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-b-4 border-transparent hover:border-[#F59E0B] h-full flex flex-col">
              <div className="bg-[#5c6b73] p-6 text-center group-hover:bg-[#4a565d] transition-colors">
                <svg className="w-12 h-12 text-white mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="p-6 flex-grow flex flex-col justify-center text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">客戶查詢系統</h2>
                <p className="text-gray-500">使用身分證字號查詢報名狀態、回填匯款後五碼或獲取刷卡連結。</p>
              </div>
            </div>
          </Link>

          {/* 工具 C：上傳系統 */}
          <Link href="/upload" className="group block">
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-b-4 border-transparent hover:border-[#F59E0B] h-full flex flex-col">
              <div className="bg-[#d4a373] p-6 text-center group-hover:bg-[#c29161] transition-colors">
                <svg className="w-12 h-12 text-white mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <div className="p-6 flex-grow flex flex-col justify-center text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">上傳證件系統</h2>
                <p className="text-gray-500">報名成功後，於此處上傳護照、台胞證等入藏必備證件圖檔。</p>
              </div>
            </div>
          </Link>

        </div>
      </main>

      {/* 頁尾版權與聯絡資訊 (依照公司名片圖片置入) */}
      <footer className="bg-[#f0ede6] text-gray-600 py-10 mt-auto border-t border-[#e2ddd3]">
        <div className="max-w-7xl mx-auto px-4 text-center sm:text-sm leading-relaxed">
          <p className="font-semibold text-gray-800 mb-2 text-lg">陽光小屋旅遊</p>
          <p>交觀甲第7632號 品保北2082</p>
          <p>電子信箱：<a href="mailto:info@sunnyhousetours.com" className="text-[#8A1C14] hover:underline">info@sunnyhousetours.com</a></p>
          <p>德吉旅行社 台北市松江路200號4樓之5 甲種旅行業</p>
          <p className="mt-6 text-xs text-gray-400">Copyright © Sunny House Tours. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
