import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#121110] text-[#EDE8DF] font-sans flex flex-col selection:bg-[#8A1C14] selection:text-white relative overflow-hidden">
      
      {/* 藏地五色風馬旗意象飾條 (藍/天、白/雲、紅/火、綠/水、黃/土) */}
      <div className="h-1.5 w-full flex">
        <div className="flex-1 bg-[#1E40AF]"></div>
        <div className="flex-1 bg-[#F8FAFC]"></div>
        <div className="flex-1 bg-[#8A1C14]"></div>
        <div className="flex-1 bg-[#15803D]"></div>
        <div className="flex-1 bg-[#F59E0B]"></div>
      </div>

      {/* 背景裝飾光暈與西藏雪山質感 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#8A1C14]/25 via-[#F59E0B]/10 to-transparent blur-3xl pointer-events-none"></div>

      {/* 頂部輕量導航 */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex justify-between items-center border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-[0.3em] text-[#F59E0B] font-semibold">
            Tibet • Xinjiang • Silk Road Overland
          </span>
        </div>
        <Link 
          href="/admin" 
          className="text-xs text-stone-400 hover:text-white transition-colors border border-stone-700 hover:border-stone-500 rounded px-3 py-1"
        >
          業務後台登入
        </Link>
      </header>

      {/* 主視覺 Hero 區：Logo 大器置中 */}
      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 w-full relative z-10 flex flex-col items-center">
        
        {/* LOGO 主角區 */}
        <div className="flex flex-col items-center text-center mb-14">
          <div className="relative p-6 rounded-3xl bg-white/[0.04] border border-white/10 shadow-2xl backdrop-blur-md mb-6 hover:scale-105 transition-transform duration-500">
            <Image 
              src="/logo.png" 
              alt="陽光小屋旅遊 Sunny House Tours" 
              width={340} 
              height={340} 
              className="w-48 sm:w-60 md:w-72 h-auto object-contain drop-shadow-[0_10px_20px_rgba(138,28,20,0.4)]"
              priority
            />
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-wider text-white mb-3">
            客戶服務系統
          </h1>
          <p className="text-base sm:text-lg text-[#D1C7BD] max-w-2xl font-light tracking-wide">
            西藏秘境深度探索・此生必駕 318 國道重機自駕・新疆絲路極限探險
          </p>
        </div>

        {/* 三大入口卡片 (探險手札風格) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 w-full max-w-5xl">
          
          {/* 卡片一：行程報名 */}
          <Link href="/registration" className="group block">
            <div className="h-full bg-gradient-to-b from-[#1E1B18] to-[#171513] rounded-2xl p-7 border border-[#8A1C14]/40 hover:border-[#F59E0B] shadow-xl hover:shadow-[0_10px_30px_rgba(138,28,20,0.3)] transition-all duration-300 flex flex-col justify-between relative overflow-hidden group-hover:-translate-y-1.5">
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#8A1C14]/30 rounded-full blur-2xl group-hover:bg-[#F59E0B]/30 transition-colors"></div>
              
              <div>
                <div className="w-14 h-14 rounded-xl bg-[#8A1C14] text-white flex items-center justify-center mb-6 shadow-lg shadow-[#8A1C14]/40 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-[#8A1C14]/40 text-[#F59E0B] mb-2 border border-[#8A1C14]/60">
                  Step 1 • 即刻啟程
                </div>
                <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-[#F59E0B] transition-colors">
                  行程報名系統
                </h2>
                <p className="text-sm text-[#A89F91] leading-relaxed">
                  挑選出發檔期、填寫旅客個資與自駕規格，保留您的聖地探險名額。
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-white/10 flex items-center text-sm font-semibold text-[#F59E0B]">
                開始填寫報名表 <span className="ml-2 group-hover:translate-x-1.5 transition-transform">→</span>
              </div>
            </div>
          </Link>

          {/* 卡片二：客戶查詢 */}
          <Link href="/query" className="group block">
            <div className="h-full bg-gradient-to-b from-[#1E1B18] to-[#171513] rounded-2xl p-7 border border-white/10 hover:border-[#F59E0B] shadow-xl hover:shadow-[0_10px_30px_rgba(245,158,11,0.2)] transition-all duration-300 flex flex-col justify-between relative overflow-hidden group-hover:-translate-y-1.5">
              <div>
                <div className="w-14 h-14 rounded-xl bg-stone-800 border border-stone-700 text-[#F59E0B] flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-white/5 text-stone-300 mb-2 border border-white/10">
                  Step 2 • 訂單追蹤
                </div>
                <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-[#F59E0B] transition-colors">
                  客戶查詢系統
                </h2>
                <p className="text-sm text-[#A89F91] leading-relaxed">
                  輸入身分證號即時確認訂單進度、回填匯款帳號後五碼或獲取專屬刷卡付款連結。
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-white/10 flex items-center text-sm font-semibold text-stone-300 group-hover:text-[#F59E0B] transition-colors">
                查詢報名進度 <span className="ml-2 group-hover:translate-x-1.5 transition-transform">→</span>
              </div>
            </div>
          </Link>

          {/* 卡片三：證件上傳 (即將開放) */}
          <div className="h-full bg-[#171513]/60 rounded-2xl p-7 border border-white/5 opacity-60 flex flex-col justify-between relative cursor-not-allowed">
            <div>
              <div className="w-14 h-14 rounded-xl bg-stone-900 border border-stone-800 text-stone-500 flex items-center justify-center mb-6">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-stone-800 text-stone-400 mb-2">
                Step 3 • 證件審核
              </div>
              <h2 className="text-2xl font-bold text-stone-400 mb-2">
                上傳證件系統
              </h2>
              <p className="text-sm text-stone-500 leading-relaxed">
                入藏函辦理必備之護照與台胞證圖檔上傳作業，系統優化建置中。
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5 text-xs text-stone-500">
              敬請期待 • 專員現將主動協助收件
            </div>
          </div>

        </div>
      </main>

      {/* 頁尾版權與合法旅行社資訊 */}
      <footer className="relative z-10 border-t border-white/10 bg-[#0C0B0A] py-10 mt-auto text-xs text-[#8C8479]">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-2 leading-relaxed">
          <p className="text-sm font-bold text-[#D1C7BD] tracking-wider">陽光小屋旅遊 ｜ 德吉旅行社</p>
          <p>交觀甲第 7632 號 • 品保北 2082 號 • 甲種旅行業</p>
          <p>電子信箱：<a href="mailto:info@sunnyhousetours.com" className="text-[#F59E0B] hover:underline">info@sunnyhousetours.com</a> ｜ 地址：台北市松江路 200 號 4 樓之 5</p>
          <p className="pt-4 text-stone-600 font-mono text-[11px]">Copyright © Sunny House Tours. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
