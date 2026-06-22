import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "김은아 루틴",
  description: "매일의 루틴을 기록하는 개인 페이지",
  robots: { index: false, follow: false },
};

// 모바일(갤럭시 노트 등) 최적화 — 가로 꽉 차게, 입력 포커스 시 확대 방지
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#f6f5f1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
