// 김은아 루틴 구성 — 단계별 플로우(Step) 정의.
// 루틴/질문을 추가·수정하려면 이 파일만 고치면 됩니다. (DB 마이그레이션은 새 컬럼 추가 시에만)

export const RTN_PERSON = "김은아";

// 체크 항목. minutes/menu 가 붙으면 체크 시 보조 입력이 나타납니다.
//  - minutes:true → nums[key + "_min"] 에 분 저장
//  - menu:true    → texts[key + "_menu"] 에 메뉴 저장
export type RtnItem = {
  key: string;
  label: string;
  kind: "check" | "time" | "number";
  target?: string; // time: 목표 시각 (예: "22:30")
  unit?: string; // number: 단위 (예: "kg")
  minutes?: boolean; // check: 분 입력 동반
  menu?: boolean; // check: 메뉴 입력 동반
};

export type Step =
  | { id: string; kind: "mood"; q: string; sub?: string }
  | { id: string; kind: "body"; q: string; sub?: string }
  | { id: string; kind: "time"; key: string; target?: string; q: string; sub?: string }
  | { id: string; kind: "todos"; q: string; sub?: string }
  | {
      id: string;
      kind: "note";
      field: "morning_note" | "night_note";
      q: string;
      sub?: string;
      placeholder?: string;
    }
  | { id: string; kind: "checks"; emoji: string; q: string; sub?: string; items: RtnItem[] };

export const STEPS: Step[] = [
  { id: "mood", kind: "mood", q: "오늘 기분은 어떤가요?", sub: "은아님, 좋은 하루예요 ☀️" },
  { id: "wake", kind: "time", key: "wake", q: "몇 시에 일어났어요?", sub: "기상 시간을 기록해요" },
  {
    id: "todos",
    kind: "todos",
    q: "오늘 더 하고 싶은 일이 있나요?",
    sub: "떠오르는 투두를 적어보세요",
  },
  {
    id: "morning_write",
    kind: "note",
    field: "morning_note",
    q: "일어나서 떠오르는 생각이 있나요?",
    sub: "가볍게 한 줄 적어도 좋아요",
    placeholder: "오늘 아침 떠오른 생각…",
  },
  {
    id: "morning",
    kind: "checks",
    emoji: "🌅",
    q: "아침 루틴을 체크해볼까요?",
    items: [
      { key: "weight", label: "몸무게 기록", kind: "number", unit: "kg" },
      { key: "walk", label: "동네 한 바퀴 돌기", kind: "check" },
      { key: "bike", label: "실내 자전거 타기", kind: "check", minutes: true },
      { key: "exercise", label: "맨손 체조 · 필라테스 기구", kind: "check" },
      { key: "wash_am", label: "씻기", kind: "check" },
      { key: "massage_am", label: "얼굴 마사지", kind: "check" },
      { key: "brunch", label: "아점 먹기", kind: "check", menu: true },
    ],
  },
  {
    id: "day",
    kind: "checks",
    emoji: "☀️",
    q: "낮에는 무엇을 했나요?",
    items: [
      { key: "sewing", label: "미싱 하기", kind: "check" },
      { key: "study", label: "일본어 공부하기", kind: "check" },
      { key: "reading_day", label: "책 보기", kind: "check" },
      { key: "housework", label: "집안일 하기", kind: "check" },
    ],
  },
  {
    id: "supplement",
    kind: "checks",
    emoji: "💊",
    q: "영양제 챙겼나요?",
    items: [
      { key: "probiotics", label: "유산균", kind: "check" },
      { key: "hemp_oil", label: "대마종자유", kind: "check" },
      { key: "joint", label: "관절약", kind: "check" },
    ],
  },
  {
    id: "evening",
    kind: "checks",
    emoji: "🌆",
    q: "저녁 시간이에요",
    items: [
      { key: "dinner", label: "저녁 먹기", kind: "check", menu: true },
      { key: "attendance_write", label: "개근 글 작성", kind: "check" },
      { key: "duolingo", label: "듀오링고 하기", kind: "check" },
      { key: "tasks_evening", label: "할 일 하기", kind: "check" },
    ],
  },
  {
    id: "night",
    kind: "checks",
    emoji: "🌙",
    q: "밤, 침실 루틴이에요",
    sub: "수면 패턴을 위해 22:30엔 침실로",
    items: [
      { key: "bedroom", label: "침실 도착 시각", kind: "time", target: "22:30" },
      { key: "wash_pm", label: "씻기", kind: "check" },
      { key: "massage_pm", label: "얼굴 마사지", kind: "check" },
      { key: "reading_pm", label: "책 읽다 잠들기", kind: "check" },
      { key: "sleep", label: "취침 시각", kind: "time" },
    ],
  },
  { id: "body", kind: "body", q: "오늘 몸 컨디션은 어땠어요?", sub: "무리하지 않았나요?" },
  {
    id: "night_write",
    kind: "note",
    field: "night_note",
    q: "오늘 하루를 한 줄로 마무리해볼까요?",
    sub: "짧아도 좋아요",
    placeholder: "오늘의 일기…",
  },
];

// 진행률 계산 대상 = 모든 checks 스텝의 check 항목
export const ALL_CHECK_KEYS = STEPS.flatMap((s) =>
  s.kind === "checks" ? s.items.filter((i) => i.kind === "check").map((i) => i.key) : []
);

export type Choice = { key: string; emoji: string; label: string };

// 기분 선택
export const MOODS: Choice[] = [
  { key: "great", emoji: "😄", label: "좋음" },
  { key: "good", emoji: "🙂", label: "괜찮음" },
  { key: "ok", emoji: "😐", label: "보통" },
  { key: "down", emoji: "😟", label: "별로" },
  { key: "bad", emoji: "😢", label: "힘듦" },
];

// 몸 컨디션 체크
export const BODYS: Choice[] = [
  { key: "light", emoji: "💪", label: "가뿐" },
  { key: "normal", emoji: "🙂", label: "보통" },
  { key: "heavy", emoji: "😮‍💨", label: "무거움" },
  { key: "sick", emoji: "🤒", label: "안 좋음" },
];

// 매일 은아가 생각해볼 질문 (날짜마다 하나씩 자동으로 바뀜)
export const QUESTIONS: string[] = [
  // 좋아하는 것
  "내가 제일 좋아하는 여행지는 어디인가요?",
  "내가 좋아하는 커피는 무엇인가요?",
  "내가 좋아하는 카페는 어디인가요?",
  "내가 좋아하는 거리는 어디인가요?",
  "내가 좋아하는 음식은 무엇인가요?",
  "내가 좋아하는 계절은 언제인가요?",
  "내가 좋아하는 색은 무엇인가요?",
  "내가 좋아하는 꽃은 무엇인가요?",
  "내가 좋아하는 노래는 무엇인가요?",
  "내가 좋아하는 영화는 무엇인가요?",
  "내가 좋아하는 향기는 무엇인가요?",
  "내가 좋아하는 날씨는 어떤 날씨인가요?",
  "내가 좋아하는 풍경은 어떤 모습인가요?",
  "내가 좋아하는 간식은 무엇인가요?",
  "내가 좋아하는 책은 무엇인가요?",
  "내가 좋아하는 드라마나 프로그램은 무엇인가요?",
  "내가 좋아하는 운동이나 활동은 무엇인가요?",
  "내가 좋아하는 산책길은 어디인가요?",
  "내가 가장 좋아하는 시간대는 언제인가요? (아침·낮·저녁·밤)",
  "내가 좋아하는 음료는 무엇인가요?",
  "내가 좋아하는 과일은 무엇인가요?",
  "내가 좋아하는 디저트는 무엇인가요?",
  // 동물·자연
  "나는 고양이를 왜 좋아할까요?",
  "나는 강아지를 왜 좋아할까요?",
  "동물을 보면 어떤 기분이 드나요?",
  "만약 동물이 된다면 어떤 동물이 되고 싶나요?",
  "비 오는 날, 나는 무엇을 하고 싶나요?",
  "눈 오는 날 떠오르는 기억이 있나요?",
  "바다와 산 중 어디가 더 좋은가요? 그 이유는요?",
  "내가 좋아하는 밤하늘은 어떤 모습인가요?",
  // 기분·마음
  "나는 언제 기분이 가장 좋나요?",
  "나는 언제 기분이 나빠지나요?",
  "나는 무엇을 할 때 가장 행복한가요?",
  "나는 언제 마음이 가장 편안해지나요?",
  "나는 무엇 때문에 자주 웃나요?",
  "나는 어떤 말을 들으면 힘이 나나요?",
  "나는 화가 날 때 어떻게 푸나요?",
  "나는 슬플 때 무엇을 하면 위로가 되나요?",
  "요즘 나를 가장 설레게 하는 것은 무엇인가요?",
  "요즘 가장 감사한 일은 무엇인가요?",
  "오늘 나에게 고마운 일 한 가지는 무엇인가요?",
  "나는 어떤 순간에 가장 나답다고 느끼나요?",
  "최근에 마음이 따뜻해졌던 순간이 있나요?",
  "나를 가장 든든하게 하는 것은 무엇인가요?",
  "오늘 나에게 칭찬 한마디를 한다면 무엇이라고 할까요?",
  // 추억
  "내가 제일 슬펐던 순간은 언제였나요?",
  "내가 가장 행복했던 순간은 언제였나요?",
  "내가 가장 자랑스러웠던 순간은 언제인가요?",
  "어릴 적 가장 좋아했던 놀이는 무엇이었나요?",
  "어릴 적 나의 꿈은 무엇이었나요?",
  "학창 시절 가장 기억에 남는 일은 무엇인가요?",
  "가장 기억에 남는 여행은 어디였나요?",
  "가장 맛있게 먹었던 음식은 무엇이었나요?",
  "잊을 수 없는 선물은 무엇이었나요?",
  "가장 그리운 시절은 언제인가요?",
  "내 인생에서 가장 큰 용기를 냈던 순간은 언제인가요?",
  "다시 돌아가고 싶은 순간이 있다면 언제인가요?",
  "가장 크게 웃었던 기억은 무엇인가요?",
  "내가 처음으로 무언가를 해냈던 기억은 무엇인가요?",
  // 사람·관계
  "나에게 가장 소중한 사람은 누구인가요?",
  "가족에게 가장 하고 싶은 말은 무엇인가요?",
  "다시 만나고 싶은 옛 친구가 있나요?",
  "요즘 가장 고마운 사람은 누구인가요?",
  "나를 가장 잘 이해해주는 사람은 누구인가요?",
  "내가 닮고 싶은 사람은 누구인가요?",
  "사랑하는 사람과 함께 꼭 해보고 싶은 일이 있나요?",
  "딸 다예에게 해주고 싶은 말이 있나요?",
  "남편에게 가장 고마운 점은 무엇인가요?",
  "나에게 힘이 되어주는 사람은 누구인가요?",
  "누군가에게 꼭 전하고 싶은 감사 인사가 있나요?",
  // 나 자신
  "나를 가장 잘 표현하는 단어 세 가지는 무엇인가요?",
  "나는 어떤 사람으로 기억되고 싶나요?",
  "내가 잘하는 것 한 가지는 무엇인가요?",
  "나는 상상력이 풍부한 사람인가요?",
  "나의 가장 큰 장점은 무엇이라고 생각하나요?",
  "나는 계획적인 사람인가요, 즉흥적인 사람인가요?",
  "시간 가는 줄 모르고 빠져드는 일은 무엇인가요?",
  "나만의 스트레스 해소법은 무엇인가요?",
  "혼자만의 시간에 무엇을 하면 가장 즐거운가요?",
  "내가 가장 평화로움을 느끼는 장소는 어디인가요?",
  "요즘 새롭게 배우고 싶은 것이 있나요?",
  "나에게 '쉼'이란 무엇인가요?",
  // 바람·미래
  "올해 이루고 싶은 작은 소원이 있나요?",
  "요즘 가장 기대하고 있는 일은 무엇인가요?",
  "10년 후의 나는 어떤 모습이면 좋겠나요?",
  "꼭 한번 가보고 싶은 여행지는 어디인가요?",
  "버킷리스트에 적고 싶은 한 가지는 무엇인가요?",
  "내가 만들어보고 싶은 요리는 무엇인가요?",
  "언젠가 키워보고 싶은 식물이나 동물이 있나요?",
  "앞으로 더 자주 하고 싶은 일은 무엇인가요?",
  // 상상·재미
  "만약 하루 동안 어디든 갈 수 있다면 어디로 가고 싶나요?",
  "만약 초능력이 하나 생긴다면 무엇을 갖고 싶나요?",
  "복권에 당첨된다면 가장 먼저 무엇을 하고 싶나요?",
  "과거의 나에게 한마디 해준다면 무엇이라고 할까요?",
  "미래의 나에게 편지를 쓴다면 어떤 말을 적고 싶나요?",
  "하루를 마음대로 보낼 수 있다면 무엇을 하고 싶나요?",
  "다시 태어난다면 어떤 일을 해보고 싶나요?",
  "내 인생을 영화로 만든다면 어떤 제목이 어울릴까요?",
  // 오늘
  "오늘 하루 중 가장 기억에 남는 장면은 무엇인가요?",
  "오늘 가장 맛있게 먹은 것은 무엇인가요?",
  "오늘 누구와 이야기를 나눴나요?",
  "오늘 가장 감사한 순간은 언제였나요?",
  "지금 이 순간 떠오르는 생각은 무엇인가요?",
];
