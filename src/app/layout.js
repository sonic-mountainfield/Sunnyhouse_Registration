import "./globals.css";

export const metadata = {
  title: "陽光小屋旅遊客戶服務系統",
  description: "西藏旅遊第一品牌・為您提供最專業的行程服務",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}
