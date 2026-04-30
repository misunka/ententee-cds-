import { useState, useRef, useEffect, lazy, Suspense } from "react";

// Minimal initial render — heavy stuff is lazy-loaded after handshake
const MainApp = lazy(() => Promise.resolve({ default: MainAppImpl }));

export default function App() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    // Defer heavy mount to next tick so the iframe can complete its ready-handshake first
    const t = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(t);
  }, []);
  if (!ready) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#F7F9FC', fontFamily:'system-ui,sans-serif' }}>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}>
          <div style={{ width:48, height:48, borderRadius:'50%', background:'linear-gradient(135deg,#C52060,#870537)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ color:'#fff', fontWeight:700, fontSize:24 }}>e</span>
          </div>
          <div style={{ color:'#838383', fontSize:13 }}>Loading…</div>
        </div>
      </div>
    );
  }
  return (
    <Suspense fallback={null}>
      <MainApp/>
    </Suspense>
  );
}

// ========== Main app implementation ==========

const C = {
  bubblegum: '#C52060', bubblegumDark: '#870537', bubblegumLight: '#FFB7D0',
  sky: '#2A9FD4', skyDark: '#086088',
  apple: '#6EB41B', appleDark: '#498205',
  charcoal: '#242424', white: '#FFFFFF', moonrock: '#E9E9E9', graphite: '#838383',
  lemon: '#F0BE0F', amber: '#A18009', amberBg: '#fffbeb', amberBorder: '#fcd34d',
  bg: '#F7F9FC',
};
const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

function Svg({ children, size, color }) {
  return (
    <svg width={size||18} height={size||18} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display:'block', flexShrink:0 }}>
      {children}
    </svg>
  );
}
const IconSend     = (p) => <Svg {...p}><path d="M22 2 11 13"/><path d="M22 2l-7 20-4-9-9-4Z"/></Svg>;
const IconFile     = (p) => <Svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></Svg>;
const IconCamera   = (p) => <Svg {...p}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></Svg>;
const IconX        = (p) => <Svg {...p}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></Svg>;
const IconPlus     = (p) => <Svg {...p}><path d="M12 5v14"/><path d="M5 12h14"/></Svg>;
const IconMenu     = (p) => <Svg {...p}><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></Svg>;
const IconUser     = (p) => <Svg {...p}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></Svg>;
const IconStetho   = (p) => <Svg {...p}><path d="M11 2v2"/><path d="M5 2v2"/><path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"/><path d="M8 15a6 6 0 0 0 12 0v-3"/><circle cx="20" cy="10" r="2"/></Svg>;
const IconBook     = (p) => <Svg {...p}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z"/></Svg>;
const IconAlert    = (p) => <Svg {...p}><path d="m21.7 16.5-9-15.5a2 2 0 0 0-3.4 0l-9 15.5A2 2 0 0 0 2 19h18a2 2 0 0 0 1.7-2.5z"/><path d="M12 9v4"/><path d="M12 17h.01"/></Svg>;
const IconChevDown = (p) => <Svg {...p}><path d="m6 9 6 6 6-6"/></Svg>;
const IconChevUp   = (p) => <Svg {...p}><path d="m18 15-6-6-6 6"/></Svg>;
const IconCheck    = (p) => <Svg {...p}><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></Svg>;
const IconXCircle  = (p) => <Svg {...p}><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></Svg>;

let counter = 0;
function mkId() { counter += 1; return 'id-' + counter; }

const WELCOME_MSG = {
  id: 'welcome', type: 'assistant',
  content: "Hello! I'm your ententee Clinical Decision Support assistant. How can I help you today?",
  structured: null, judge: null, judging: false, fileNames: []
};

const MOCK = [
  { shrnuti:"Klinický obraz odpovídá primární hypertenzi. Doporučuje se zahájit monoterapii ACE inhibitorem.",
    dukazy:[
      { text:"ACE inhibitory a ARB jsou preferovanou první linií léčby hypertenze u pacientů s diabetem nebo CKD.", citace:"Williams et al., 2018" },
      { text:"Cílové hodnoty TK < 130/80 mmHg pro hypertoniky mladší 65 let.", citace:"Mancia et al., 2023" },
      { text:"Kombinace ACE inhibitor + CCB preferována při nedostatečné odpovědi na monoterapii.", citace:"Kjeldsen et al., 2022" }
    ],
    omezeni:"Individuální anamnéza a kontraindikace musí být zohledněny před zahájením léčby." },
  { shrnuti:"Prioritou je vyloučit akutní koronární syndrom. Doporučuje se urgentní EKG a troponin.",
    dukazy:[
      { text:"Bolest na hrudi s propagací do levé HK je klasickou prezentací STEMI.", citace:"Thygesen et al., 2018" },
      { text:"Plicní embolie může imitovat ACS, doporučuje se kalkulace Wells score.", citace:"Konstantinides et al., 2019" },
      { text:"Disekce aorty: trhavá bolest do zad, kontraindikována antikoagulace.", citace:"Erbel et al., 2014" }
    ],
    omezeni:"Klinické rozhodnutí musí vycházet z fyzikálního vyšetření a diagnostiky." },
  { shrnuti:"Laboratorní hodnoty naznačují renální insuficienci G2 dle KDIGO.",
    dukazy:[
      { text:"eGFR 60-89 ml/min/1,73m2 odpovídá CKD G2. Indikována kontrola za 12 měsíců.", citace:"KDIGO, 2022" },
      { text:"Proteinurie nad 30 mg/g je rizikovým faktorem progrese CKD.", citace:"Levey et al., 2020" },
      { text:"Metformin kontraindikován při eGFR pod 30, snížit dávku při eGFR pod 45.", citace:"ADA, 2023" }
    ],
    omezeni:"Diagnóza CKD vyžaduje persistentní abnormalitu déle než 3 měsíce." }
];
const JUDGES_PASS = [
  { pass:true, faithfulness:98, relevance:96, note:"All claims supported by cited literature." },
  { pass:true, faithfulness:94, relevance:99, note:"High source fidelity. Recommendations consistent with context." }
];
const JUDGES_FAIL = [
  { pass:false, faithfulness:61, relevance:88, note:"Drug dosage claim not explicitly supported by cited sources." },
  { pass:false, faithfulness:78, relevance:54, note:"Response partially deviates from original query." }
];
function pickMock() { return MOCK[Math.floor(Math.random() * MOCK.length)]; }
function pickJudge() {
  if (Math.random() < 0.75) return JUDGES_PASS[Math.floor(Math.random() * JUDGES_PASS.length)];
  return JUDGES_FAIL[Math.floor(Math.random() * JUDGES_FAIL.length)];
}

function EntenteeLogo({ small }) {
  const h = small ? 30 : 38;
  return (
    <div style={{ display:'flex', alignItems:'center', gap: small ? 8 : 10, flexShrink:0 }}>
      <div style={{ width:h, height:h, borderRadius:'50%', background:`linear-gradient(135deg,${C.bubblegum},${C.bubblegumDark})`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <span style={{ color:C.white, fontWeight:700, fontSize: small ? 15 : 20, lineHeight:1 }}>e</span>
      </div>
      <div>
        <div style={{ fontWeight:700, fontSize: small ? 14 : 18, color:C.bubblegum, lineHeight:1.2 }}>ententee</div>
        <div style={{ fontSize: small ? 9 : 10, color:C.graphite, letterSpacing:'0.4px' }}>Clinical Decision Support</div>
      </div>
    </div>
  );
}

function Avatar({ isUser }) {
  return (
    <div style={{ width:36, height:36, borderRadius:10, background: isUser ? `linear-gradient(135deg,${C.sky},${C.skyDark})` : `linear-gradient(135deg,${C.bubblegum},${C.bubblegumDark})`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      {isUser ? <IconUser size={18} color={C.white}/> : <IconStetho size={18} color={C.white}/>}
    </div>
  );
}

function TypingDots() {
  return (
    <div style={{ display:'flex', gap:5, padding:'14px 18px', background:C.white, borderRadius:'4px 16px 16px 16px', border:`1px solid ${C.moonrock}` }}>
      {[0,1,2].map(i => <div key={i} style={{ width:8, height:8, borderRadius:'50%', background:C.bubblegum, animation:'bop 1.2s ease-in-out '+(i*0.2)+'s infinite' }}/>)}
    </div>
  );
}

function ScoreBar({ value, color }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <div style={{ flex:1, height:6, background:C.moonrock, borderRadius:3, overflow:'hidden' }}>
        <div style={{ width: value+'%', height:'100%', background:color, borderRadius:3 }}/>
      </div>
      <span style={{ fontSize:12, fontWeight:700, color, minWidth:30 }}>{value}%</span>
    </div>
  );
}

function JudgePanel({ judge }) {
  const [open, setOpen] = useState(false);
  const isPass = judge.pass;
  const accent = isPass ? C.appleDark : C.bubblegumDark;
  const bg = isPass ? '#f0fdf4' : '#fff0f5';
  const border = isPass ? '#bbf7d0' : C.bubblegumLight;
  return (
    <div style={{ marginTop:10, border:`1px solid ${border}`, borderRadius:10, overflow:'hidden', fontSize:13 }}>
      <button onClick={() => setOpen(!open)} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 13px', background:bg, border:'none', cursor:'pointer', fontFamily:FONT }}>
        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
          {isPass ? <IconCheck size={15} color={accent}/> : <IconXCircle size={15} color={accent}/>}
          <span style={{ fontWeight:700, color:accent }}>LLM-as-a-Judge: {isPass ? 'Verified' : 'Validation Failed'}</span>
        </div>
        {open ? <IconChevUp size={14} color={accent}/> : <IconChevDown size={14} color={accent}/>}
      </button>
      {open ? (
        <div style={{ padding:'12px 14px', background:C.white, display:'flex', flexDirection:'column', gap:10 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div>
              <div style={{ fontSize:10, color:C.graphite, marginBottom:4, fontWeight:600, textTransform:'uppercase' }}>Source Faithfulness</div>
              <ScoreBar value={judge.faithfulness} color={judge.faithfulness >= 80 ? C.appleDark : C.bubblegum}/>
            </div>
            <div>
              <div style={{ fontSize:10, color:C.graphite, marginBottom:4, fontWeight:600, textTransform:'uppercase' }}>Answer Relevance</div>
              <ScoreBar value={judge.relevance} color={judge.relevance >= 80 ? C.appleDark : C.lemon}/>
            </div>
          </div>
          <div style={{ background:bg, borderRadius:8, padding:'9px 12px', color:accent, lineHeight:1.55 }}>{judge.note}</div>
          {!isPass ? (
            <div style={{ display:'flex', gap:8, background:C.amberBg, border:`1px solid ${C.amberBorder}`, borderRadius:8, padding:'9px 12px' }}>
              <IconAlert size={15} color={C.amber}/>
              <div style={{ fontSize:12, color:C.amber, lineHeight:1.5 }}>
                <strong>Clinical Warning:</strong> Claims could not be strictly verified. Review sources before clinical use.
              </div>
            </div>
          ) : null}
          <div style={{ fontSize:11, color:C.graphite, textAlign:'right' }}>Model: Llama 4 Scout (mock)</div>
        </div>
      ) : null}
    </div>
  );
}

function StructuredMsg({ data, judge, judging }) {
  const [openD, setOpenD] = useState(true);
  const [openO, setOpenO] = useState(false);
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      <div style={{ background:`${C.bubblegum}09`, borderLeft:`3px solid ${C.bubblegum}`, borderRadius:'0 8px 8px 0', padding:'10px 14px' }}>
        <div style={{ fontSize:10, fontWeight:700, color:C.bubblegum, textTransform:'uppercase', letterSpacing:1, marginBottom:5 }}>Shrnutí</div>
        <div style={{ fontSize:14, lineHeight:1.65, color:C.charcoal }}>{data.shrnuti}</div>
      </div>
      <div style={{ border:`1px solid ${C.moonrock}`, borderRadius:8, overflow:'hidden' }}>
        <button onClick={() => setOpenD(!openD)} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 14px', background:'#f8fafc', border:'none', cursor:'pointer', borderBottom: openD ? `1px solid ${C.moonrock}` : 'none', fontFamily:FONT }}>
          <span style={{ fontSize:10, fontWeight:700, color:C.charcoal, textTransform:'uppercase', letterSpacing:1 }}>Detailní důkazy ({data.dukazy.length})</span>
          {openD ? <IconChevUp size={14} color={C.graphite}/> : <IconChevDown size={14} color={C.graphite}/>}
        </button>
        {openD ? (
          <div style={{ padding:'10px 14px', display:'flex', flexDirection:'column', gap:10 }}>
            {data.dukazy.map((d, i) => (
              <div key={i} style={{ fontSize:14, lineHeight:1.65, color:C.charcoal }}>
                {d.text}{' '}
                <span style={{ display:'inline-flex', alignItems:'center', gap:3, background:`${C.sky}15`, color:C.skyDark, borderRadius:5, padding:'1px 7px', fontSize:11, fontWeight:600, whiteSpace:'nowrap', border:`1px solid ${C.sky}30` }}>
                  <IconBook size={10}/>{d.citace}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <div style={{ border:`1px solid ${C.moonrock}`, borderRadius:8, overflow:'hidden' }}>
        <button onClick={() => setOpenO(!openO)} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 14px', background:'#fffbf0', border:'none', cursor:'pointer', borderBottom: openO ? `1px solid ${C.moonrock}` : 'none', fontFamily:FONT }}>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <IconAlert size={12} color={C.amber}/>
            <span style={{ fontSize:10, fontWeight:700, color:C.amber, textTransform:'uppercase', letterSpacing:1 }}>Omezení</span>
          </div>
          {openO ? <IconChevUp size={14} color={C.amber}/> : <IconChevDown size={14} color={C.amber}/>}
        </button>
        {openO ? <div style={{ padding:'10px 14px', fontSize:13, lineHeight:1.65, color:C.amber, background:'#fffbf0' }}>{data.omezeni}</div> : null}
      </div>
      {judging ? (
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 13px', background:'#f8fafc', borderRadius:10, border:`1px solid ${C.moonrock}`, fontSize:13, color:C.graphite }}>
          <span>LLM-as-a-Judge validating in background...</span>
        </div>
      ) : null}
      {!judging && judge ? <JudgePanel judge={judge}/> : null}
    </div>
  );
}

function MsgBubble({ msg }) {
  const isUser = msg.type === 'user';
  return (
    <div style={{ display:'flex', gap:12, marginBottom:20, flexDirection: isUser ? 'row-reverse' : 'row' }}>
      <Avatar isUser={isUser}/>
      <div style={{ maxWidth: isUser ? '72%' : '88%', width: (!isUser && msg.structured) ? '88%' : undefined }}>
        <div style={{ background: isUser ? `linear-gradient(135deg,${C.sky},${C.skyDark})` : C.white, borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px', padding:'13px 17px', boxShadow:'0 2px 10px rgba(0,0,0,0.07)', border: isUser ? 'none' : `1px solid ${C.moonrock}` }}>
          {(msg.fileNames || []).map((n, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, background:'rgba(255,255,255,0.2)', borderRadius:7, padding:'5px 9px', marginBottom:6 }}>
              <IconFile size={13}/><span style={{ fontWeight:500 }}>{n}</span>
            </div>
          ))}
          {msg.structured
            ? <StructuredMsg data={msg.structured} judge={msg.judge} judging={msg.judging}/>
            : <div style={{ fontSize:14, lineHeight:1.65, color: isUser ? C.white : C.charcoal, whiteSpace:'pre-wrap', wordBreak:'break-word' }}>{msg.content}</div>
          }
        </div>
      </div>
    </div>
  );
}

function MainAppImpl() {
  const [convs, setConvs] = useState([{ id:'c1', title:'New Patient', messages:[WELCOME_MSG] }]);
  const [activeId, setActiveId] = useState('c1');
  const [input, setInput] = useState('');
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [sidebar, setSidebar] = useState(false);

  const bottomRef = useRef(null);
  const fileRef = useRef(null);
  const camRef = useRef(null);

  const active = convs.find(c => c.id === activeId) || convs[0];
  const msgs = active ? active.messages : [];

  useEffect(() => {
    if (bottomRef.current && bottomRef.current.scrollIntoView) {
      bottomRef.current.scrollIntoView({ behavior:'smooth' });
    }
  }, [msgs.length, busy]);

  function addConv() {
    const c = { id: mkId(), title:'Patient '+(convs.length+1), messages:[WELCOME_MSG] };
    setConvs([c].concat(convs));
    setActiveId(c.id);
    setFiles([]); setInput('');
  }

  function onFileChange(e) {
    const picked = Array.from(e.target.files || []);
    e.target.value = '';
    picked.forEach(f => {
      const reader = new FileReader();
      reader.onload = () => {
        setFiles(prev => prev.concat([{ id: mkId(), name: f.name, type: f.type, b64: reader.result.split(',')[1] }]));
      };
      reader.readAsDataURL(f);
    });
  }

  function send() {
    if (busy || !active) return;
    const text = input.trim();
    if (!text && files.length === 0) return;

    const convId = active.id;
    const fileNames = files.map(f => f.name);
    const userMsgId = mkId();
    const aiId = mkId();

    setInput(''); setFiles([]);
    setConvs(prev => prev.map(c => c.id !== convId ? c : { ...c, messages: c.messages.concat([{ id:userMsgId, type:'user', content:text, fileNames, structured:null, judge:null, judging:false }]) }));
    setBusy(true);

    setTimeout(() => {
      const structured = pickMock();
      setConvs(prev => prev.map(c => c.id !== convId ? c : { ...c, messages: c.messages.concat([{ id:aiId, type:'assistant', content:'', fileNames:[], structured, judge:null, judging:true }]) }));
      setBusy(false);

      setTimeout(() => {
        const verdict = pickJudge();
        setConvs(prev => prev.map(c => c.id !== convId ? c : { ...c, messages: c.messages.map(m => m.id === aiId ? { ...m, judge:verdict, judging:false } : m) }));
      }, 1100);
    }, 1500);
  }

  const canSend = !busy && (input.trim().length > 0 || files.length > 0);

  return (
    <div style={{ display:'flex', height:'100vh', background:C.bg, fontFamily:FONT, overflow:'hidden' }}>
      <input ref={fileRef} type="file" accept=".pdf,image/*,.xml" multiple onChange={onFileChange} style={{ display:'none' }}/>
      <input ref={camRef} type="file" accept="image/*" capture="environment" onChange={onFileChange} style={{ display:'none' }}/>

      {sidebar ? (
        <div style={{ width:265, background:C.white, borderRight:`1px solid ${C.moonrock}`, display:'flex', flexDirection:'column', flexShrink:0 }}>
          <div style={{ padding:'18px 20px 15px', borderBottom:`1px solid ${C.moonrock}` }}>
            <EntenteeLogo/>
          </div>
          <div style={{ padding:14 }}>
            <button onClick={addConv} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:`linear-gradient(135deg,${C.bubblegum},${C.bubblegumDark})`, color:C.white, borderRadius:10, padding:'11px 0', border:'none', cursor:'pointer', fontWeight:700, fontSize:13, fontFamily:FONT }}>
              <IconPlus size={16} color={C.white}/> New Patient
            </button>
          </div>
          <div style={{ flex:1, overflowY:'auto', padding:'0 10px' }}>
            {convs.map(c => {
              const isActive = c.id === activeId;
              return (
                <div key={c.id} onClick={() => setActiveId(c.id)} style={{ background: isActive ? `${C.bubblegum}10` : 'transparent', borderLeft: isActive ? `3px solid ${C.bubblegum}` : '3px solid transparent', borderRadius:'0 8px 8px 0', padding:'9px 10px', cursor:'pointer', marginBottom:3 }}>
                  <div style={{ fontSize:13, fontWeight:500, color:C.charcoal }}>{c.title}</div>
                  <div style={{ fontSize:11, color:C.graphite }}>{c.messages.length} messages</div>
                </div>
              );
            })}
          </div>
          <div style={{ padding:'12px 16px', borderTop:`1px solid ${C.moonrock}`, textAlign:'center', fontSize:11, color:C.graphite }}>ententee CDS · Demo</div>
        </div>
      ) : null}

      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
        <div style={{ background:C.white, borderBottom:`1px solid ${C.moonrock}`, padding:'11px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={() => setSidebar(!sidebar)} style={{ padding:7, background:`${C.bubblegum}10`, border:'none', borderRadius:8, cursor:'pointer', display:'flex', color:C.bubblegum }}>
              <IconMenu size={18}/>
            </button>
            <EntenteeLogo small/>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:14, fontWeight:500, color:C.charcoal }}>{active ? active.title : ''}</span>
            <div style={{ fontSize:11, background:`linear-gradient(135deg,${C.bubblegum},${C.bubblegumDark})`, color:C.white, padding:'5px 12px', borderRadius:20, fontWeight:700 }}>AI Active</div>
          </div>
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'24px 20px', display:'flex', justifyContent:'center' }}>
          <div style={{ width:'100%', maxWidth:800 }}>
            {msgs.map(msg => <MsgBubble key={msg.id} msg={msg}/>)}
            {busy ? (
              <div style={{ display:'flex', gap:12, marginBottom:20 }}>
                <Avatar isUser={false}/><TypingDots/>
              </div>
            ) : null}
            <div ref={bottomRef}/>
          </div>
        </div>

        <div style={{ borderTop:`1px solid ${C.moonrock}`, background:C.white, padding:'12px 20px', flexShrink:0, display:'flex', justifyContent:'center' }}>
          <div style={{ width:'100%', maxWidth:800 }}>
            {files.length > 0 ? (
              <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:9 }}>
                {files.map(f => (
                  <div key={f.id} style={{ display:'flex', alignItems:'center', gap:5, background:`${C.sky}12`, border:`1px solid ${C.sky}35`, borderRadius:8, padding:'5px 9px', fontSize:12, color:C.skyDark }}>
                    <IconFile size={13}/>
                    <span style={{ fontWeight:500, maxWidth:140, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.name}</span>
                    <button onClick={() => setFiles(files.filter(x => x.id !== f.id))} style={{ background:'none', border:'none', cursor:'pointer', padding:0, display:'flex', color:C.sky }}>
                      <IconX size={13}/>
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <button onClick={() => fileRef.current && fileRef.current.click()} style={{ width:42, height:42, borderRadius:10, border:`2px solid ${C.moonrock}`, background:'#F7F9FC', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:C.graphite }}>
                <IconFile size={18}/>
              </button>
              <button onClick={() => camRef.current && camRef.current.click()} style={{ width:42, height:42, borderRadius:10, border:`2px solid ${C.moonrock}`, background:'#F7F9FC', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:C.graphite }}>
                <IconCamera size={18}/>
              </button>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Enter clinical query..."
                disabled={busy}
                style={{ flex:1, background:'#F7F9FC', border:`2px solid ${C.bubblegum}`, borderRadius:10, padding:'11px 15px', fontSize:14, outline:'none', color:C.charcoal, minWidth:0, fontFamily:FONT }}
              />
              <button onClick={send} disabled={!canSend} style={{ width:42, height:42, borderRadius:10, border:'none', background: canSend ? `linear-gradient(135deg,${C.bubblegum},${C.bubblegumDark})` : C.moonrock, cursor: canSend ? 'pointer' : 'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <IconSend size={18} color={C.white}/>
              </button>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes bop{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}`}</style>
    </div>
  );
}
