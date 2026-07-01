import React, { useState, useEffect } from "react";
import {
  BRAND, C, CATS, LIFELINES, TYPE_META, TYPE_ICON,
  AR_NUM, freshLifelines,
} from "./data.js";
import { sfx, setMuted } from "./sound.js";
import { usePersistedState, clearPersisted } from "./usePersistedState.js";

// ============================================================
// بنات وبس — girls-first diwaniya trivia game (v3)
// Seen Jeem-style engine: 2 teams · 6 categories · 36 questions.
// v3 adds: sound, resume-on-refresh, score correction, undo,
// a how-to-play sheet, ring timers, and a proper brand mark.
// ============================================================

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Lalezar&family=Tajawal:wght@400;500;700;800&display=swap');
* { box-sizing: border-box; }
button { font-family: inherit; }
@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
@keyframes pop { 0%{transform:scale(.85);opacity:0} 100%{transform:scale(1);opacity:1} }
@keyframes floaty { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
@keyframes fall { 0%{transform:translateY(-10vh) rotate(0)} 100%{transform:translateY(110vh) rotate(360deg)} }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
@keyframes sheetUp { 0%{transform:translateY(24px);opacity:0} 100%{transform:translateY(0);opacity:1} }
:focus-visible { outline: 3px solid ${C.gold}; outline-offset: 2px; border-radius: 8px; }
@media (prefers-reduced-motion: reduce){ *{animation:none!important; transition:none!important} }
`;

const K = "banatwbas.v3"; // localStorage namespace

// ---- Brand mark (kiss + gold ring), reused as logo + favicon ----
const Mark = ({ size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" style={{ flexShrink: 0 }}>
    <defs>
      <linearGradient id="bm" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={C.magenta} />
        <stop offset="1" stopColor={C.magenta2} />
      </linearGradient>
    </defs>
    <circle cx="24" cy="24" r="22" fill={C.berry2} stroke={C.gold} strokeWidth="2.5" />
    <path d="M24 34c-5-3.6-9-6.6-9-11 0-2.6 2-4.4 4.3-4.4 1.8 0 3.2 1 3.9 2.3l.8 1.4.8-1.4c.7-1.3 2.1-2.3 3.9-2.3 2.3 0 4.3 1.8 4.3 4.4 0 4.4-4 7.4-9 11z" fill="url(#bm)" />
    <text x="35" y="15" fontSize="9" fill={C.gold}>✨</text>
  </svg>
);

export default function App() {
  // ---- persisted game state (survives an accidental refresh) ----
  const [screen, setScreen] = usePersistedState(K + ".screen", "intro");
  const [teams, setTeams] = usePersistedState(K + ".teams", {
    A: { name: "فريق الوردي", score: 0, ll: freshLifelines() },
    B: { name: "فريق الذهبي", score: 0, ll: freshLifelines() },
  });
  const [pickPhase, setPickPhase] = usePersistedState(K + ".pickPhase", "A");
  const [chosen, setChosen] = usePersistedState(K + ".chosen", []);
  const [used, setUsed] = usePersistedState(K + ".used", {});
  const [turn, setTurn] = usePersistedState(K + ".turn", "A");
  const [muted, setMutedState] = usePersistedState(K + ".muted", false);

  // ---- ephemeral state (a fresh question, timers, undo history) ----
  const [active, setActive] = useState(null);      // { cat, idx }
  const [revealed, setRevealed] = useState(false);
  const [activeLL, setActiveLL] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [timerOn, setTimerOn] = useState(false);
  const [peeking, setPeeking] = useState(false);
  const [history, setHistory] = useState([]);      // undo snapshots
  const [helpOpen, setHelpOpen] = useState(false);

  const totalTiles = chosen.length * 6;
  const usedCount = Object.keys(used).length;

  useEffect(() => { setMuted(muted); }, [muted]);

  // countdown + audio cues
  useEffect(() => {
    if (timerOn && seconds > 0) {
      if (seconds <= 5) sfx.tick();
      const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
      return () => clearTimeout(t);
    }
    if (timerOn && seconds === 0) { setTimerOn(false); sfx.timeup(); }
  }, [timerOn, seconds]);

  // end game when the board is cleared
  useEffect(() => {
    if (screen === "board" && usedCount > 0 && usedCount === totalTiles) {
      sfx.win();
      const t = setTimeout(() => setScreen("end"), 600);
      return () => clearTimeout(t);
    }
  }, [usedCount, totalTiles, screen]);

  const chosenCats = chosen.map((id) => CATS.find((c) => c.id === id));

  function resetAll() {
    setTeams({
      A: { name: "فريق الوردي", score: 0, ll: freshLifelines() },
      B: { name: "فريق الذهبي", score: 0, ll: freshLifelines() },
    });
    setPickPhase("A"); setChosen([]); setUsed({}); setTurn("A");
    setActive(null); setRevealed(false); setActiveLL(null);
    setSeconds(0); setTimerOn(false); setPeeking(false); setHistory([]);
    setScreen("intro");
    [".screen", ".teams", ".pickPhase", ".chosen", ".used", ".turn"].forEach((s) => clearPersisted(K + s));
  }

  function togglePick(id) {
    sfx.select();
    if (chosen.includes(id)) { setChosen(chosen.filter((x) => x !== id)); return; }
    if (chosen.length >= 6) return;
    const next = [...chosen, id];
    setChosen(next);
    if (pickPhase === "A" && next.length === 3) setPickPhase("B");
  }

  function openTile(cat, idx) {
    if (used[`${cat}-${idx}`]) return;
    sfx.open();
    setActive({ cat, idx }); setRevealed(false); setActiveLL(null);
    setSeconds(0); setTimerOn(false); setPeeking(false);
  }

  function useLifeline(key) {
    if (activeLL || !teams[turn].ll[key]) return;
    sfx.tap();
    setTeams((t) => ({ ...t, [turn]: { ...t[turn], ll: { ...t[turn].ll, [key]: false } } }));
    setActiveLL(key);
    if (key === "friend") { setSeconds(30); setTimerOn(true); }
  }

  function adjustScore(team, delta) {
    sfx.tap();
    setTeams((t) => ({ ...t, [team]: { ...t[team], score: Math.max(0, t[team].score + delta) } }));
  }

  function award(winner) {
    const { cat, idx } = active;
    const q = CATS.find((c) => c.id === cat).qs[idx];
    setHistory((h) => [...h, { teams, used, turn }].slice(-20)); // snapshot for undo
    setUsed((u) => ({ ...u, [`${cat}-${idx}`]: true }));
    if (winner) {
      sfx[activeLL === "snatch" && winner === turn ? "snatch" : "correct"]();
      setTeams((t) => {
        const nt = { ...t, [winner]: { ...t[winner], score: t[winner].score + q.p } };
        if (activeLL === "snatch" && winner === turn) {
          const other = turn === "A" ? "B" : "A";
          nt[other] = { ...nt[other], score: Math.max(0, nt[other].score - q.p) };
        }
        return nt;
      });
    } else {
      sfx.wrong();
    }
    setActive(null); setRevealed(false); setActiveLL(null);
    setSeconds(0); setTimerOn(false); setPeeking(false);
    setTurn((t) => (t === "A" ? "B" : "A"));
  }

  function undo() {
    setHistory((h) => {
      if (!h.length) return h;
      const prev = h[h.length - 1];
      sfx.tap();
      setTeams(prev.teams); setUsed(prev.used); setTurn(prev.turn);
      return h.slice(0, -1);
    });
  }

  // ---------- styles ----------
  const shell = {
    minHeight: "100vh", direction: "rtl",
    background: `radial-gradient(1200px 600px at 80% -10%, ${C.berry2} 0%, ${C.ink} 55%)`,
    color: C.cream, fontFamily: "'Tajawal', sans-serif", padding: "20px",
  };
  const display = { fontFamily: "'Lalezar', 'Tajawal', cursive" };
  const gold = { color: C.gold };
  const btn = (bg, fg = "#2A0E2E") => ({
    background: bg, color: fg, border: "none", borderRadius: 16, padding: "14px 22px",
    fontWeight: 800, fontSize: 17, cursor: "pointer",
    boxShadow: "0 8px 22px rgba(255,61,138,.28)",
  });

  const Logo = ({ size = 44, withMark = true }) => (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      {withMark && <Mark size={size * 0.82} />}
      <div style={{ ...display, fontSize: size, lineHeight: 1, letterSpacing: 1,
        background: `linear-gradient(90deg, ${C.gold}, ${C.rose}, ${C.gold})`,
        backgroundSize: "200% auto", WebkitBackgroundClip: "text", backgroundClip: "text",
        color: "transparent", animation: "shimmer 4s linear infinite" }}>
        {BRAND.name}
      </div>
    </div>
  );

  const ctrlBtn = {
    width: 40, height: 40, borderRadius: 999, cursor: "pointer",
    background: C.berry, color: C.cream, border: `1px solid ${C.line}`, fontSize: 17,
  };

  // floating controls: mute + how-to-play, reachable from any screen
  const Controls = () => (
    <div style={{ position: "fixed", top: 12, insetInlineEnd: 12, display: "flex", gap: 8, zIndex: 40 }}>
      <button onClick={() => { sfx.tap(); setMutedState((m) => !m); }}
        aria-label={muted ? "تشغيل الصوت" : "كتم الصوت"} title={muted ? "تشغيل الصوت" : "كتم الصوت"}
        style={ctrlBtn}>{muted ? "🔇" : "🔊"}</button>
      <button onClick={() => { sfx.tap(); setHelpOpen(true); }}
        aria-label="كيف نلعب" title="كيف نلعب" style={ctrlBtn}>❔</button>
    </div>
  );

  const stepBtn = {
    width: 26, height: 26, borderRadius: 8, cursor: "pointer", lineHeight: 1,
    background: "rgba(255,255,255,.06)", color: C.cream, border: `1px solid ${C.line}`,
    fontSize: 18, fontWeight: 800,
  };

  const Scorebar = ({ editable = false }) => (
    <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
      {["A", "B"].map((k) => {
        const on = turn === k && screen === "board";
        return (
          <div key={k} style={{ flex: 1, background: on ? C.berry2 : C.berry,
            border: `1.5px solid ${on ? C.magenta : C.line}`, borderRadius: 18,
            padding: "12px 14px", transition: "all .2s",
            boxShadow: on ? "0 0 0 3px rgba(255,61,138,.15)" : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: 15, opacity: .9 }}>{teams[k].name}</span>
              {on && <span style={{ ...gold, fontSize: 12, fontWeight: 700 }}>دورهم ✋</span>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {editable && (
                <button onClick={() => adjustScore(k, -100)} aria-label="نقص ١٠٠" style={stepBtn}>−</button>
              )}
              <div style={{ ...display, fontSize: 30, ...gold, minWidth: 44, textAlign: "center" }}>{AR_NUM(teams[k].score)}</div>
              {editable && (
                <button onClick={() => adjustScore(k, 100)} aria-label="زيادة ١٠٠" style={stepBtn}>+</button>
              )}
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
              {LIFELINES.map((l) => (
                <span key={l.key} title={l.name}
                  style={{ fontSize: 16, opacity: teams[k].ll[l.key] ? 1 : .25 }}>{l.emoji}</span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  // circular countdown ring
  const TimerRing = ({ value, total }) => {
    const r = 32, circ = 2 * Math.PI * r;
    const frac = total > 0 ? value / total : 0;
    const danger = value <= 10;
    return (
      <svg width="84" height="84" viewBox="0 0 84 84" aria-label={`باقي ${value} ثانية`}>
        <circle cx="42" cy="42" r={r} fill="none" stroke={C.line} strokeWidth="7" />
        <circle cx="42" cy="42" r={r} fill="none" stroke={danger ? C.magenta : C.gold}
          strokeWidth="7" strokeLinecap="round" strokeDasharray={circ}
          strokeDashoffset={circ * (1 - frac)} transform="rotate(-90 42 42)"
          style={{ transition: "stroke-dashoffset 1s linear, stroke .3s" }} />
        <text x="42" y="42" textAnchor="middle" dominantBaseline="central"
          fontFamily="Lalezar" fontSize="26" fill={danger ? C.magenta : C.gold}
          style={{ animation: danger && value > 0 ? "pulse 1s infinite" : "none" }}>
          {AR_NUM(value)}
        </text>
      </svg>
    );
  };

  // ---------- HELP SHEET (overlay, openable anywhere) ----------
  const HelpSheet = () => (
    <div role="dialog" aria-label="كيف نلعب" onClick={() => setHelpOpen(false)}
      style={{ position: "fixed", inset: 0, background: "rgba(20,4,22,.72)", backdropFilter: "blur(6px)",
        display: "grid", placeItems: "center", padding: 16, zIndex: 60 }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 560, maxHeight: "92vh", overflowY: "auto",
          background: `linear-gradient(180deg, ${C.berry2}, ${C.berry})`,
          border: `1.5px solid ${C.gold}`, borderRadius: 24, padding: 22, animation: "sheetUp .25s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ ...display, fontSize: 26, margin: 0 }}>كيف نلعب؟ 💅</h2>
          <button onClick={() => setHelpOpen(false)} aria-label="إغلاق" style={ctrlBtn}>✕</button>
        </div>
        <ol style={{ lineHeight: 1.9, fontSize: 15, paddingInlineStart: 20, marginTop: 12 }}>
          <li>سمّوا فريقين — كل فريق شلة بنات.</li>
          <li>كل فريق يختار <b>٣ فئات</b> — المجموع ٦ فئات و٣٦ سؤال على اللوح.</li>
          <li>بالدور، الفريق يختار مربّع بالنقاط اللي يبينها (٢٠٠ أسهل، ٦٠٠ أصعب).</li>
          <li>جاوبوا، وبعدها اضغطوا <b>«بيّنوا الجواب»</b> وحدّدوا مين جاوب صح — النقاط تنحسب تلقائياً.</li>
          <li>الفئات اللي فيها 🎵🎭🙊🧩 <b>فصلة وحركة</b>: دندنة، تمثيل، ممنوع تقولين، وإيموجي — فيها تايمر وكرت «بس وحدة تشوف».</li>
        </ol>
        <h3 style={{ ...display, fontSize: 20, marginBottom: 6 }}>وسائل المساعدة (٣ لكل فريق)</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {LIFELINES.map((l) => (
            <div key={l.key} style={{ background: C.ink, border: `1px solid ${C.line}`, borderRadius: 12, padding: "10px 12px" }}>
              <b>{l.emoji} {l.name}</b>
              <div style={{ fontSize: 13, opacity: .8 }}>{l.hint}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 13, opacity: .75, marginTop: 14, lineHeight: 1.7 }}>
          النقاط بأيديكم — المضيفة تقدر تعدّل النتيجة من زري <b>+ / −</b> باللوح، وفي زر <b>تراجع ↶</b> لو صار خطأ.
          اللعبة تنحفظ تلقائياً، فلو انقفل التطبيق ترجعون من نفس المكان.
        </p>
        <button onClick={() => setHelpOpen(false)}
          style={{ ...btn(`linear-gradient(90deg, ${C.magenta}, ${C.magenta2})`, "#fff"), width: "100%", marginTop: 14 }}>
          تمام، فهمنا ✨
        </button>
      </div>
    </div>
  );

  // ---------- INTRO ----------
  if (screen === "intro") {
    return (
      <div style={shell}>
        <style>{FONTS}</style>
        <Controls />
        <div style={{ maxWidth: 540, margin: "0 auto", textAlign: "center",
          minHeight: "88vh", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 18 }}>
          <div style={{ animation: "floaty 5s ease-in-out infinite" }}><Logo size={72} /></div>
          <div style={{ opacity: .55, letterSpacing: 3, fontSize: 13, fontWeight: 700, marginTop: -8 }}>{BRAND.latin.toUpperCase()}</div>
          <p style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
            لعبة القروب اللي <span style={gold}>فئاتها لكم</span> 💅
          </p>
          <p style={{ opacity: .8, maxWidth: 400, lineHeight: 1.7, margin: 0 }}>{BRAND.blurb}</p>
          <button style={{ ...btn(`linear-gradient(90deg, ${C.magenta}, ${C.magenta2})`, "#fff"), fontSize: 19, marginTop: 8 }}
            onClick={() => { sfx.reveal(); setScreen("teams"); }}>يالله نبدأ ✨</button>
          <button onClick={() => { sfx.tap(); setHelpOpen(true); }}
            style={{ background: "none", border: "none", color: C.rose, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
            كيف نلعب؟ ❔
          </button>
          <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap", justifyContent: "center" }}>
            {LIFELINES.map((l) => (
              <div key={l.key} style={{ background: C.berry, border: `1px solid ${C.line}`,
                borderRadius: 14, padding: "8px 12px", fontSize: 13 }}>
                <span style={{ fontSize: 16 }}>{l.emoji}</span> {l.name}
              </div>
            ))}
          </div>
        </div>
        {helpOpen && <HelpSheet />}
      </div>
    );
  }

  // ---------- TEAMS ----------
  if (screen === "teams") {
    return (
      <div style={shell}>
        <style>{FONTS}</style>
        <Controls />
        <div style={{ maxWidth: 480, margin: "0 auto", paddingTop: 30 }}>
          <div style={{ textAlign: "center", marginBottom: 22 }}><Logo /></div>
          <h2 style={{ ...display, fontSize: 26, textAlign: "center" }}>سمّوا الفريقين</h2>
          {["A", "B"].map((k) => (
            <div key={k} style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 700, fontSize: 14, opacity: .85 }}>
                {k === "A" ? "الفريق الأول" : "الفريق الثاني"}
              </label>
              <input value={teams[k].name} maxLength={22}
                onChange={(e) => setTeams((t) => ({ ...t, [k]: { ...t[k], name: e.target.value } }))}
                style={{ width: "100%", marginTop: 6, padding: "13px 14px", borderRadius: 14,
                  border: `1.5px solid ${C.line}`, background: C.berry, color: C.cream,
                  fontFamily: "'Tajawal',sans-serif", fontSize: 17, fontWeight: 700, outline: "none" }} />
            </div>
          ))}
          <button style={{ ...btn(`linear-gradient(90deg, ${C.magenta}, ${C.magenta2})`, "#fff"), width: "100%", marginTop: 6 }}
            onClick={() => { sfx.reveal(); setScreen("pick"); }}>اختاروا الفئات</button>
          <button onClick={() => { sfx.tap(); setScreen("intro"); }}
            style={{ ...btn("transparent", C.rose), border: `1px solid ${C.line}`, boxShadow: "none",
              width: "100%", marginTop: 8, fontSize: 14 }}>رجوع</button>
        </div>
        {helpOpen && <HelpSheet />}
      </div>
    );
  }

  // ---------- PICK ----------
  if (screen === "pick") {
    const remaining = 6 - chosen.length;
    const pickingTeam = teams[pickPhase].name;
    return (
      <div style={shell}>
        <style>{FONTS}</style>
        <Controls />
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 10 }}><Logo size={38} /></div>
          <div style={{ background: C.berry, border: `1px solid ${C.line}`, borderRadius: 16,
            padding: "12px 16px", textAlign: "center", marginBottom: 16 }}>
            <span style={{ fontWeight: 800 }}>{pickingTeam}</span> يختار — باقي{" "}
            <span style={gold}>{AR_NUM(pickPhase === "A" ? 3 - chosen.length : remaining)}</span> فئات
            <div style={{ fontSize: 12, opacity: .7, marginTop: 4 }}>
              كل فريق يختار ٣ — المجموع ٦ فئات و٣٦ سؤال. الفئات اللي فيها 🎵🎭🙊🧩 كلها فصلة وحركة، مو أسئلة بس.
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 12 }}>
            {CATS.map((c) => {
              const picked = chosen.includes(c.id);
              const byA = picked && chosen.indexOf(c.id) < 3;
              const isPerf = c.qs.some((q) => q.t);
              return (
                <button key={c.id} onClick={() => togglePick(c.id)} aria-pressed={picked}
                  style={{ position: "relative",
                    background: picked ? `linear-gradient(135deg, ${C.magenta}, ${C.berry2})` : C.berry,
                    border: `1.5px solid ${picked ? C.gold : C.line}`, borderRadius: 18,
                    padding: "18px 10px", cursor: "pointer", color: C.cream,
                    fontWeight: 700, fontSize: 15, animation: "pop .25s ease" }}>
                  <div style={{ fontSize: 30, marginBottom: 6 }}>{c.emoji}</div>
                  {c.name}
                  {isPerf && (
                    <div style={{ fontSize: 10, opacity: .7, marginTop: 3 }}>فصلة وحركة</div>
                  )}
                  {picked && (
                    <span style={{ position: "absolute", top: 8, insetInlineStart: 8,
                      background: byA ? C.rose : C.gold, color: C.ink, borderRadius: 999,
                      width: 22, height: 22, display: "grid", placeItems: "center",
                      fontSize: 11, fontWeight: 800 }}>{byA ? "أ" : "ب"}</span>
                  )}
                </button>
              );
            })}
          </div>
          {chosen.length === 6 && (
            <button style={{ ...btn(`linear-gradient(90deg, ${C.gold}, ${C.rose})`), width: "100%", marginTop: 18 }}
              onClick={() => { sfx.reveal(); setScreen("board"); }}>ابدأوا اللعبة 🎬</button>
          )}
        </div>
        {helpOpen && <HelpSheet />}
      </div>
    );
  }

  // ---------- BOARD ----------
  if (screen === "board") {
    const tierRows = [200, 400, 600].flatMap((p) => [{ p, nth: 0 }, { p, nth: 1 }]);
    return (
      <div style={shell}>
        <style>{FONTS}</style>
        <Controls />
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Logo size={32} />
            <span style={{ fontSize: 13, opacity: .7 }}>{AR_NUM(usedCount)}/{AR_NUM(totalTiles)} سؤال</span>
          </div>
          <Scorebar editable />
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${chosen.length}, 1fr)`, gap: 7 }}>
            {chosenCats.map((c) => (
              <div key={c.id} style={{ background: C.berry2, border: `1px solid ${C.line}`,
                borderRadius: 12, padding: "10px 4px", textAlign: "center", minHeight: 62 }}>
                <div style={{ fontSize: 22 }}>{c.emoji}</div>
                <div style={{ fontSize: 11.5, fontWeight: 700, lineHeight: 1.2, marginTop: 2 }}>{c.name}</div>
              </div>
            ))}
            {tierRows.map(({ p, nth }) =>
              chosenCats.map((c) => {
                const idx = c.qs.map((q, i) => ({ q, i })).filter((x) => x.q.p === p)[nth].i;
                const isUsed = used[`${c.id}-${idx}`];
                const type = c.qs[idx].t;
                return (
                  <button key={`${c.id}-${idx}`} disabled={isUsed} onClick={() => openTile(c.id, idx)}
                    aria-label={isUsed ? "سؤال مستخدم" : `${c.name} ${p}`}
                    style={{ position: "relative", aspectRatio: "1.55", borderRadius: 12,
                      cursor: isUsed ? "default" : "pointer",
                      border: `1.5px solid ${isUsed ? "transparent" : C.line}`,
                      background: isUsed ? "rgba(255,255,255,0.04)"
                        : `linear-gradient(160deg, ${C.magenta} 0%, ${C.berry2} 130%)`,
                      color: isUsed ? "rgba(251,239,233,.25)" : C.cream,
                      fontFamily: "'Lalezar',cursive", fontSize: 23,
                      boxShadow: isUsed ? "none" : "0 6px 14px rgba(0,0,0,.25)" }}>
                    {isUsed ? "✓" : AR_NUM(p)}
                    {!isUsed && type && (
                      <span style={{ position: "absolute", bottom: 4, insetInlineEnd: 6, fontSize: 11 }}>
                        {TYPE_ICON[type]}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
            <button onClick={undo} disabled={!history.length}
              style={{ ...btn("transparent", C.gold), border: `1px solid ${C.line}`, boxShadow: "none",
                fontSize: 14, padding: "10px 16px", opacity: history.length ? 1 : .35,
                cursor: history.length ? "pointer" : "default" }}>
              تراجع ↶
            </button>
            <button onClick={() => { if (confirm("متأكدين تبدأون لعبة جديدة؟")) resetAll(); }}
              style={{ ...btn("transparent", C.rose), border: `1px solid ${C.line}`, boxShadow: "none",
                fontSize: 14, padding: "10px 16px" }}>
              لعبة جديدة ↺
            </button>
          </div>
        </div>
        {active && <QuestionOverlay />}
        {helpOpen && <HelpSheet />}
      </div>
    );
  }

  // ---------- END ----------
  if (screen === "end") {
    const a = teams.A.score, b = teams.B.score;
    const win = a === b ? null : a > b ? "A" : "B";
    return (
      <div style={{ ...shell, overflow: "hidden", position: "relative" }}>
        <style>{FONTS}</style>
        <Controls />
        {[...Array(24)].map((_, i) => (
          <span key={i} style={{ position: "absolute", top: 0,
            insetInlineStart: `${(i * 4.3) % 100}%`, fontSize: 14 + (i % 4) * 6,
            animation: `fall ${3 + (i % 5)}s linear ${(i % 6) * 0.4}s infinite` }}>
            {["🎉", "💖", "✨", "👑", "💅"][i % 5]}
          </span>
        ))}
        <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center", paddingTop: "12vh", position: "relative" }}>
          <Logo size={40} />
          <div style={{ fontSize: 64, margin: "18px 0 6px" }}>{win ? "👑" : "🤝"}</div>
          <h2 style={{ ...display, fontSize: 34, ...gold, margin: 0 }}>
            {win ? `فاز ${teams[win].name}!` : "تعادل!"}
          </h2>
          <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
            {["A", "B"].map((k) => (
              <div key={k} style={{ flex: 1, background: win === k ? C.berry2 : C.berry,
                border: `1.5px solid ${win === k ? C.gold : C.line}`, borderRadius: 18, padding: "16px 10px" }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{teams[k].name}</div>
                <div style={{ ...display, fontSize: 40, ...gold }}>{AR_NUM(teams[k].score)}</div>
              </div>
            ))}
          </div>
          <button style={{ ...btn(`linear-gradient(90deg, ${C.magenta}, ${C.magenta2})`, "#fff"), width: "100%", marginTop: 24 }}
            onClick={resetAll}>مرة ثانية 🔁</button>
        </div>
        {helpOpen && <HelpSheet />}
      </div>
    );
  }

  // ---------- QUESTION OVERLAY ----------
  function QuestionOverlay() {
    const cat = CATS.find((c) => c.id === active.cat);
    const q = cat.qs[active.idx];
    const type = q.t || "normal";
    const meta = TYPE_META[type];
    const isPerf = ["hum", "act", "taboo"].includes(type);
    const tName = teams[turn].name;

    return (
      <div role="dialog" aria-modal="true"
        style={{ position: "fixed", inset: 0, background: "rgba(20,4,22,.72)",
        backdropFilter: "blur(6px)", display: "grid", placeItems: "center", padding: 16, zIndex: 50 }}>
        <div style={{ width: "100%", maxWidth: 580, maxHeight: "94vh", overflowY: "auto",
          background: `linear-gradient(180deg, ${C.berry2}, ${C.berry})`,
          border: `1.5px solid ${C.gold}`, borderRadius: 24, padding: 22, animation: "pop .2s ease" }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ background: C.ink, borderRadius: 999, padding: "4px 12px", fontSize: 13, fontWeight: 700 }}>
              {cat.emoji} {cat.name}
            </span>
            {meta && (
              <span style={{ background: C.magenta, color: "#fff", borderRadius: 999,
                padding: "4px 12px", fontSize: 13, fontWeight: 800 }}>{meta.badge}</span>
            )}
            <span style={{ ...display, fontSize: 26, ...gold }}>{AR_NUM(q.p)}</span>
          </div>

          <div style={{ fontSize: 12, opacity: .8, marginTop: 12 }}>دور <b>{tName}</b></div>

          {meta && (
            <div style={{ background: "rgba(242,200,121,.1)", border: `1px dashed ${C.gold}`,
              borderRadius: 14, padding: "10px 14px", marginTop: 8, fontSize: 13.5, lineHeight: 1.6 }}>
              {meta.rule}
            </div>
          )}

          {/* Question card: performance types hide behind a press-and-hold peek */}
          {isPerf && !revealed ? (
            <div
              onMouseDown={() => setPeeking(true)} onMouseUp={() => setPeeking(false)}
              onMouseLeave={() => setPeeking(false)}
              onTouchStart={() => setPeeking(true)} onTouchEnd={() => setPeeking(false)}
              style={{ background: C.ink, borderRadius: 18, padding: "26px 18px", marginTop: 10,
                textAlign: "center", cursor: "pointer", userSelect: "none", WebkitUserSelect: "none" }}>
              {peeking ? (
                <>
                  <div style={{ fontSize: 21, fontWeight: 800, lineHeight: 1.6 }}>{q.q}</div>
                  {q.banned && (
                    <div style={{ marginTop: 10, fontSize: 14 }}>
                      ممنوع تقولين:{" "}
                      {q.banned.map((b) => (
                        <span key={b} style={{ background: C.magenta, color: "#fff", borderRadius: 8,
                          padding: "2px 8px", margin: "0 3px", fontWeight: 800 }}>{b}</span>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ opacity: .85 }}>
                  <div style={{ fontSize: 34 }}>🤫</div>
                  <div style={{ fontWeight: 800, marginTop: 4 }}>{meta.peek}</div>
                  <div style={{ fontSize: 12.5, opacity: .7, marginTop: 4 }}>اضغطي مطوّلاً عشان تشوفين — وإذا رفعتِ إيدج يختفي</div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ background: C.ink, borderRadius: 18, padding: "24px 18px", marginTop: 10,
              fontSize: type === "emoji" ? 44 : 21, fontWeight: 700, lineHeight: 1.6,
              textAlign: "center", letterSpacing: type === "emoji" ? 4 : 0 }}>
              {q.q}
            </div>
          )}

          {/* Timer for performance types */}
          {isPerf && !revealed && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
              {!timerOn && seconds === 0 ? (
                <button style={{ ...btn(C.gold), width: "100%", fontSize: 15 }}
                  onClick={() => { sfx.tap(); setSeconds(meta.time); setTimerOn(true); }}>
                  ▶️ ابدأوا الوقت ({AR_NUM(meta.time)} ثانية)
                </button>
              ) : (
                <div style={{ textAlign: "center" }}>
                  <TimerRing value={seconds} total={meta.time} />
                  {seconds === 0 && <div style={{ fontSize: 14, color: C.magenta, fontWeight: 800 }}>انتهى الوقت!</div>}
                </div>
              )}
            </div>
          )}

          {/* Lifelines: only for knowledge questions */}
          {!isPerf && (
            <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
              {LIFELINES.map((l) => {
                const avail = teams[turn].ll[l.key] && !activeLL;
                const isOn = activeLL === l.key;
                return (
                  <button key={l.key} disabled={!avail && !isOn} onClick={() => useLifeline(l.key)} title={l.hint}
                    style={{ flex: "1 1 30%",
                      background: isOn ? C.magenta : (avail ? C.berry2 : "rgba(255,255,255,.04)"),
                      border: `1px solid ${isOn ? C.gold : C.line}`, borderRadius: 14, padding: "10px 6px",
                      color: C.cream, cursor: avail ? "pointer" : "default",
                      opacity: (avail || isOn) ? 1 : .35, fontWeight: 700, fontSize: 12.5 }}>
                    <div style={{ fontSize: 18 }}>{l.emoji}</div>{l.name}
                  </button>
                );
              })}
            </div>
          )}

          {activeLL === "friend" && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
              <TimerRing value={seconds} total={30} />
            </div>
          )}
          {activeLL === "snatch" && (
            <div style={{ textAlign: "center", marginTop: 10, fontSize: 13, color: C.rose }}>
              💅 لو {tName} جاوب صح، ينخصم {AR_NUM(q.p)} من الفريق الثاني
            </div>
          )}

          {!revealed ? (
            <button style={{ ...btn(`linear-gradient(90deg, ${C.gold}, ${C.rose})`), width: "100%", marginTop: 16 }}
              onClick={() => { sfx.reveal(); setRevealed(true); setTimerOn(false); }}>
              {isPerf ? "خلصنا — بيّنوا الجواب 👀" : "بيّنوا الجواب 👀"}
            </button>
          ) : (
            <>
              <div style={{ background: `linear-gradient(90deg, ${C.magenta}, ${C.magenta2})`,
                borderRadius: 16, padding: "16px", marginTop: 16, textAlign: "center",
                fontSize: 19, fontWeight: 800, color: "#fff", lineHeight: 1.5 }}>
                {q.a}
              </div>
              <div style={{ fontSize: 12, opacity: .8, textAlign: "center", marginTop: 12 }}>
                {isPerf ? "خمّنوها صح؟" : "مين جاوب صح؟"}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button style={{ ...btn(C.rose), flex: 1 }} onClick={() => award("A")}>{teams.A.name}</button>
                <button style={{ ...btn(C.gold), flex: 1 }} onClick={() => award("B")}>{teams.B.name}</button>
              </div>
              <button style={{ ...btn("transparent", C.cream), border: `1px solid ${C.line}`,
                boxShadow: "none", width: "100%", marginTop: 8, fontSize: 14 }}
                onClick={() => award(null)}>محد جاوب</button>
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
}
