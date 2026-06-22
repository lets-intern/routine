import { createBrowserClient } from "@supabase/ssr";

// routine-kim 전용 Supabase 프로젝트
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 미설정 상태에서도 페이지가 흰 화면으로 죽지 않도록 null 반환
export const createClient = () =>
  url && key ? createBrowserClient(url, key) : null;
