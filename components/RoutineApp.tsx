"use client";

import { useMemo, useState } from "react";
import { RtnStoreProvider, useRtn } from "./store";
import {
  ALL_CHECK_KEYS,
  BODYS,
  MOODS,
  QUESTIONS,
  STEPS,
  type Choice,
  type RtnItem,
  type Step,
} from "@/lib/constants";
import type { RtnDay } from "@/lib/types";
import { addDays, ymd } from "@/lib/utils";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function fmtKDate(date: string): string {
  const d = new Date(date + "T00:00");
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAYS[d.getDay()]})`;
}

function dayPct(rec: RtnDay | undefined): number {
  if (!rec) return 0;
  const done = ALL_CHECK_KEYS.filter((k) => rec.checks[k]).length;
  return Math.round((done / ALL_CHECK_KEYS.length) * 100);
}

// 체크 key → 라벨 (모아보기에서 사용)
const CHECK_LABELS: Record<string, string> = {};
STEPS.forEach((s) => {
  if (s.kind === "checks")
    s.items.forEach((it) => {
      if (it.kind === "check") CHECK_LABELS[it.key] = it.label;
    });
});
const MOOD_MAP = Object.fromEntries(MOODS.map((m) => [m.key, m]));
const BODY_MAP = Object.fromEntries(BODYS.map((b) => [b.key, b]));

function fmtMD(date: string): string {
  const d = new Date(date + "T00:00");
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/* ───────────────────────── 항목 렌더러 (체크 · 시각) ───────────────────────── */

function ItemRow({ it, date }: { it: RtnItem; date: string }) {
  const { getDay, toggleCheck, setTime, setNum, setText } = useRtn();
  const day = getDay(date);

  if (it.kind === "time") {
    return (
      <label className="rtn-field">
        <span className="rtn-field-label">
          {it.label}
          {it.target && <em className="rtn-target">목표 {it.target}</em>}
        </span>
        <input
          type="time"
          value={day.times[it.key] || ""}
          onChange={(e) => setTime(date, it.key, e.target.value)}
        />
      </label>
    );
  }

  if (it.kind === "number") {
    return (
      <label className="rtn-field">
        <span className="rtn-field-label">{it.label}</span>
        <span className="rtn-numfield">
          <input
            type="number"
            min={0}
            step="0.1"
            inputMode="decimal"
            placeholder="0"
            value={day.nums[it.key] ? String(day.nums[it.key]) : ""}
            onChange={(e) => setNum(date, it.key, Number(e.target.value) || 0)}
          />
          {it.unit && <i>{it.unit}</i>}
        </span>
      </label>
    );
  }

  const on = !!day.checks[it.key];
  return (
    <div className="rtn-item">
      <button
        className={`rtn-check${on ? " on" : ""}`}
        onClick={() => toggleCheck(date, it.key)}
      >
        <span className="rtn-box">{on ? "✓" : ""}</span>
        <span className="rtn-check-label">{it.label}</span>
      </button>

      {on && it.minutes && (
        <div className="rtn-addon">
          <input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="0"
            value={day.nums[it.key + "_min"] ? String(day.nums[it.key + "_min"]) : ""}
            onChange={(e) => setNum(date, it.key + "_min", Number(e.target.value) || 0)}
          />
          <span>분 탔어요</span>
        </div>
      )}
      {on && it.menu && (
        <div className="rtn-addon">
          <input
            type="text"
            placeholder="무엇을 먹었나요?"
            value={day.texts[it.key + "_menu"] || ""}
            onChange={(e) => setText(date, it.key + "_menu", e.target.value)}
          />
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── 스텝 본문 ───────────────────────── */

function ChoiceRow({
  options,
  field,
  date,
  big,
}: {
  options: Choice[];
  field: "mood" | "body";
  date: string;
  big?: boolean;
}) {
  const { getDay, setChoice } = useRtn();
  const sel = getDay(date)[field];
  return (
    <div className={`rtn-choices${big ? " big" : ""}`}>
      {options.map((c) => (
        <button
          key={c.key}
          className={`rtn-choice${sel === c.key ? " on" : ""}`}
          onClick={() => setChoice(date, field, c.key)}
        >
          <span>{c.emoji}</span>
          {c.label}
        </button>
      ))}
    </div>
  );
}

function TodoBlock({ date }: { date: string }) {
  const { getDay, addTodo, toggleTodo, editTodo, removeTodo } = useRtn();
  const day = getDay(date);
  const [draft, setDraft] = useState("");

  const add = () => {
    const t = draft.trim();
    if (!t) return;
    addTodo(date, t);
    setDraft("");
  };

  return (
    <div className="rtn-todos">
      <div className="rtn-todo-add">
        <input
          type="text"
          placeholder="할 일을 입력하고 Enter"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <button onClick={add}>추가</button>
      </div>
      {day.todos.length === 0 ? (
        <p className="rtn-todo-empty">아직 추가한 투두가 없어요</p>
      ) : (
        <ul className="rtn-todo-list">
          {day.todos.map((t) => (
            <li key={t.id} className={t.done ? "done" : ""}>
              <button
                className={`rtn-box${t.done ? " on" : ""}`}
                onClick={() => toggleTodo(date, t.id)}
              >
                {t.done ? "✓" : ""}
              </button>
              <input
                value={t.text}
                onChange={(e) => editTodo(date, t.id, e.target.value)}
              />
              <button className="rtn-todo-del" onClick={() => removeTodo(date, t.id)}>
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StepBody({ step, date }: { step: Step; date: string }) {
  const { getDay, setTime, setField } = useRtn();
  const day = getDay(date);

  switch (step.kind) {
    case "mood":
      return <ChoiceRow options={MOODS} field="mood" date={date} big />;
    case "body":
      return <ChoiceRow options={BODYS} field="body" date={date} big />;
    case "time":
      return (
        <div className="rtn-time-big">
          <input
            type="time"
            value={day.times[step.key] || ""}
            onChange={(e) => setTime(date, step.key, e.target.value)}
          />
          {step.target && <span className="rtn-target">목표 {step.target}</span>}
        </div>
      );
    case "todos":
      return <TodoBlock date={date} />;
    case "note":
      return (
        <textarea
          className="rtn-note"
          placeholder={step.placeholder}
          value={day[step.field]}
          onChange={(e) => setField(date, step.field, e.target.value)}
        />
      );
    case "checks":
      return (
        <div className="rtn-items">
          {step.items.map((it) => (
            <ItemRow key={it.key} it={it} date={date} />
          ))}
        </div>
      );
  }
}

/* ───────────────────────── 단계별 플로우 ───────────────────────── */

function DayFlow({
  date,
  onBack,
  onOverview,
}: {
  date: string;
  onBack: () => void;
  onOverview: () => void;
}) {
  const [i, setI] = useState(0);
  const step = STEPS[i];
  const last = i === STEPS.length - 1;
  const stepEmoji = step.kind === "checks" ? step.emoji : "🌿";

  return (
    <div className="rtn-flow">
      <div className="rtn-flow-bar">
        <button className="rtn-iconbtn" onClick={onBack} aria-label="달력으로">
          ‹
        </button>
        <b>{fmtKDate(date)}</b>
        <button className="rtn-textbtn" onClick={onOverview}>
          한눈에 보기
        </button>
      </div>

      <div className="rtn-progress-line">
        {STEPS.map((s, idx) => (
          <span
            key={s.id}
            className={`seg${idx < i ? " done" : ""}${idx === i ? " cur" : ""}`}
            onClick={() => setI(idx)}
          />
        ))}
      </div>

      <div className="rtn-step" key={step.id}>
        <div className="rtn-step-emoji">{stepEmoji}</div>
        <h2 className="rtn-step-q">{step.q}</h2>
        {step.sub && <p className="rtn-step-sub">{step.sub}</p>}
        <div className="rtn-step-body">
          <StepBody step={step} date={date} />
        </div>
      </div>

      <div className="rtn-flow-nav">
        <button className="rtn-nav-prev" disabled={i === 0} onClick={() => setI(i - 1)}>
          이전
        </button>
        <span className="rtn-step-count">
          {i + 1} / {STEPS.length}
        </span>
        {last ? (
          <button className="rtn-nav-next done" onClick={onBack}>
            기록 완료 ✓
          </button>
        ) : (
          <button className="rtn-nav-next" onClick={() => setI(i + 1)}>
            다음 →
          </button>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────── 한눈에 보기 (전체 편집) ───────────────────────── */

function DayOverview({
  date,
  onBack,
  onFlow,
}: {
  date: string;
  onBack: () => void;
  onFlow: () => void;
}) {
  return (
    <div className="rtn-overview">
      <div className="rtn-flow-bar">
        <button className="rtn-iconbtn" onClick={onBack} aria-label="달력으로">
          ‹
        </button>
        <b>{fmtKDate(date)}</b>
        <button className="rtn-textbtn" onClick={onFlow}>
          단계별로
        </button>
      </div>

      {STEPS.map((step) => (
        <section key={step.id} className="rtn-card rtn-ov-sec">
          <h3 className="rtn-ov-title">
            <span>{step.kind === "checks" ? step.emoji : "🌿"}</span>
            {step.q}
          </h3>
          <StepBody step={step} date={date} />
        </section>
      ))}
    </div>
  );
}

/* ───────────────────────── 캘린더 대시보드 ───────────────────────── */

/* ───────────────────────── 오늘의 질문 ───────────────────────── */

function QuestionCard() {
  const { getDay, addAnswer } = useRtn();
  const today = ymd(new Date());
  const dayNum = Math.floor(new Date(today + "T00:00").getTime() / 86400000);
  const [extra, setExtra] = useState(0);
  const [writing, setWriting] = useState(false);
  const [draft, setDraft] = useState("");
  const idx = (((dayNum + extra) % QUESTIONS.length) + QUESTIONS.length) % QUESTIONS.length;
  const question = QUESTIONS[idx];
  const answeredToday = getDay(today).qa.some((x) => x.q === question);

  const save = () => {
    const a = draft.trim();
    if (!a) return;
    addAnswer(today, question, a);
    setDraft("");
    setWriting(false);
  };

  const next = () => {
    setExtra((e) => e + 1);
    setWriting(false);
    setDraft("");
  };

  return (
    <section className="rtn-card rtn-qcard">
      <div className="rtn-q-label">💭 오늘 은아가 생각해볼 질문</div>
      <p className="rtn-q-text">{question}</p>

      {writing ? (
        <div className="rtn-q-answer">
          <textarea
            autoFocus
            placeholder="여기에 답을 적어보세요…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <div className="rtn-q-answer-btns">
            <button className="rtn-q-cancel" onClick={() => setWriting(false)}>
              취소
            </button>
            <button className="rtn-q-save" onClick={save}>
              저장
            </button>
          </div>
        </div>
      ) : (
        <div className="rtn-q-btns">
          <button className="rtn-q-shuffle" onClick={next}>
            다른 질문 보기 ↻
          </button>
          <button className="rtn-q-reply" onClick={() => setWriting(true)}>
            {answeredToday ? "또 대답하기 ✎" : "대답하기 ✎"}
          </button>
        </div>
      )}

      {answeredToday && !writing && (
        <p className="rtn-q-done">오늘 이 질문에 답했어요 ✓ (모아보기에서 볼 수 있어요)</p>
      )}
    </section>
  );
}

/* ───────────────────────── 다예 사진보기 ───────────────────────── */

function Photos({ onBack, photos }: { onBack: () => void; photos: string[] }) {
  return (
    <div className="rtn-photos">
      <div className="rtn-flow-bar">
        <button className="rtn-iconbtn" onClick={onBack} aria-label="달력으로">
          ‹
        </button>
        <b>다예 사진보기</b>
        <span style={{ width: 40 }} />
      </div>
      {photos.length === 0 && (
        <p className="rtn-arc-empty">아직 사진이 없어요.</p>
      )}
      <div className="rtn-photo-grid">
        {photos.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt={`사진 ${i + 1}`}
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────── 캘린더 대시보드 ───────────────────────── */

function Calendar({
  onPick,
  onArchive,
  onPhotos,
}: {
  onPick: (date: string) => void;
  onArchive: () => void;
  onPhotos: () => void;
}) {
  const { days } = useRtn();
  const today = new Date(ymd(new Date()) + "T00:00");
  const todayStr = ymd(today);
  const [cur, setCur] = useState({ y: today.getFullYear(), m: today.getMonth() });

  const cells = useMemo(() => {
    const first = new Date(cur.y, cur.m, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(cur.y, cur.m + 1, 0).getDate();
    const out: (string | null)[] = [];
    for (let p = 0; p < startPad; p++) out.push(null);
    for (let d = 1; d <= daysInMonth; d++) out.push(ymd(new Date(cur.y, cur.m, d)));
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [cur]);

  // 이번 달 기록한 날 수 + 오늘 기준 연속 기록
  const recordedThisMonth = cells.filter(
    (c) => c && days[c] && dayPct(days[c]) > 0
  ).length;
  let streak = 0;
  for (let k = 0; ; k++) {
    const d = ymd(addDays(today, -k));
    if (days[d] && dayPct(days[d]) > 0) streak++;
    else break;
  }

  const prevMonth = () =>
    setCur(({ y, m }) => (m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 }));
  const nextMonth = () =>
    setCur(({ y, m }) => (m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 }));
  const isFutureMonth = cur.y > today.getFullYear() || (cur.y === today.getFullYear() && cur.m >= today.getMonth());

  return (
    <div className="rtn-cal">
      <QuestionCard />

      <div className="rtn-cal-stats">
        <div className="rtn-stat">
          <b>{streak}</b>
          <span>연속 기록</span>
        </div>
        <div className="rtn-stat">
          <b>{recordedThisMonth}</b>
          <span>이번 달 기록</span>
        </div>
        <button className="rtn-today-btn" onClick={() => onPick(todayStr)}>
          오늘 기록하기 →
        </button>
      </div>

      <div className="rtn-nav-row">
        <button onClick={onArchive}>📖 기록 모아보기</button>
        <button onClick={onPhotos}>📷 다예 사진보기</button>
      </div>

      <div className="rtn-cal-head">
        <button className="rtn-iconbtn" onClick={prevMonth} aria-label="이전 달">
          ‹
        </button>
        <b>
          {cur.y}년 {cur.m + 1}월
        </b>
        <button
          className="rtn-iconbtn"
          onClick={nextMonth}
          disabled={isFutureMonth}
          aria-label="다음 달"
        >
          ›
        </button>
      </div>

      <div className="rtn-cal-weekdays">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>

      <div className="rtn-cal-grid">
        {cells.map((c, idx) => {
          if (!c) return <span key={idx} className="rtn-cal-cell empty" />;
          const rec = days[c];
          const pct = dayPct(rec);
          const future = c > todayStr;
          const isToday = c === todayStr;
          const dnum = Number(c.slice(8, 10));
          const hasTodo = rec && rec.todos && rec.todos.length > 0;
          return (
            <button
              key={c}
              className={`rtn-cal-cell${isToday ? " today" : ""}${future ? " future" : ""}`}
              disabled={future}
              onClick={() => onPick(c)}
              style={
                pct > 0
                  ? { background: `rgba(44,122,63,${0.12 + (pct / 100) * 0.5})` }
                  : undefined
              }
            >
              <i>{dnum}</i>
              {pct >= 100 && <em className="rtn-cal-done">✓</em>}
              {hasTodo && pct < 100 && <em className="rtn-cal-dot" />}
            </button>
          );
        })}
      </div>

      <WeightChart days={days} />
    </div>
  );
}

/* ───────────────────────── 몸무게 선그래프 ───────────────────────── */

function WeightChart({ days }: { days: Record<string, RtnDay> }) {
  const points = useMemo(
    () =>
      Object.values(days)
        .filter((d) => Number(d.nums?.weight) > 0)
        .map((d) => ({ date: d.date, w: Number(d.nums.weight) }))
        .sort((a, b) => (a.date < b.date ? -1 : 1))
        .slice(-30),
    [days]
  );

  return (
    <section className="rtn-card rtn-section">
      <h2 className="rtn-section-title">
        <span>⚖️</span>몸무게 변화
      </h2>
      {points.length < 2 ? (
        <p className="rtn-chart-empty">몸무게를 2일 이상 기록하면 변화 그래프가 보여요.</p>
      ) : (
        (() => {
          const W = 320,
            H = 150,
            padX = 30,
            padT = 24,
            padB = 22;
          const ws = points.map((p) => p.w);
          const min = Math.min(...ws);
          const max = Math.max(...ws);
          const span = max - min || 1;
          const X = (i: number) =>
            padX + (i / (points.length - 1)) * (W - padX * 2);
          const Y = (w: number) =>
            padT + (1 - (w - min) / span) * (H - padT - padB);
          const line = points.map((p, i) => `${X(i)},${Y(p.w)}`).join(" ");
          const area = `${X(0)},${H - padB} ${line} ${X(points.length - 1)},${H - padB}`;
          const last = points[points.length - 1];
          const first = points[0];
          const delta = Math.round((last.w - first.w) * 10) / 10;

          return (
            <>
              <div className="rtn-weight-head">
                <b>{last.w}kg</b>
                <span className={delta === 0 ? "" : delta < 0 ? "down" : "up"}>
                  {delta === 0
                    ? "변화 없음"
                    : `${delta > 0 ? "▲ +" : "▼ "}${Math.abs(delta)}kg (기록 시작 대비)`}
                </span>
              </div>
              <svg
                className="rtn-weight-svg"
                viewBox={`0 0 ${W} ${H}`}
                preserveAspectRatio="none"
                role="img"
                aria-label="몸무게 변화 그래프"
              >
                <defs>
                  <linearGradient id="wfill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <text x={padX - 6} y={Y(max) + 4} className="rtn-waxis" textAnchor="end">
                  {max}
                </text>
                <text x={padX - 6} y={Y(min) + 4} className="rtn-waxis" textAnchor="end">
                  {min}
                </text>
                <polygon points={area} fill="url(#wfill)" />
                <polyline
                  points={line}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {points.map((p, i) => (
                  <circle
                    key={p.date}
                    cx={X(i)}
                    cy={Y(p.w)}
                    r={i === points.length - 1 ? 4 : 2.5}
                    fill={i === points.length - 1 ? "var(--accent)" : "var(--surface)"}
                    stroke="var(--accent)"
                    strokeWidth="2"
                  />
                ))}
                <text x={X(0)} y={H - 6} className="rtn-wxlabel" textAnchor="start">
                  {fmtMD(first.date)}
                </text>
                <text
                  x={X(points.length - 1)}
                  y={H - 6}
                  className="rtn-wxlabel"
                  textAnchor="end"
                >
                  {fmtMD(last.date)}
                </text>
              </svg>
            </>
          );
        })()
      )}
    </section>
  );
}

/* ───────────────────────── 모아보기 (기록 아카이브) ───────────────────────── */

function Archive({
  onBack,
  onPick,
}: {
  onBack: () => void;
  onPick: (date: string) => void;
}) {
  const { days, removeAnswer } = useRtn();
  const [tab, setTab] = useState<"diary" | "done" | "qa">("diary");

  const sorted = useMemo(
    () => Object.values(days).sort((a, b) => (a.date < b.date ? 1 : -1)),
    [days]
  );

  const diaryDays = sorted.filter((d) => d.morning_note || d.night_note);
  // 질문 답변: 날짜별 qa 를 펼쳐 최신순으로
  const qaItems = sorted.flatMap((d) =>
    d.qa.map((x) => ({ ...x, date: d.date }))
  );
  const doneDays = sorted.filter(
    (d) =>
      Object.values(d.checks).some(Boolean) ||
      d.todos.length > 0 ||
      Object.values(d.texts).some((v) => v) ||
      Number(d.nums?.weight) > 0
  );

  return (
    <div className="rtn-archive">
      <div className="rtn-flow-bar">
        <button className="rtn-iconbtn" onClick={onBack} aria-label="달력으로">
          ‹
        </button>
        <b>모아보기</b>
        <span style={{ width: 40 }} />
      </div>

      <div className="rtn-arc-tabs">
        <button
          className={tab === "diary" ? "on" : ""}
          onClick={() => setTab("diary")}
        >
          📖 일기 모아보기
        </button>
        <button
          className={tab === "done" ? "on" : ""}
          onClick={() => setTab("done")}
        >
          ✅ 한 일 모아보기
        </button>
        <button
          className={tab === "qa" ? "on" : ""}
          onClick={() => setTab("qa")}
        >
          💭 질문 답변
        </button>
      </div>

      {tab === "diary" &&
        (diaryDays.length === 0 ? (
          <p className="rtn-arc-empty">아직 작성한 일기가 없어요.</p>
        ) : (
          diaryDays.map((d) => {
            const mood = MOOD_MAP[d.mood];
            return (
              <section
                key={d.date}
                className="rtn-card rtn-arc-item"
                onClick={() => onPick(d.date)}
              >
                <div className="rtn-arc-date">
                  {fmtKDate(d.date)}
                  {mood && <span className="rtn-arc-emoji">{mood.emoji}</span>}
                </div>
                {d.morning_note && (
                  <p className="rtn-arc-note">
                    <b>아침</b> {d.morning_note}
                  </p>
                )}
                {d.night_note && (
                  <p className="rtn-arc-note">
                    <b>밤</b> {d.night_note}
                  </p>
                )}
              </section>
            );
          })
        ))}

      {tab === "qa" &&
        (qaItems.length === 0 ? (
          <p className="rtn-arc-empty">
            아직 답한 질문이 없어요. 대시보드의 &lsquo;오늘의 질문&rsquo;에서 대답해 보세요.
          </p>
        ) : (
          qaItems.map((x) => (
            <section key={x.id} className="rtn-card rtn-arc-item rtn-qa-item">
              <div className="rtn-qa-q">
                <span>Q.</span> {x.q}
              </div>
              <p className="rtn-qa-a">{x.a}</p>
              <div className="rtn-qa-foot">
                <span className="rtn-qa-date">{fmtKDate(x.date)}</span>
                <button
                  className="rtn-qa-del"
                  onClick={() => removeAnswer(x.date, x.id)}
                >
                  삭제
                </button>
              </div>
            </section>
          ))
        ))}

      {tab === "done" &&
        (doneDays.length === 0 ? (
          <p className="rtn-arc-empty">아직 기록한 활동이 없어요.</p>
        ) : (
          doneDays.map((d) => {
          const mood = MOOD_MAP[d.mood];
          const body = BODY_MAP[d.body];
          const doneChecks = [
            ...new Set(
              Object.keys(d.checks)
                .filter((k) => d.checks[k] && CHECK_LABELS[k])
                .map((k) => CHECK_LABELS[k])
            ),
          ];
          const weight = Number(d.nums?.weight) > 0 ? d.nums.weight : null;
          const brunch = d.texts["brunch_menu"];
          const dinner = d.texts["dinner_menu"];
          return (
            <section
              key={d.date}
              className="rtn-card rtn-arc-item"
              onClick={() => onPick(d.date)}
            >
              <div className="rtn-arc-date">
                {fmtKDate(d.date)}
                <span className="rtn-arc-emoji">
                  {mood && mood.emoji}
                  {body && body.emoji}
                </span>
                {weight && <em className="rtn-arc-weight">{weight}kg</em>}
              </div>
              {doneChecks.length > 0 && (
                <div className="rtn-arc-tags">
                  {doneChecks.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              )}
              {(brunch || dinner) && (
                <p className="rtn-arc-menu">
                  🍚 {[brunch && `아점 ${brunch}`, dinner && `저녁 ${dinner}`]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
              {d.todos.length > 0 && (
                <ul className="rtn-arc-todos">
                  {d.todos.map((t) => (
                    <li key={t.id} className={t.done ? "done" : ""}>
                      {t.done ? "✓" : "○"} {t.text}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })
        ))}
    </div>
  );
}

/* ───────────────────────── 앱 셸 ───────────────────────── */

function AppInner({ photos }: { photos: string[] }) {
  const { loading, error, toastMsg } = useRtn();
  const [date, setDate] = useState<string | null>(null);
  const [mode, setMode] = useState<"flow" | "overview">("flow");
  const [home, setHome] = useState<"calendar" | "archive" | "photos">("calendar");

  const openDay = (d: string) => {
    setMode("flow");
    setDate(d);
  };

  return (
    <div className="rtn-wrap">
      <header className="rtn-top">
        <div className="rtn-brand">
          <span className="rtn-mark">🌿</span>
          <b>다예가 만들어준 김은아 루틴 대시보드</b>
        </div>
        <div className={`rtn-sync${loading ? "" : " live"}`}>
          <span className="rtn-dot" />
          {loading ? "연결 중" : error ? "오류" : "저장됨"}
        </div>
      </header>

      <main className="rtn-main">
        {error && (
          <div className="rtn-card rtn-error">
            <b>기록을 불러오지 못했어요.</b>
            <div>
              Supabase 테이블이 아직 없을 수 있어요. <code>supabase/routine_schema.sql</code>{" "}
              을 실행한 뒤 새로고침하세요. ({error})
            </div>
          </div>
        )}

        {date !== null ? (
          mode === "flow" ? (
            <DayFlow
              date={date}
              onBack={() => setDate(null)}
              onOverview={() => setMode("overview")}
            />
          ) : (
            <DayOverview
              date={date}
              onBack={() => setDate(null)}
              onFlow={() => setMode("flow")}
            />
          )
        ) : home === "archive" ? (
          <Archive onBack={() => setHome("calendar")} onPick={openDay} />
        ) : home === "photos" ? (
          <Photos onBack={() => setHome("calendar")} photos={photos} />
        ) : (
          <Calendar
            onPick={openDay}
            onArchive={() => setHome("archive")}
            onPhotos={() => setHome("photos")}
          />
        )}
      </main>

      <div id="toast" className={toastMsg ? "show" : ""}>
        {toastMsg}
      </div>
    </div>
  );
}

export default function RoutineApp({ photos = [] }: { photos?: string[] }) {
  return (
    <RtnStoreProvider>
      <AppInner photos={photos} />
    </RtnStoreProvider>
  );
}
