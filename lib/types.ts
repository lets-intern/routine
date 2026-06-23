// 루틴 기록 데이터 타입 (supabase/routine_schema.sql 와 1:1)

export type Todo = { id: string; text: string; done: boolean };

// 오늘의 질문에 대한 답변
export type QA = { id: string; q: string; a: string };

// 사용자가 직접 추가한 루틴 항목 (rtn_items 테이블)
export type CustomItem = {
  id: string; // 체크 key 로도 사용
  label: string;
  section: string; // morning/day/supplement/evening/night
};

export type RtnDay = {
  date: string; // YYYY-MM-DD (PK)
  checks: Record<string, boolean>;
  times: Record<string, string>;
  nums: Record<string, number>;
  texts: Record<string, string>; // 메뉴 등 자유 입력 (brunch_menu, dinner_menu)
  todos: Todo[]; // 오늘의 투두
  qa: QA[]; // 오늘의 질문 답변
  mood: string; // 기분 선택 (MOODS 의 key)
  body: string; // 몸 컨디션 (BODYS 의 key)
  morning_note: string; // 아침 글쓰기
  night_note: string; // 자기 전 짧은 일기
};

export type RtnTextField = "mood" | "body" | "morning_note" | "night_note";

export function emptyDay(date: string): RtnDay {
  return {
    date,
    checks: {},
    times: {},
    nums: {},
    texts: {},
    todos: [],
    qa: [],
    mood: "",
    body: "",
    morning_note: "",
    night_note: "",
  };
}
