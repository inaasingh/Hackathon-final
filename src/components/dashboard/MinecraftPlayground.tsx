import { useState, useEffect, useRef } from "react";

const BACKEND = "http://localhost:3001";

// ─── CSS injected once ─────────────────────────────────────────────────────
const MC_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
  .mc { font-family: 'Press Start 2P', monospace !important; }

  @keyframes mcWalkAcross {
    from { transform: translateX(-160px); }
    to   { transform: translateX(calc(100vw + 160px)); }
  }
  @keyframes mcCloudDrift {
    from { transform: translateX(-260px); }
    to   { transform: translateX(calc(100vw + 260px)); }
  }
  @keyframes mcStarBlink {
    0%,100% { opacity:1; } 50% { opacity:.12; }
  }
  @keyframes mcTorch {
    0%,100% { opacity:1;  transform:scale(1);    box-shadow:0 0 12px #FF6B35,0 0 24px #FF6B3555; }
    33%     { opacity:.75;transform:scale(.82);  box-shadow:0 0  5px #FF6B35; }
    66%     { opacity:.95;transform:scale(1.12); box-shadow:0 0 18px #FF6B35,0 0 32px #FF6B3555; }
  }
  @keyframes mcPulseGlow {
    0%,100% { box-shadow:0 0  8px var(--gc),inset -4px -4px 0 rgba(0,0,0,.45); }
    50%     { box-shadow:0 0 28px var(--gc),inset -4px -4px 0 rgba(0,0,0,.45); }
  }
  @keyframes mcXPPulse {
    0%,100% { opacity:1; } 50% { opacity:.55; }
  }
  @keyframes mcTickerScroll {
    from { transform:translateX(100%); }
    to   { transform:translateX(-200%); }
  }
  @keyframes mcTabBlink {
    0%,100% { border-color: rgba(240,165,0,.6); }
    50%     { border-color: rgba(240,165,0,1); }
  }
  @keyframes mcSpinCoin {
    0%   { transform: scaleX(1); }
    50%  { transform: scaleX(.1); }
    100% { transform: scaleX(1); }
  }
`;

// ─── All 27 teams ──────────────────────────────────────────────────────────
const ALL_TEAMS = [
  "Barbour Support","Bedrock","Clarks Support Team","FastMarkets",
  "Fenwick Support Team","FitFlop Support Team","FootAsylum Support Team",
  "Furniture Village","Harbour Hotels","Harvey Nichols","Jewells Support",
  "Lloyds Clinical","LornaJane Support","Managed Services Support",
  "Millennium Hotels","Mulberry Support Team","Senior Management",
  "Support Desk Manager","Support Engineer","Support Engineers1",
  "Technical Team Lead","Village Hotels","White Cube Support",
  "WhiteStuff Support Team","Wolverine-Support Team","Wren Kitchens",
  "Yotel Support team",
];

// ─── Characters base config (names are overridable via UI) ────────────────
const TICKET_CHARS = [
  { defaultName:"Dev_01",  shirt:"#3498db", skin:"#FDBCB4", speed:10, statKey:"open",       src:"jira",  startPct:  0 },
  { defaultName:"Dev_02",  shirt:"#f0a500", skin:"#D4956A", speed:13, statKey:"inProgress", src:"jira",  startPct:-18 },
  { defaultName:"SRE_01",  shirt:"#e74c3c", skin:"#FDBCB4", speed: 7, statKey:"critical",   src:"both",  startPct:-36 },
  { defaultName:"PM_01",   shirt:"#9b59b6", skin:"#F0C8A0", speed:15, statKey:"onHold",     src:"jira",  startPct:-54 },
  { defaultName:"QA_01",   shirt:"#e67e22", skin:"#FDBCB4", speed:11, statKey:"open",       src:"zoho",  startPct:-72 },
];

const SHIRT_COLORS = ["#3498db","#e74c3c","#2ecc71","#f0a500","#9b59b6","#e67e22","#1abc9c","#e91e63"];
const LS_KEY = "mc-char-names";

// ─── Types ─────────────────────────────────────────────────────────────────
interface JiraStats { open:number; inProgress:number; onHold:number; done:number; critical:number; total:number; }
interface ZohoStats { open:number; pending:number; resolved:number; critical:number; total:number; }
interface TeamData  { name:string; jira:JiraStats; zoho:ZohoStats; live:boolean; }

// ─── Helpers ───────────────────────────────────────────────────────────────
function aggregate(teams: TeamData[]) {
  const sum = (f:(t:TeamData)=>number) => teams.reduce((a,t)=>a+f(t),0);
  return {
    jira:{ open:sum(t=>t.jira.open), inProgress:sum(t=>t.jira.inProgress),
           onHold:sum(t=>t.jira.onHold), done:sum(t=>t.jira.done),
           critical:sum(t=>t.jira.critical), total:sum(t=>t.jira.total) },
    zoho:{ open:sum(t=>t.zoho.open), pending:sum(t=>t.zoho.pending),
           resolved:sum(t=>t.zoho.resolved), critical:sum(t=>t.zoho.critical),
           total:sum(t=>t.zoho.total) },
    live: teams.some(t=>t.live),
  };
}

// ─── Sub-components ────────────────────────────────────────────────────────
function StarField() {
  const stars = useRef(Array.from({length:65},()=>({
    x:+(Math.random()*100).toFixed(1), y:+(Math.random()*60).toFixed(1),
    sz:Math.random()>.82?3:2,
    dur:+(2+Math.random()*3).toFixed(1), delay:+(Math.random()*4).toFixed(1),
  }))).current;
  return <>{stars.map((s,i)=>(
    <div key={i} style={{position:"absolute",left:`${s.x}%`,top:`${s.y}%`,
      width:s.sz,height:s.sz,background:"#fff",
      animation:`mcStarBlink ${s.dur}s ease-in-out ${s.delay}s infinite`}}/>
  ))}</>;
}

function PixelCloud({x,y,dur,delay}:{x:number;y:number;dur:number;delay:number}) {
  const B=10, shape=[[0,0,1,1,1,0],[0,1,1,1,1,1],[1,1,1,1,1,1],[0,1,1,1,1,0]];
  return (
    <div style={{position:"absolute",left:`${x}%`,top:`${y}%`,
      animation:`mcCloudDrift ${dur}s linear ${delay}s infinite`,opacity:.8}}>
      {shape.map((row,r)=>(
        <div key={r} style={{display:"flex"}}>
          {row.map((c,i)=>(
            <div key={i} style={{width:B,height:B,
              background:c?"#c6d8e2":"transparent",
              border:c?"1px solid rgba(255,255,255,.2)":"none"}}/>
          ))}
        </div>
      ))}
    </div>
  );
}

function McCharacter({char,count,teamName,tick}:{
  char:typeof TICKET_CHARS[0]; count:number; teamName:string; tick:number;
}) {
  const leftFoot = tick%2===0;
  const delay    = `${char.startPct/100*char.speed}s`;
  const label    = teamName.length>12 ? teamName.substring(0,11)+"…" : teamName;
  return (
    <div style={{position:"absolute",bottom:0,left:0,textAlign:"center",userSelect:"none",
      animation:`mcWalkAcross ${char.speed}s linear ${delay} infinite`}}>

      {/* Custom name tag */}
      <div className="mc" style={{fontSize:6,color:"#FFD700",background:"rgba(0,0,0,.9)",
        padding:"2px 6px",marginBottom:2,border:"1px solid #FFD70055",
        display:"inline-block",whiteSpace:"nowrap",
        textShadow:"1px 1px 0 #000"}}>
        {char.defaultName}
      </div>

      {/* Project name tag */}
      <div className="mc" style={{fontSize:5,color:"#aaa",background:"rgba(0,0,0,.75)",
        padding:"1px 4px",marginBottom:3,border:"1px solid rgba(255,255,255,.1)",
        display:"inline-block",whiteSpace:"nowrap",maxWidth:90,overflow:"hidden",
        textOverflow:"ellipsis"}}>
        {label}
      </div>

      {/* Ticket count badge */}
      <div className="mc" style={{fontSize:6,color:char.shirt,
        background:"rgba(0,0,0,.85)",padding:"2px 5px",marginBottom:3,
        border:`1px solid ${char.shirt}44`,display:"inline-block",whiteSpace:"nowrap",
        textShadow:"1px 1px 0 #000"}}>
        🎫 {String(count).padStart(2,"0")}
      </div>

      {/* HEAD */}
      <div style={{width:20,height:20,background:char.skin,border:"2px solid #111",
        margin:"0 auto",position:"relative",
        boxShadow:"inset -3px -3px 0 rgba(0,0,0,.3),inset 2px 2px 0 rgba(255,255,255,.1)"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:5,
          background:"#3d2b1f",borderBottom:"1px solid #111"}}/>
        <div style={{position:"absolute",top:7,left:3,width:4,height:4,background:"#111"}}/>
        <div style={{position:"absolute",top:7,right:3,width:4,height:4,background:"#111"}}/>
        <div style={{position:"absolute",bottom:3,left:4,width:12,height:2,background:"#111"}}/>
      </div>

      {/* BODY */}
      <div style={{width:22,height:13,background:char.shirt,border:"2px solid #111",
        margin:"0 auto",boxShadow:"inset -3px -3px 0 rgba(0,0,0,.35)"}}/>

      {/* LEGS */}
      <div style={{display:"flex",gap:2,justifyContent:"center"}}>
        {[leftFoot,!leftFoot].map((fwd,i)=>(
          <div key={i} style={{width:8,height:14,background:"#2c3e50",border:"2px solid #111",
            transformOrigin:"top center",transform:`rotate(${fwd?22:-22}deg)`,
            transition:"transform .28s steps(1)",
            boxShadow:"inset -2px -2px 0 rgba(0,0,0,.4)"}}/>
        ))}
      </div>
    </div>
  );
}

function StatBlock({emoji,label,value,color,bg,pulse,subLabel}:{
  emoji:string;label:string;value:number;color:string;bg:string;pulse:boolean;subLabel?:string;
}) {
  return (
    <div style={{["--gc" as any]:color,background:bg,border:`3px solid ${color}`,
      outline:"3px solid #000",padding:"10px 14px",minWidth:90,textAlign:"center",
      animation:pulse&&value>0?"mcPulseGlow 1.6s ease-in-out infinite":"none",
      boxShadow:"inset -4px -4px 0 rgba(0,0,0,.5),inset 3px 3px 0 rgba(255,255,255,.07)"}}>
      <div style={{fontSize:26,lineHeight:1,marginBottom:6}}>{emoji}</div>
      <div className="mc" style={{fontSize:20,color,marginBottom:5,
        textShadow:"2px 2px 0 #000"}}>{String(value).padStart(2,"0")}</div>
      <div className="mc" style={{fontSize:5,color:"#888",letterSpacing:.5}}>{label}</div>
      {subLabel&&<div className="mc" style={{fontSize:4,color:color+"99",marginTop:3}}>{subLabel}</div>}
    </div>
  );
}

function Ground() {
  const N=90;
  const row=(bg:string,bT:string,bR:string,bB:string,bL:string)=>
    Array.from({length:N}).map((_,i)=>(
      <div key={i} style={{width:32,height:32,flexShrink:0,background:bg,
        borderTop:`4px solid ${bT}`,borderLeft:`4px solid ${bL}`,
        borderRight:`4px solid ${bR}`,borderBottom:`4px solid ${bB}`,
        boxSizing:"border-box"}}/>
    ));
  return (
    <>
      <div style={{position:"absolute",bottom:32,left:0,right:0,display:"flex",overflow:"hidden"}}>
        {row("#5D8731","#7bac44","#4a7026","#3d5e1f","#6fa038")}
      </div>
      <div style={{position:"absolute",bottom:0,left:0,right:0,display:"flex",overflow:"hidden"}}>
        {row("#8B5E3C","#9e6b44","#6b3f20","#5a3318","#9e6b44")}
      </div>
    </>
  );
}

function Torch({leftPct}:{leftPct:number}) {
  return (
    <div style={{position:"absolute",bottom:64,left:`${leftPct}%`,zIndex:3}}>
      <div style={{width:4,height:18,background:"#8B5E3C",border:"1px solid #5C3A1E",margin:"0 auto"}}/>
      <div style={{width:10,height:10,background:"#FF6B35",border:"1px solid #FF4500",
        marginLeft:-3,marginTop:-10,animation:"mcTorch .35s steps(2) infinite",
        boxShadow:"0 0 12px #FF6B35"}}/>
    </div>
  );
}

// ─── Names Editor Panel ────────────────────────────────────────────────────
function NamesEditor({ names, onSave, onClose }:{
  names: string[]; onSave:(n:string[])=>void; onClose:()=>void;
}) {
  const [draft, setDraft] = useState<string[]>([...names]);

  return (
    <div style={{ position:"absolute", inset:0, zIndex:30,
      background:"rgba(0,0,0,.88)", display:"flex",
      alignItems:"center", justifyContent:"center" }}>

      <div style={{ background:"#0d1117", border:"4px solid #52b788",
        outline:"3px solid #000", padding:"28px 32px", minWidth:360,
        boxShadow:"inset -6px -6px 0 rgba(0,0,0,.5), 0 0 40px #52b78830" }}>

        {/* Title */}
        <div className="mc" style={{ fontSize:11, color:"#52b788",
          textShadow:"2px 2px 0 #000", marginBottom:20, textAlign:"center" }}>
          ✏️ EDIT PLAYER NAMES
        </div>

        <div className="mc" style={{ fontSize:6, color:"#888",
          marginBottom:16, textAlign:"center" }}>
          NAMES APPEAR ABOVE EACH CHARACTER
        </div>

        {/* Input rows */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {TICKET_CHARS.map((c, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
              {/* Color swatch */}
              <div style={{ width:16, height:16, background:c.shirt,
                border:"2px solid #000", flexShrink:0 }}/>
              {/* Input */}
              <input
                value={draft[i] ?? ""}
                maxLength={12}
                onChange={e => {
                  const next = [...draft];
                  next[i] = e.target.value;
                  setDraft(next);
                }}
                placeholder={c.defaultName}
                className="mc"
                style={{ flex:1, background:"#0a0f1a", border:"3px solid #333",
                  outline:"1px solid #000", color:"#fff", padding:"7px 10px",
                  fontSize:8, fontFamily:"'Press Start 2P', monospace",
                  boxShadow:"inset -2px -2px 0 rgba(0,0,0,.4)" }}
              />
              {/* char count hint */}
              <div className="mc" style={{ fontSize:5, color:"#555", width:24, textAlign:"right" }}>
                {(draft[i]??"").length}/12
              </div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display:"flex", gap:10, marginTop:22, justifyContent:"center" }}>
          <button
            onClick={() => { onSave(draft); onClose(); }}
            className="mc"
            style={{ background:"#145214", border:"3px solid #52b788",
              outline:"2px solid #000", color:"#52b788", padding:"8px 18px",
              fontSize:8, cursor:"pointer",
              boxShadow:"inset -3px -3px 0 rgba(0,0,0,.45)" }}>
            ✅ SAVE
          </button>
          <button
            onClick={() => { setDraft(TICKET_CHARS.map(c=>c.defaultName)); }}
            className="mc"
            style={{ background:"#1a1205", border:"3px solid #f0a500",
              outline:"2px solid #000", color:"#f0a500", padding:"8px 18px",
              fontSize:8, cursor:"pointer",
              boxShadow:"inset -3px -3px 0 rgba(0,0,0,.45)" }}>
            🔄 RESET
          </button>
          <button
            onClick={onClose}
            className="mc"
            style={{ background:"#1a0505", border:"3px solid #e74c3c",
              outline:"2px solid #000", color:"#e74c3c", padding:"8px 18px",
              fontSize:8, cursor:"pointer",
              boxShadow:"inset -3px -3px 0 rgba(0,0,0,.45)" }}>
            ✕ CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────
export function MinecraftPlayground({ onClose }:{ onClose:()=>void }) {
  const [teams,      setTeams]      = useState<TeamData[]>([]);
  const [selTeam,    setSelTeam]    = useState<string>("ALL TEAMS");
  const [loading,    setLoading]    = useState(true);
  const [tick,       setTick]       = useState(0);
  const [showEditor, setShowEditor] = useState(false);
  const [charNames,  setCharNames]  = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      return saved ? JSON.parse(saved) : TICKET_CHARS.map(c => c.defaultName);
    } catch { return TICKET_CHARS.map(c => c.defaultName); }
  });
  const styleRef = useRef(false);
  const tabsRef  = useRef<HTMLDivElement>(null);

  function saveNames(names: string[]) {
    const filled = names.map((n,i) => n.trim() || TICKET_CHARS[i].defaultName);
    setCharNames(filled);
    try { localStorage.setItem(LS_KEY, JSON.stringify(filled)); } catch {}
  }

  // Inject CSS once
  useEffect(() => {
    if (styleRef.current) return;
    if (!document.getElementById("mc-styles")) {
      const el = Object.assign(document.createElement("style"),
        { id:"mc-styles", textContent:MC_STYLES });
      document.head.appendChild(el);
    }
    styleRef.current = true;
  }, []);

  // Fetch all teams
  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      try {
        const r = await fetch(`${BACKEND}/api/teams`);
        const d = await r.json();
        if (alive) setTeams(d.teams ?? []);
      } catch {
        // generate full mock client-side as fallback
        if (alive) setTeams(ALL_TEAMS.map(name => {
          const s = name.split("").reduce((a,c)=>a+c.charCodeAt(0),0);
          const si=(seed:number,mn:number,mx:number)=>{
            const x=Math.sin(seed*9301+49297)*233280;
            return mn+Math.floor((x-Math.floor(x))*(mx-mn+1));
          };
          return {
            name, live:false,
            jira:{ open:si(s+1,2,18), inProgress:si(s+2,1,8), onHold:si(s+3,0,5),
                   done:si(s+4,3,24), critical:si(s+5,0,4),
                   total:si(s+1,2,18)+si(s+2,1,8)+si(s+3,0,5)+si(s+4,3,24) },
            zoho:{ open:si(s+6,1,12), pending:si(s+7,0,5), resolved:si(s+8,2,20),
                   critical:si(s+9,0,3),
                   total:si(s+6,1,12)+si(s+7,0,5)+si(s+8,2,20) },
          };
        }));
      }
      if (alive) setLoading(false);
    }
    load();
    const iv = setInterval(load, 30_000);
    return () => { alive=false; clearInterval(iv); };
  }, []);

  // Leg tick
  useEffect(() => {
    const iv = setInterval(() => setTick(t=>t+1), 320);
    return () => clearInterval(iv);
  }, []);

  // Current stats
  const current = selTeam === "ALL TEAMS"
    ? (teams.length ? aggregate(teams) : null)
    : teams.find(t => t.name === selTeam) ?? null;

  const jira = current?.jira;
  const zoho = current?.zoho;

  const systemHealth = jira
    ? Math.max(0, Math.min(100, 100 - (jira.critical??0)*10 - (jira.onHold??0)*3))
    : 80;
  const hearts = Math.ceil(systemHealth/10);

  const difficulty = (jira?.critical??0) > 5 ? "☠️ HARDCORE"
    : (jira?.critical??0) > 2 ? "🔴 HARD"
    : (jira?.onHold??0) > 8   ? "🟡 NORMAL"
    : "🟢 PEACEFUL";

  // Character counts
  function charCount(c: typeof TICKET_CHARS[0]) {
    if (!jira && !zoho) return 0;
    if (c.src === "zoho") return (zoho as any)?.[c.statKey] ?? 0;
    if (c.src === "both") return (jira?.critical??0) + (zoho?.critical??0);
    return (jira as any)?.[c.statKey] ?? 0;
  }

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:60,
        background:"rgba(0,0,0,.8)",backdropFilter:"blur(6px)"}}/>

      {/* Window */}
      <div style={{position:"fixed",inset:"2vh 1.5vw",zIndex:61,overflow:"hidden",
        border:"5px solid #555",outline:"4px solid #000",
        boxShadow:"inset -8px -8px 0 rgba(0,0,0,.5),inset 5px 5px 0 rgba(255,255,255,.04),0 0 80px rgba(0,0,0,.9)",
        background:"linear-gradient(180deg,#06091e 0%,#0b1240 35%,#141d5a 60%,#0b1240 100%)",
        imageRendering:"pixelated", display:"flex", flexDirection:"column"}}>

        <StarField/>
        <PixelCloud x={4}  y={7}  dur={24} delay={0}/>
        <PixelCloud x={32} y={10} dur={31} delay={-11}/>
        <PixelCloud x={60} y={5}  dur={27} delay={-6}/>
        <PixelCloud x={80} y={13} dur={36} delay={-19}/>
        {/* Moon */}
        <div style={{position:"absolute",top:46,right:70,width:36,height:36,
          background:"#FFF8CC",border:"2px solid #e8d970",
          boxShadow:"inset -7px -4px 0 #d4c860,0 0 28px rgba(255,248,170,.22)"}}/>

        {/* ── TITLE BAR ─────────────────────────────────────── */}
        <div style={{position:"relative",zIndex:10,display:"flex",alignItems:"center",
          justifyContent:"space-between",padding:"9px 16px",
          background:"rgba(0,0,0,.7)",borderBottom:"4px solid #2a2a2a",flexShrink:0}}>
          <div className="mc" style={{fontSize:10,color:"#52b788",textShadow:"2px 2px 0 #000"}}>
            🎮  SYNAPSE WORLD — TICKET STATUS
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            {current?.live && (
              <div className="mc" style={{fontSize:7,color:"#52b788",
                textShadow:"1px 1px 0 #000",
                animation:"mcTabBlink 1.5s ease-in-out infinite"}}>
                ⚡ LIVE DATA
              </div>
            )}
            <div className="mc" style={{fontSize:7,color:"#f0a500",textShadow:"1px 1px 0 #000"}}>
              {difficulty}
            </div>
            <button onClick={()=>setShowEditor(true)} className="mc" style={{
              background:"#0d1f0d",border:"3px solid #52b788",outline:"2px solid #000",
              color:"#52b788",padding:"5px 11px",fontSize:8,cursor:"pointer",
              boxShadow:"inset -3px -3px 0 rgba(0,0,0,.45)"}}>
              ✏️ NAMES
            </button>
            <button onClick={onClose} className="mc" style={{
              background:"#c0392b",border:"3px solid #922b21",outline:"2px solid #000",
              color:"#fff",padding:"5px 11px",fontSize:8,cursor:"pointer",
              boxShadow:"inset -3px -3px 0 rgba(0,0,0,.45)"}}>
              ✕ CLOSE
            </button>
          </div>
        </div>

        {/* ── TEAM TABS ─────────────────────────────────────── */}
        <div ref={tabsRef} style={{position:"relative",zIndex:10,flexShrink:0,
          overflowX:"auto",display:"flex",gap:4,padding:"8px 12px",
          background:"rgba(0,0,0,.55)",borderBottom:"3px solid #1e1e1e",
          scrollbarWidth:"thin",scrollbarColor:"#444 #111"}}>
          {["ALL TEAMS",...ALL_TEAMS].map(name=>{
            const isSel = selTeam===name;
            return (
              <button key={name} onClick={()=>setSelTeam(name)}
                className="mc"
                style={{flexShrink:0,padding:"5px 10px",fontSize:6,
                  whiteSpace:"nowrap",cursor:"pointer",
                  background: isSel ? "#1a3a1a" : "rgba(0,0,0,.4)",
                  border:     `2px solid ${isSel?"#52b788":"#333"}`,
                  outline:    isSel?"1px solid #000":"none",
                  color:      isSel?"#52b788":"#888",
                  boxShadow:  isSel
                    ? "inset -2px -2px 0 rgba(0,0,0,.4),0 0 8px #52b78840"
                    : "inset -2px -2px 0 rgba(0,0,0,.3)",
                  transition:"all .15s"}}>
                {name==="ALL TEAMS" ? "🌍 ALL TEAMS" : name}
              </button>
            );
          })}
        </div>

        {/* ── WORLD AREA (scrollable) ───────────────────────── */}
        <div style={{flex:1,position:"relative",overflow:"hidden",minHeight:0}}>

          {loading && (
            <div className="mc" style={{position:"absolute",inset:0,display:"flex",
              flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,
              color:"#52b788",fontSize:11,textShadow:"2px 2px 0 #000",zIndex:20}}>
              <div style={{fontSize:36,animation:"mcSpinCoin 0.8s linear infinite",
                display:"inline-block"}}>🪙</div>
              LOADING TICKETS...
            </div>
          )}

          {/* ── JIRA STATS ────────────────────────────────── */}
          {!loading && jira && (
            <div style={{position:"absolute",top:12,left:"50%",transform:"translateX(-50%)",
              zIndex:5,display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
              <div className="mc" style={{fontSize:7,color:"#5b9bd5",textShadow:"1px 1px 0 #000",
                background:"rgba(0,0,0,.6)",padding:"3px 10px",border:"2px solid #5b9bd5",
                outline:"1px solid #000"}}>
                🔵 JIRA TICKETS — {selTeam}
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
                <StatBlock emoji="📂" label="OPEN"    value={jira.open}       color="#3498db" bg="#050f1c" pulse={false}/>
                <StatBlock emoji="⚙️"  label="IN PROG" value={jira.inProgress} color="#f0a500" bg="#1c1205" pulse={false}/>
                <StatBlock emoji="🔥" label="CRITICAL" value={jira.critical}  color="#e74c3c" bg="#1c0505" pulse={jira.critical>0}/>
                <StatBlock emoji="📦" label="ON HOLD"  value={jira.onHold}    color="#9b59b6" bg="#0f0518" pulse={false}/>
                <StatBlock emoji="✅" label="DONE"     value={jira.done}      color="#52b788" bg="#05130a" pulse={false}/>
              </div>
            </div>
          )}

          {/* ── ZOHO STATS ────────────────────────────────── */}
          {!loading && zoho && (
            <div style={{position:"absolute",top:140,left:"50%",transform:"translateX(-50%)",
              zIndex:5,display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
              <div className="mc" style={{fontSize:7,color:"#e67e22",textShadow:"1px 1px 0 #000",
                background:"rgba(0,0,0,.6)",padding:"3px 10px",border:"2px solid #e67e22",
                outline:"1px solid #000"}}>
                🟠 ZOHO DESK TICKETS
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
                <StatBlock emoji="📨" label="OPEN"     value={zoho.open}     color="#e67e22" bg="#1c0e05" pulse={false}/>
                <StatBlock emoji="⏸️"  label="PENDING"  value={zoho.pending}  color="#9b59b6" bg="#0f0518" pulse={false}/>
                <StatBlock emoji="🚨" label="CRITICAL" value={zoho.critical} color="#e74c3c" bg="#1c0505" pulse={zoho.critical>0}/>
                <StatBlock emoji="🎉" label="RESOLVED" value={zoho.resolved} color="#52b788" bg="#05130a" pulse={false}/>
              </div>
            </div>
          )}

          {/* ── HEALTH BARS ───────────────────────────────── */}
          {!loading && (
            <div style={{position:"absolute",top:258,left:"50%",transform:"translateX(-50%)",
              zIndex:5,textAlign:"center",minWidth:360}}>
              <div className="mc" style={{fontSize:6,color:"#aaa",marginBottom:5,
                textShadow:"1px 1px 0 #000"}}>── PLATFORM HEALTH ──</div>
              <div style={{display:"flex",gap:3,justifyContent:"center",marginBottom:10}}>
                {Array.from({length:10}).map((_,i)=>(
                  <div key={i} style={{fontSize:18,lineHeight:1,
                    filter:i<hearts?"none":"grayscale(1) brightness(.2)",
                    transition:"filter .4s"}}>❤️</div>
                ))}
              </div>
              <div className="mc" style={{fontSize:6,color:"#7FFF00",marginBottom:4,
                textShadow:"1px 1px 0 #000",animation:"mcXPPulse 2.5s ease-in-out infinite"}}>
                GOVERNANCE XP — 94.3%
              </div>
              <div style={{width:320,height:14,background:"#000",border:"3px solid #444",margin:"0 auto"}}>
                <div style={{width:"94.3%",height:"100%",
                  background:"linear-gradient(90deg,#7FFF00,#ADFF2F)",
                  boxShadow:"0 0 10px #7FFF0055"}}/>
              </div>
            </div>
          )}

          {/* ── WALKING CHARACTERS ────────────────────────── */}
          <div style={{position:"absolute",bottom:68,left:0,right:0,height:95,
            overflow:"hidden",zIndex:4}}>
            {TICKET_CHARS.map((c,i)=>(
              <McCharacter key={i} char={{...c, defaultName: charNames[i] ?? c.defaultName}}
                count={charCount(c)}
                teamName={selTeam==="ALL TEAMS"?"ALL TEAMS":selTeam} tick={tick}/>
            ))}
          </div>

          {/* ── TORCHES ───────────────────────────────────── */}
          {[10,23,38,53,68,83].map(p=><Torch key={p} leftPct={p}/>)}

          {/* ── GROUND ────────────────────────────────────── */}
          <Ground/>

          {/* ── NAMES EDITOR OVERLAY ──────────────────────── */}
          {showEditor && (
            <NamesEditor
              names={charNames}
              onSave={saveNames}
              onClose={() => setShowEditor(false)}
            />
          )}

          {/* ── TICKER ────────────────────────────────────── */}
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:24,
            background:"rgba(0,0,0,.85)",borderTop:"3px solid #222",
            overflow:"hidden",display:"flex",alignItems:"center",zIndex:10}}>
            <div className="mc" style={{fontSize:6,whiteSpace:"nowrap",
              animation:"mcTickerScroll 32s linear infinite",
              display:"flex",gap:28,alignItems:"center"}}>
              {[
                {c:"#52b788", t:`⚡ LIVE: ${selTeam}`},
                {c:"#5b9bd5", t:`🔵 JIRA OPEN: ${jira?.open??0}`},
                {c:"#e74c3c", t:`🔥 CRITICAL: ${(jira?.critical??0)+(zoho?.critical??0)}`},
                {c:"#e67e22", t:`🟠 ZOHO OPEN: ${zoho?.open??0}`},
                {c:"#9b59b6", t:`📦 ON HOLD: ${(jira?.onHold??0)+(zoho?.pending??0)}`},
                {c:"#52b788", t:`✅ RESOLVED: ${zoho?.resolved??0}`},
                {c:"#f0a500", t:`📊 TOTAL TEAMS: ${teams.length}`},
                {c:"#7FFF00", t:`🛡️ GOVERNANCE: 94.3%`},
              ].map(({c,t},i)=>(
                <span key={i} style={{color:c}}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
