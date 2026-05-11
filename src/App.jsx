import { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { useBares } from "./hooks/useBares";
import { useFeed } from "./hooks/useFeed";
import { useNotificaciones } from "./hooks/useNotificaciones";
import { useHistorias } from "./hooks/useHistorias";
import { usePosts } from "./hooks/usePosts";
import { useQuedadas } from "./hooks/useQuedadas";
import { computeBadges } from "./lib/badges";
import LoginPage from "./pages/LoginPage";
import AddBarModal from "./components/AddBarModal";
import DebateModal from "./components/DebateModal";
import MapaReal from "./components/MapaReal";
import BarDetalleModal from "./components/BarDetalleModal";
import EditPerfilModal from "./components/EditPerfilModal";
import NotifPanel from "./components/NotifPanel";
import HistoriasCarrusel from "./components/HistoriasCarrusel";
import NuevoPostModal from "./components/NuevoPostModal";
import QuedadasPanel from "./components/QuedadasPanel";
import EstadisticasPanel from "./components/EstadisticasPanel";

const FONTS = `@import url("https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Instrument+Sans:wght@400;500&display=swap");`;

const CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --red:#D94F3D;--red-light:#F5E8E6;--red-dark:#9C3327;
  --amber:#D4873A;--amber-light:#FDF0E4;
  --green:#3A7D5B;--green-light:#E4F2EB;
  --gray-50:#F7F6F4;--gray-100:#EDEBE7;--gray-200:#D8D4CC;
  --gray-400:#9E9A92;--gray-600:#5C5852;
  --purple-light:#EEEAF8;--purple:#6B5EA8;
  --ink:#1A1916;--paper:#FDFCFA;
  --border:rgba(26,25,22,0.1);--border-strong:rgba(26,25,22,0.18);
  --radius:12px;--radius-lg:18px;
  --font-display:"Syne",sans-serif;--font-body:"Instrument Sans",sans-serif;
}
body{font-family:var(--font-body);background:var(--gray-50);color:var(--ink);-webkit-font-smoothing:antialiased}
.app-shell{min-height:100vh;display:flex;flex-direction:column;max-width:480px;margin:0 auto;background:var(--paper);position:relative;box-shadow:0 2px 8px rgba(26,25,22,0.1),0 8px 24px rgba(26,25,22,0.07)}
.topbar{background:var(--ink);padding:14px 18px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50}
.logo{font-family:var(--font-display);font-size:22px;font-weight:800;color:var(--paper);letter-spacing:-0.5px;display:flex;align-items:center;gap:8px}
.logo-dot{width:9px;height:9px;border-radius:50%;background:var(--red);display:inline-block}
.viernes-chip{font-size:10px;font-weight:500;background:var(--amber);color:white;padding:2px 8px;border-radius:20px}
.user-chip{width:32px;height:32px;border-radius:50%;background:var(--red);display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-size:11px;font-weight:700;color:white;cursor:pointer;overflow:hidden}
.user-chip img{width:100%;height:100%;object-fit:cover}
.bottom-nav{background:var(--ink);display:flex;position:sticky;bottom:0;z-index:50}
.nav-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:10px 4px 12px;background:none;border:none;cursor:pointer;color:var(--gray-600);font-family:var(--font-body);font-size:10px;transition:color 0.15s}
.nav-item.active{color:var(--paper)}
.nav-item svg{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.nav-fab{flex:1;display:flex;flex-direction:column;align-items:center;padding:4px 4px 12px;background:none;border:none;cursor:pointer}
.fab-circle{width:44px;height:44px;border-radius:50%;background:var(--red);display:flex;align-items:center;justify-content:center;margin-top:-20px;border:3px solid var(--ink)}
.section{flex:1;overflow-y:auto;padding-bottom:8px}
.rank-header{padding:16px 16px 8px;display:flex;align-items:center;justify-content:space-between}
.rank-title{font-family:var(--font-display);font-size:13px;font-weight:600;color:var(--gray-600);text-transform:uppercase;letter-spacing:1px}
.toggle-wrap{display:flex;background:var(--gray-100);border-radius:8px;padding:2px;gap:2px}
.toggle-opt{font-size:11px;font-weight:500;padding:4px 10px;border-radius:6px;border:none;background:none;color:var(--gray-600);cursor:pointer;font-family:var(--font-body)}
.toggle-opt.on{background:var(--paper);color:var(--ink);box-shadow:0 1px 3px rgba(0,0,0,0.12)}
.bar-card{background:var(--paper);margin:0 12px 8px;border-radius:var(--radius-lg);border:1px solid var(--border);overflow:hidden;cursor:pointer}
.bar-card.crown{border-color:var(--amber);border-width:1.5px}
.bar-card.ghost-card{border-style:dashed;opacity:0.75}
.bar-card.hot-card{border-color:var(--red);border-width:1.5px}
.card-main{display:flex;align-items:center;gap:10px;padding:12px 14px}
.rank-num{font-family:var(--font-display);font-size:20px;font-weight:800;min-width:26px;text-align:center;color:var(--gray-400)}
.rank-num.gold{color:var(--amber)}.rank-num.silver{color:var(--gray-400)}.rank-num.bronze{color:#A0563A}
.bar-thumb{width:50px;height:50px;border-radius:10px;background:var(--gray-100);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;border:1px solid var(--border);overflow:hidden}
.bar-thumb img{width:100%;height:100%;object-fit:cover}
.bar-info{flex:1;min-width:0}
.bar-name{font-family:var(--font-display);font-size:14px;font-weight:700;color:var(--ink);display:flex;align-items:center;gap:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bar-meta{font-size:11px;color:var(--gray-400);margin-top:2px}
.bar-right{display:flex;flex-direction:column;align-items:flex-end;gap:4px}
.score-num{font-family:var(--font-display);font-size:22px;font-weight:800;color:var(--ink);line-height:1}
.score-sub{font-size:10px;color:var(--gray-400)}
.fav-btn{background:none;border:none;cursor:pointer;font-size:18px;padding:2px;line-height:1}
.pills-row{display:flex;gap:5px;padding:0 14px 12px;flex-wrap:wrap}
.pill{font-size:10px;font-weight:500;padding:3px 8px;border-radius:20px}
.pill-beer{background:var(--amber-light);color:var(--amber)}
.pill-crown{background:var(--amber-light);color:var(--amber)}
.pill-ghost{background:var(--gray-100);color:var(--gray-600)}
.pill-visit{background:var(--purple-light);color:var(--purple)}
.pill-hot{background:var(--red-light);color:var(--red-dark)}
.donde-wrap{margin:4px 12px 12px}
.donde-btn{width:100%;padding:12px;border:1.5px dashed var(--gray-200);border-radius:var(--radius);background:none;cursor:pointer;font-family:var(--font-display);font-size:13px;font-weight:600;color:var(--gray-600);display:flex;align-items:center;justify-content:center;gap:8px}
.donde-btn:hover{border-color:var(--red);color:var(--red)}
.donde-result{margin-top:8px;background:var(--red-light);border-radius:var(--radius);padding:14px;text-align:center;animation:popIn 0.25s ease}
.donde-bar{font-family:var(--font-display);font-size:16px;font-weight:800;color:var(--red-dark)}
.donde-sub{font-size:11px;color:var(--red);margin-top:3px}
@keyframes popIn{from{transform:scale(0.95);opacity:0}to{transform:scale(1);opacity:1}}
.map-container{padding:12px}
.map-search-bar{display:flex;align-items:center;gap:8px;background:var(--paper);border:1px solid var(--border-strong);border-radius:var(--radius);padding:9px 12px;margin-bottom:10px}
.map-search-bar input{flex:1;border:none;background:none;font-size:13px;color:var(--ink);outline:none;font-family:var(--font-body)}
.map-search-bar input::placeholder{color:var(--gray-400)}
.map-visual{height:220px;border-radius:var(--radius-lg);overflow:hidden;border:1px solid var(--border);position:relative;background:#DDE8F0}
.map-grid-h{position:absolute;background:white;opacity:0.7;height:2px;width:100%}
.map-grid-v{position:absolute;background:white;opacity:0.7;width:2px;height:100%}
.map-block{position:absolute;background:#B8CFDF;border-radius:4px}
.map-pin{position:absolute;display:flex;flex-direction:column;align-items:center;cursor:pointer;transform:translateX(-50%)}
.pin-dot{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;border:2.5px solid white}
.pin-dot.red-pin{background:var(--red)}.pin-dot.amber-pin{background:var(--amber)}.pin-dot.gray-pin{background:var(--gray-400)}
.pin-label{font-family:var(--font-display);font-size:9px;font-weight:700;background:var(--paper);border:1px solid var(--border);border-radius:6px;padding:2px 5px;margin-top:3px;white-space:nowrap;color:var(--ink)}
.map-add-fab{position:absolute;bottom:12px;right:12px;width:38px;height:38px;border-radius:50%;background:var(--red);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center}
.map-legend{display:flex;gap:12px;margin-top:8px}
.legend-item{display:flex;align-items:center;gap:5px;font-size:10px;color:var(--gray-600)}
.legend-dot{width:8px;height:8px;border-radius:50%}
.nearby-section{margin-top:14px}
.nearby-title{font-family:var(--font-display);font-size:11px;font-weight:700;color:var(--gray-400);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px}
.nearby-item{display:flex;align-items:center;gap:10px;padding:9px 12px;background:var(--paper);border:1px solid var(--border);border-radius:var(--radius);margin-bottom:6px}
.nearby-color{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.nearby-name{font-family:var(--font-display);font-size:13px;font-weight:700;color:var(--ink);flex:1}
.nearby-dist{font-size:11px;color:var(--gray-400)}
.checkin-btn{font-size:10px;font-weight:600;background:var(--purple-light);color:var(--purple);border:none;border-radius:8px;padding:4px 9px;cursor:pointer}
.checkin-btn.done{background:var(--green-light);color:var(--green)}
.feed-wrap{padding:12px 12px 0}
.feed-card{background:var(--paper);border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;margin-bottom:10px}
.feed-card.hot{border-color:var(--red);border-width:1.5px}
.hot-banner{background:var(--red-light);padding:7px 14px;font-size:11px;font-weight:600;color:var(--red-dark);display:flex;align-items:center;gap:6px}
.feed-header{display:flex;align-items:center;gap:9px;padding:11px 14px 7px}
.feed-avatar{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-size:10px;font-weight:800;flex-shrink:0;overflow:hidden}
.feed-avatar img{width:100%;height:100%;object-fit:cover}
.feed-user-name{font-family:var(--font-display);font-size:13px;font-weight:700;color:var(--ink)}
.feed-bar-ref{font-size:11px;color:var(--gray-400);margin-top:1px}
.feed-time{font-size:10px;color:var(--gray-400);margin-left:auto}
.feed-img{width:100%;height:130px;object-fit:cover;display:block;background:var(--gray-100)}
.feed-body{padding:10px 14px}
.feed-text{font-size:13px;color:var(--ink);line-height:1.55}
.nota-chip{display:inline-block;background:var(--amber-light);color:var(--amber);font-size:10px;font-weight:600;padding:2px 8px;border-radius:10px;margin-top:6px;font-family:var(--font-display)}
.comments-wrap{border-top:1px solid var(--border)}
.comment-row{display:flex;gap:8px;padding:8px 14px;border-bottom:1px solid var(--border)}
.comment-row:last-of-type{border-bottom:none}
.c-avatar{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-size:8px;font-weight:800;flex-shrink:0;margin-top:1px;overflow:hidden}
.c-body{flex:1}
.c-user{font-family:var(--font-display);font-size:11px;font-weight:700;color:var(--ink)}
.c-text{font-size:12px;color:var(--ink);line-height:1.45;margin-top:2px}
.c-reactions{display:flex;gap:4px;margin-top:5px;flex-wrap:wrap}
.react-btn{font-size:11px;background:var(--gray-50);border:1px solid var(--border);border-radius:10px;padding:2px 7px;cursor:pointer;color:var(--gray-600)}
.react-btn.active{background:var(--amber-light);border-color:var(--amber);color:var(--amber)}
.emoji-quick{display:flex;gap:5px;padding:6px 14px 8px}
.emoji-q{font-size:14px;background:var(--gray-50);border:1px solid var(--border);border-radius:12px;padding:3px 9px;cursor:pointer}
.add-comment-row{display:flex;align-items:center;gap:8px;padding:7px 14px 10px}
.add-comment-row input{flex:1;font-size:12px;padding:6px 11px;border:1px solid var(--border-strong);border-radius:20px;background:var(--gray-50);color:var(--ink);outline:none;font-family:var(--font-body)}
.send-btn{background:var(--red);border:none;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0}
.feed-actions-row{display:flex;align-items:center;gap:10px;padding:7px 14px 9px;border-top:1px solid var(--border)}
.action-btn{display:flex;align-items:center;gap:5px;font-size:12px;color:var(--gray-600);background:none;border:none;cursor:pointer;padding:0}
.action-btn.liked{color:var(--red)}
.action-btn svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.debate-open-btn{margin-left:auto;font-size:10px;font-weight:600;background:var(--red-light);color:var(--red-dark);border:none;border-radius:8px;padding:4px 10px;cursor:pointer;font-family:var(--font-display)}
.profile-hero{background:var(--ink);padding:20px 16px 16px;text-align:center}
.profile-big-avatar{width:60px;height:60px;border-radius:50%;background:var(--red);display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-size:22px;font-weight:800;color:white;margin:0 auto 10px;overflow:hidden}
.profile-big-avatar img{width:100%;height:100%;object-fit:cover}
.profile-name-big{font-family:var(--font-display);font-size:18px;font-weight:800;color:var(--paper)}
.profile-city{font-size:12px;color:var(--gray-400);margin-top:3px}
.badge-strip{display:flex;gap:6px;justify-content:center;margin-top:10px;flex-wrap:wrap}
.badge{font-size:10px;font-weight:600;padding:3px 10px;border-radius:20px;font-family:var(--font-display)}
.badge-gold{background:var(--amber);color:white}
.badge-ghost{background:var(--gray-600);color:var(--paper)}
.stats-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px;background:var(--border);border-top:1px solid var(--border)}
.stat-cell{background:var(--paper);padding:14px 8px;text-align:center}
.stat-num{font-family:var(--font-display);font-size:22px;font-weight:800;color:var(--ink)}
.stat-label{font-size:10px;color:var(--gray-400);margin-top:2px;text-transform:uppercase;letter-spacing:0.5px}
.profile-section{padding:14px 14px 6px}
.section-label{font-family:var(--font-display);font-size:11px;font-weight:700;color:var(--gray-400);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px}
.visit-item{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)}
.visit-item:last-child{border-bottom:none}
.visit-icon{width:34px;height:34px;border-radius:9px;background:var(--red-light);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
.visit-name{font-family:var(--font-display);font-size:13px;font-weight:700;color:var(--ink)}
.visit-meta{font-size:11px;color:var(--gray-400);margin-top:1px}
.with-chip{font-size:10px;font-weight:600;background:var(--purple-light);color:var(--purple);padding:3px 8px;border-radius:8px;margin-left:auto;flex-shrink:0;font-family:var(--font-display)}
.signout-btn{display:block;margin:16px auto;font-size:12px;color:var(--gray-400);background:none;border:none;cursor:pointer;font-family:var(--font-body)}
.overlay{position:fixed;inset:0;background:rgba(26,25,22,0.5);z-index:200;display:flex;align-items:flex-end;animation:fadeIn 0.15s ease}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.sheet{background:var(--paper);border-radius:20px 20px 0 0;padding:18px;width:100%;max-width:480px;margin:0 auto;animation:slideUp 0.22s ease;max-height:88vh;overflow-y:auto}
@keyframes slideUp{from{transform:translateY(40px);opacity:0}to{transform:translateY(0);opacity:1}}
.sheet-handle{width:36px;height:4px;background:var(--gray-200);border-radius:2px;margin:0 auto 16px}
.sheet-title{font-family:var(--font-display);font-size:18px;font-weight:800;color:var(--ink);margin-bottom:16px}
.form-group{margin-bottom:12px}
.form-label{font-size:11px;font-weight:600;color:var(--gray-600);margin-bottom:5px;text-transform:uppercase;letter-spacing:0.5px;display:block;font-family:var(--font-display)}
.form-input{width:100%;padding:10px 12px;border:1px solid var(--border-strong);border-radius:var(--radius);font-size:14px;background:var(--gray-50);color:var(--ink);outline:none;font-family:var(--font-body);transition:border-color 0.15s}
.form-input:focus{border-color:var(--red);background:var(--paper)}
.form-2col{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.star-row{display:flex;gap:5px}
.star-b{font-size:24px;background:none;border:none;cursor:pointer;color:var(--gray-200);padding:0}
.star-b.on{color:var(--amber)}
.upload-zone{border:1.5px dashed var(--gray-200);border-radius:var(--radius);padding:16px;text-align:center;cursor:pointer;color:var(--gray-400);font-size:13px;display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:12px;overflow:hidden}
.upload-zone:hover{border-color:var(--red);color:var(--red)}
.primary-btn{width:100%;background:var(--red);color:white;border:none;border-radius:var(--radius);padding:13px;font-family:var(--font-display);font-size:15px;font-weight:700;cursor:pointer}
.primary-btn:disabled{opacity:0.5;cursor:not-allowed}
.cancel-lnk{width:100%;background:none;border:none;color:var(--gray-400);font-size:13px;padding:10px;cursor:pointer;font-family:var(--font-body)}
.debate-scores{display:flex;align-items:center;gap:10px;margin-bottom:14px}
.d-score-card{flex:1;background:var(--red-light);border-radius:var(--radius);padding:12px;text-align:center}
.d-score-who{font-family:var(--font-display);font-size:11px;font-weight:700;color:var(--red-dark)}
.d-score-num{font-family:var(--font-display);font-size:28px;font-weight:800;color:var(--red-dark);line-height:1;margin:4px 0}
.d-vs{font-family:var(--font-display);font-size:16px;font-weight:800;color:var(--gray-400);flex-shrink:0}
.loading-screen{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--ink);font-family:var(--font-display);font-size:22px;font-weight:800;color:var(--paper);letter-spacing:-0.5px}
.empty-state{padding:40px 20px;text-align:center;color:var(--gray-400);font-size:14px}
.empty-state .emoji{font-size:36px;margin-bottom:10px}
.empty-state .title{font-family:var(--font-display);font-weight:700;margin-bottom:6px;color:var(--ink)}
`;

const COLORS = ["#D94F3D","#D4873A","#3A7D5B","#6B5EA8","#5C5852"];

function initials(name) {
  if (!name) return "?";
  return name.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase();
}

function timeAgo(d) {
  const s = (Date.now()-new Date(d).getTime())/1000;
  if(s<60) return "ahora mismo";
  if(s<3600) return `hace ${Math.floor(s/60)}min`;
  if(s<86400) return `hace ${Math.floor(s/3600)}h`;
  return `hace ${Math.floor(s/86400)} días`;
}

function Avatar({profile,size=30,bgIdx=0}) {
  const bg = COLORS[bgIdx%COLORS.length];
  const s = {width:size,height:size,borderRadius:"50%",background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--font-display)",fontSize:size*0.33,fontWeight:800,color:"white",flexShrink:0,overflow:"hidden"};
  if(profile?.avatar_url) return <div style={s}><img src={profile.avatar_url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/></div>;
  return <div style={s}>{initials(profile?.display_name)}</div>;
}

export default function App() {
  const {session,profile,loading:authLoading,signInWithGoogle,signOut} = useAuth();
  const userId = session?.user?.id;
  const {bares,loading:baresLoading,addBar,toggleFav,addCheckin,uploadImage,refetch} = useBares(userId);
  const {feed,loading:feedLoading,toggleLike,postComment,toggleReaccion,addEmojiComment} = useFeed(userId);
  const {notifs,unread,markAllRead} = useNotificaciones(userId);
  const {historias,addHistoria,refetch:refetchHistorias} = useHistorias(userId);
  const {posts,createPost,deletePost,toggleLike:togglePostLike,addComment:addPostComment,deleteComment:deletePostComment} = usePosts(userId);
  const {quedadas,createQuedada,toggleAsistencia,deleteQuedada} = useQuedadas(userId);

  const [tab,setTab] = useState("ranking");
  const [rankMode,setRankMode] = useState("global");
  const [rankFilter,setRankFilter] = useState("score"); // score | precio | visitas
  const [showAdd,setShowAdd] = useState(false);
  const [pendingCoords,setPendingCoords] = useState(null);
  const [debatePost,setDebatePost] = useState(null);
  const [dondeResult,setDondeResult] = useState(null);
  const [commentInputs,setCommentInputs] = useState({});
  const [localCheckins,setLocalCheckins] = useState({});
  const [selectedBar,setSelectedBar] = useState(null);
  const [showEditPerfil,setShowEditPerfil] = useState(false);
  const [showNotifs,setShowNotifs] = useState(false);
  const [showNewPost,setShowNewPost] = useState(false);
  const [feedTab,setFeedTab] = useState("todo"); // todo | resenas | posts | quedadas | stats

  const isViernes = new Date().getDay()===5 && new Date().getHours()>=18;

  if(authLoading) return <><style>{FONTS}{CSS}</style><div className="loading-screen">Barrio<span style={{color:"#D94F3D"}}>.</span></div></>;
  if(!session) return <LoginPage onLogin={signInWithGoogle}/>;

  const sorted = (() => {
    let list = [...bares]
    // Personal mode: only bars I added or favorited
    if (rankMode === "personal") {
      list = list.filter(b => b.added_by === userId || b.isFav || b.userVisited || localCheckins[b.id])
    }
    // Viernes: cheapest first
    if (isViernes && rankMode === "global") {
      return list.sort((a,b) => (parseFloat(a.precio_cana)||99)-(parseFloat(b.precio_cana)||99))
    }
    // Sort by filter
    switch(rankFilter) {
      case 'precio': return list.sort((a,b) => (parseFloat(a.precio_cana)||99)-(parseFloat(b.precio_cana)||99))
      case 'visitas': return list.sort((a,b) => (b.checkinCount||0)-(a.checkinCount||0))
      default: return list.sort((a,b) => (b.avgScore??0)-(a.avgScore??0))
    }
  })();

  const handleCheckin = async(barId) => {
    await addCheckin(barId);
    setLocalCheckins(p=>({...p,[barId]:true}));
  };

  const sendComment = async(resenaId) => {
    const t = commentInputs[resenaId]||"";
    await postComment(resenaId,t);
    setCommentInputs(p=>({...p,[resenaId]:""}));
  };

  const myPosts = feed.filter(f=>f.user_id===userId);
  const myAvg = myPosts.length ? (myPosts.reduce((s,f)=>s+(f.score||0),0)/myPosts.length).toFixed(1) : "—";

  return (
    <>
      <style>{FONTS}{CSS}</style>
      <div className="app-shell">

        <div className="topbar">
          <div className="logo">
            <span className="logo-dot"/>
            Barrio
            {isViernes && <span className="viernes-chip">Modo Viernes 🍺</span>}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{position:'relative',cursor:'pointer'}} onClick={()=>setShowNotifs(p=>!p)}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
              {unread>0 && <div style={{position:'absolute',top:-4,right:-4,width:16,height:16,borderRadius:'50%',background:'var(--red)',color:'white',fontSize:9,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center'}}>{unread}</div>}
            </div>
            <div className="user-chip" onClick={()=>setTab("perfil")}>
              {profile?.avatar_url ? <img src={profile.avatar_url} alt=""/> : initials(profile?.display_name)}
            </div>
          </div>
        </div>

        {tab==="ranking" && (
          <div className="section">
            {/* ¿Dónde vamos hoy? — prominente arriba */}
            <div style={{padding:'12px 12px 0'}}>
              <button
                onClick={()=>setDondeResult(bares.length?bares[Math.floor(Math.random()*bares.length)].name:"¡Añade bares primero!")}
                style={{width:'100%',padding:'13px 16px',background:'var(--ink)',border:'none',borderRadius:'var(--radius-lg)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between',color:'var(--paper)',fontFamily:'var(--font-display)'}}
              >
                <div style={{textAlign:'left'}}>
                  <div style={{fontSize:13,fontWeight:700,color:'var(--paper)'}}>🎰 ¿Dónde vamos hoy?</div>
                  <div style={{fontSize:11,color:'var(--gray-400)',marginTop:2}}>Que decida el azar</div>
                </div>
                <div style={{fontSize:22}}>→</div>
              </button>
              {dondeResult && (
                <div className="donde-result" style={{marginTop:8}}>
                  <div style={{fontSize:11,color:'var(--red)',marginBottom:4,fontFamily:'var(--font-display)',fontWeight:700,textTransform:'uppercase',letterSpacing:1}}>El azar ha hablado</div>
                  <div className="donde-bar">{dondeResult}</div>
                  <div className="donde-sub">No se discute. Se va.</div>
                </div>
              )}
            </div>

            <div className="rank-header">
              <div className="toggle-wrap">
                <button className={`toggle-opt${rankMode==="global"?" on":""}`} onClick={()=>setRankMode("global")}>Global</button>
                <button className={`toggle-opt${rankMode==="personal"?" on":""}`} onClick={()=>setRankMode("personal")}>El mío</button>
                <button className={`toggle-opt${rankMode==="stats"?" on":""}`} onClick={()=>setRankMode("stats")}>📊</button>
              </div>
            </div>

            {/* Filters */}
            {rankMode !== "stats" && (
              <div style={{display:"flex",gap:5,padding:"0 12px 10px",overflowX:"auto"}}>
                {[["score","⭐ Mejor valorado"],["precio","💸 Más barato"],["visitas","📍 Más visitado"]].map(([id,label])=>(
                  <button key={id} onClick={()=>setRankFilter(id)} style={{flexShrink:0,padding:"5px 12px",border:"1px solid var(--border)",borderRadius:20,fontSize:11,fontWeight:600,cursor:"pointer",background:rankFilter===id?"var(--ink)":"var(--gray-50)",color:rankFilter===id?"var(--paper)":"var(--gray-600)",fontFamily:"var(--font-display)"}}>
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* Stats panel inside ranking */}
            {rankMode === "stats" && <EstadisticasPanel bares={bares} feed={feed} userId={userId} />}

            {baresLoading && <div style={{padding:24,textAlign:"center",color:"var(--gray-400)",fontSize:13}}>Cargando...</div>}

            {rankMode !== "stats" && sorted.map((bar,i)=>(
              <div key={bar.id} className={`bar-card${bar.isCrown?" crown":""}${bar.isGhost?" ghost-card":""}${bar.isHot?" hot-card":""}`} onClick={()=>setSelectedBar(bar)}>
                <div className="card-main">
                  <span className={`rank-num${i===0?" gold":i===1?" silver":i===2?" bronze":""}`}>{i+1}</span>
                  <div className="bar-thumb">{bar.image_url?<img src={bar.image_url} alt={bar.name}/>:<span>🍺</span>}</div>
                  <div className="bar-info">
                    <div className="bar-name">{bar.name}{bar.isCrown&&<span>👑</span>}{bar.isGhost&&<span>👻</span>}</div>
                    <div className="bar-meta">{bar.barrio} · {bar.reviewCount} reseña{bar.reviewCount!==1?"s":""}</div>
                  </div>
                  <div className="bar-right">
                    <span className="score-num">{bar.avgScore?bar.avgScore.toFixed(1):"—"}</span>
                    <span className="score-sub">{bar.reviewCount} votos</span>
                  </div>
                  <button className="fav-btn" onClick={()=>toggleFav(bar.id,bar.isFav)} style={{color:bar.isFav?"#D94F3D":"#9E9A92"}}>
                    {bar.isFav?"❤️":"🤍"}
                  </button>
                </div>
                <div className="pills-row">
                  {bar.isCrown&&<span className="pill pill-crown">👑 predilecto</span>}
                  {bar.precio_cana&&<span className="pill pill-beer">🍺 {bar.precio_cana}</span>}
                  {bar.isGhost&&<span className="pill pill-ghost">👻 ¿sigue abierto?</span>}
                  {bar.isHot&&<span className="pill pill-hot">🔥 opinión caliente</span>}
                  {(bar.userVisited||localCheckins[bar.id])&&<span className="pill pill-visit">✓ estuve aquí</span>}
                </div>
              </div>
            ))}

            {!baresLoading&&bares.length===0&&rankMode!=="stats"&&(
              <div className="empty-state">
                <div className="emoji">🍺</div>
                <div className="title">{rankMode==="personal"?"Aún no tienes bares propios":"Aún no hay bares"}</div>
                <div>{rankMode==="personal"?"Añade bares o marca favoritos para verlos aquí":"Sé el primero en añadir uno con el botón +"}</div>
              </div>
            )}
          </div>
        )}

        {tab==="mapa" && (
          <div className="section" style={{display:"flex",flexDirection:"column",overflow:"hidden",height:"calc(100vh - 112px)"}}>
            <MapaReal
              bares={bares}
              userId={userId}
              localCheckins={localCheckins}
              onCheckin={handleCheckin}
              onBarClick={(bar) => setSelectedBar(bar)}
              onAddBar={(coords) => {
                setPendingCoords(coords);
                setShowAdd(true);
              }}
            />
          </div>
        )}

        {tab==="feed" && (
          <div className="section">
            <HistoriasCarrusel historias={historias} userId={userId} onAdd={addHistoria} uploadImage={uploadImage} onDelete={refetchHistorias} />

            {/* Feed sub-tabs */}
            <div style={{display:"flex",gap:3,background:"var(--gray-100)",borderRadius:10,padding:3,margin:"10px 12px 0"}}>
              {[["todo","Todo"],["resenas","Reseñas"],["posts","Posts"],["quedadas","📅"]].map(([id,label])=>(
                <button key={id} onClick={()=>setFeedTab(id)} style={{flex:1,padding:"6px 2px",border:"none",borderRadius:8,fontSize:10,fontWeight:600,cursor:"pointer",background:feedTab===id?"var(--paper)":"none",color:feedTab===id?"var(--ink)":"var(--gray-600)",boxShadow:feedTab===id?"0 1px 3px rgba(0,0,0,0.1)":"none",fontFamily:"var(--font-display)"}}>
                  {label}
                </button>
              ))}
            </div>

            {/* New post button */}
            {(feedTab==="todo"||feedTab==="posts") && (
              <div style={{padding:"10px 12px 0"}}>
                <button onClick={()=>setShowNewPost(true)} style={{width:"100%",padding:"11px 14px",background:"var(--gray-50)",border:"1px solid var(--border)",borderRadius:"var(--radius-lg)",cursor:"pointer",textAlign:"left",color:"var(--gray-400)",fontSize:13,fontFamily:"var(--font-body)",display:"flex",alignItems:"center",gap:10}}>
                  <Avatar profile={profile} size={28} />
                  ¿Qué está pasando en el barrio?
                </button>
              </div>
            )}

            {/* Quedadas tab */}
            {feedTab==="quedadas" && (
              <QuedadasPanel quedadas={quedadas} userId={userId} bares={bares} onCreateQuedada={createQuedada} onToggleAsistencia={toggleAsistencia} onDeleteQuedada={deleteQuedada} />
            )}

            {/* Stats tab */}
            {feedTab==="stats" && (
              <EstadisticasPanel bares={bares} feed={feed} userId={userId} />
            )}

            {/* Free posts */}
            {(feedTab==="todo"||feedTab==="posts") && (
              <div className="feed-wrap">
                {posts.map((post,pi)=>(
                  <div key={post.id} className="feed-card" style={{marginTop:pi===0?8:0}}>
                    <div className="feed-header">
                      <Avatar profile={post.profiles} size={30} bgIdx={pi+10}/>
                      <div>
                        <div className="feed-user-name">{post.profiles?.display_name||"Alguien"}</div>
                        <div className="feed-bar-ref">💬 Post libre</div>
                      </div>
                      <span className="feed-time">{timeAgo(post.created_at)}</span>
                      {post.user_id===userId && (
                        <button onClick={()=>{ if(confirm('¿Eliminar este post?')) deletePost(post.id) }} style={{background:"none",border:"none",color:"var(--gray-400)",cursor:"pointer",fontSize:14,padding:0}}>✕</button>
                      )}
                    </div>
                    {post.image_url&&<img className="feed-img" src={post.image_url} alt=""/>}
                    {post.text&&<div className="feed-body"><div className="feed-text">{post.text}</div></div>}

                    {/* Post comments */}
                    <div className="comments-wrap">
                      {(post.post_comentarios||[]).map((c,ci)=>(
                        <div key={c.id} className="comment-row">
                          <Avatar profile={c.profiles} size={24} bgIdx={ci+5}/>
                          <div className="c-body">
                            <div className="c-user">{c.profiles?.display_name||"Alguien"}</div>
                            <div className="c-text">{c.text}</div>
                          </div>
                          {c.user_id===userId&&<button onClick={()=>deletePostComment(c.id)} style={{background:"none",border:"none",color:"var(--gray-400)",cursor:"pointer",fontSize:12,padding:0,flexShrink:0}}>✕</button>}
                        </div>
                      ))}
                      <div className="add-comment-row">
                        <Avatar profile={profile} size={24}/>
                        <input
                          value={commentInputs[`post-${post.id}`]||""}
                          onChange={e=>setCommentInputs(p=>({...p,[`post-${post.id}`]:e.target.value}))}
                          onKeyDown={e=>{ if(e.key==="Enter"){ addPostComment(post.id, commentInputs[`post-${post.id}`]||""); setCommentInputs(p=>({...p,[`post-${post.id}`]:""})) }}}
                          placeholder="Comenta..."
                        />
                        <button className="send-btn" onClick={()=>{ addPostComment(post.id, commentInputs[`post-${post.id}`]||""); setCommentInputs(p=>({...p,[`post-${post.id}`]:""})) }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                        </button>
                      </div>
                    </div>

                    <div className="feed-actions-row">
                      <button className={`action-btn${post.userLiked?" liked":""}`} onClick={()=>togglePostLike(post.id,post.userLiked)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill={post.userLiked?"var(--red)":"none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                        {post.likeCount}
                      </button>
                      <button className="action-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"/></svg>
                        {(post.post_comentarios||[]).length}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reseñas feed */}
            {(feedTab==="todo"||feedTab==="resenas") && (
              <div className="feed-wrap">
                {feedLoading&&<div style={{padding:24,textAlign:"center",color:"var(--gray-400)",fontSize:13}}>Cargando feed...</div>}
                {!feedLoading&&feed.length===0&&(
                  <div className="empty-state">
                    <div className="emoji">📭</div>
                    <div className="title">El feed está vacío</div>
                    <div>Añade un bar y escribe la primera reseña</div>
                  </div>
                )}
                {feed.map((post,pi)=>(
                  <div key={post.id} className={`feed-card${post.isHot?" hot":""}`}>
                    {post.isHot&&<div className="hot-banner">🔥 Opinión caliente en {post.bares?.name}</div>}
                    <div className="feed-header">
                      <Avatar profile={post.profiles} size={30} bgIdx={pi}/>
                      <div>
                        <div className="feed-user-name">{post.profiles?.display_name||"Alguien"}</div>
                        <div className="feed-bar-ref">📍 {post.bares?.name}</div>
                      </div>
                      <span className="feed-time">{timeAgo(post.created_at)}</span>
                    </div>
                    {post.image_url&&<img className="feed-img" src={post.image_url} alt="Bar"/>}
                    <div className="feed-body">
                      <div className="feed-text">{post.review_text||"(Sin reseña)"}</div>
                      {post.score&&<span className="nota-chip">★ {post.score} nota personal</span>}
                    </div>
                    <div className="comments-wrap">
                      {(post.comentarios||[]).map((c,ci)=>{
                        const rc={};
                        (c.reacciones||[]).forEach(r=>{
                          if(!rc[r.emoji])rc[r.emoji]={count:0,mine:false};
                          rc[r.emoji].count++;
                          if(r.user_id===userId)rc[r.emoji].mine=true;
                        });
                        return (
                          <div key={c.id} className="comment-row">
                            <Avatar profile={c.profiles} size={24} bgIdx={ci+2}/>
                            <div className="c-body">
                              <div className="c-user">{c.profiles?.display_name||"Alguien"}</div>
                              <div className="c-text">{c.text}</div>
                              {Object.keys(rc).length>0&&(
                                <div className="c-reactions">
                                  {Object.entries(rc).map(([emoji,{count,mine}])=>(
                                    <button key={emoji} className={`react-btn${mine?" active":""}`} onClick={()=>toggleReaccion(c.id,emoji)}>
                                      {emoji} {count}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      <div className="emoji-quick">
                        {["🍺","🤌","😂","🤣","💀"].map(e=>(
                          <button key={e} className="emoji-q" onClick={()=>addEmojiComment(post.id,e)}>{e}</button>
                        ))}
                      </div>
                      <div className="add-comment-row">
                        <Avatar profile={profile} size={24}/>
                        <input value={commentInputs[post.id]||""} onChange={e=>setCommentInputs(p=>({...p,[post.id]:e.target.value}))}
                          onKeyDown={e=>e.key==="Enter"&&sendComment(post.id)} placeholder="Añade un comentario..."/>
                        <button className="send-btn" onClick={()=>sendComment(post.id)}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                        </button>
                      </div>
                    </div>
                    <div className="feed-actions-row">
                      <button className={`action-btn${post.userLiked?" liked":""}`} onClick={()=>toggleLike(post.id,post.userLiked)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill={post.userLiked?"var(--red)":"none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                        {post.likeCount}
                      </button>
                      <button className="action-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"/></svg>
                        {(post.comentarios||[]).length}
                      </button>
                      {post.isHot&&<button className="debate-open-btn" onClick={()=>setDebatePost(post)}>⚖️ Debate</button>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab==="perfil" && (
          <div className="section">
            <div className="profile-hero">
              <div className="profile-big-avatar">
                {profile?.avatar_url?<img src={profile.avatar_url} alt=""/>:initials(profile?.display_name)}
              </div>
              <div className="profile-name-big">{profile?.display_name||session.user.email}</div>
              <div className="profile-city">{profile?.ciudad||'Madrid'} · desde {new Date(session.user.created_at).getFullYear()}</div>
              {profile?.bio && <div style={{fontSize:12,color:'var(--gray-400)',marginTop:6,padding:'0 16px'}}>{profile.bio}</div>}
              <button onClick={()=>setShowEditPerfil(true)} style={{marginTop:10,background:'none',border:'1px solid rgba(255,255,255,0.2)',color:'var(--gray-400)',borderRadius:20,padding:'4px 14px',fontSize:11,cursor:'pointer',fontFamily:'var(--font-body)'}}>
                ✏️ Editar perfil
              </button>
              <div className="badge-strip">
                {computeBadges(userId, bares, feed, posts).map(b => (
                  <span key={b.id} className="badge" style={{background:'var(--gray-600)',color:'var(--paper)'}}>{b.emoji} {b.label}</span>
                ))}
              </div>
            </div>
            <div className="stats-grid">
              <div className="stat-cell"><div className="stat-num">{myPosts.length}</div><div className="stat-label">Reseñas</div></div>
              <div className="stat-cell"><div className="stat-num">{bares.filter(b=>b.added_by===userId).length}</div><div className="stat-label">Bares añadidos</div></div>
              <div className="stat-cell"><div className="stat-num">{myAvg}</div><div className="stat-label">Nota media</div></div>
            </div>

            {/* Mis bares añadidos */}
            {bares.filter(b=>b.added_by===userId).length>0 && (
              <div className="profile-section">
                <div className="section-label">Bares que añadí</div>
                {bares.filter(b=>b.added_by===userId).map(bar=>(
                  <div key={bar.id} className="visit-item" style={{cursor:'pointer'}} onClick={()=>setSelectedBar(bar)}>
                    <div className="visit-icon">{bar.isCrown?'👑':bar.isGhost?'👻':'🍺'}</div>
                    <div style={{flex:1}}>
                      <div className="visit-name">{bar.name}</div>
                      <div className="visit-meta">{bar.barrio||''} · {bar.reviewCount} reseña{bar.reviewCount!==1?'s':''}</div>
                    </div>
                    <div className="with-chip">{bar.avgScore?`★ ${bar.avgScore.toFixed(1)}`:'sin votos'}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="profile-section">
              <div className="section-label">Historial de visitas</div>
              {bares.filter(b=>b.userVisited||localCheckins[b.id]).map(bar=>(
                <div key={bar.id} className="visit-item">
                  <div className="visit-icon">{bar.isGhost?"👻":"🍺"}</div>
                  <div>
                    <div className="visit-name">{bar.name}</div>
                    <div className="visit-meta">{bar.barrio}</div>
                  </div>
                  <div className="with-chip">{bar.avgScore?`★ ${bar.avgScore.toFixed(1)}`:"sin nota"}</div>
                </div>
              ))}
              {bares.filter(b=>b.userVisited||localCheckins[b.id]).length===0&&(
                <div style={{fontSize:13,color:"var(--gray-400)",padding:"12px 0"}}>Aún no has marcado ninguna visita</div>
              )}
            </div>
            <button className="signout-btn" onClick={signOut}>Cerrar sesión</button>
          </div>
        )}

        <div className="bottom-nav">
          {[
            {id:"ranking",label:"Ranking",d:"M6 9H4.5a2.5 2.5 0 010-5H6m12 5h1.5a2.5 2.5 0 000-5H18m-9 13.5V19m6 1.5V19M3 9h18M6 9v5a6 6 0 0012 0V9m-9 10.5h6"},
            {id:"mapa",label:"Mapa",d:"M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13V7m0 13l6-3m-6-10l6-3m0 16l4.553-2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 8V9"},
          ].map(n=>(
            <button key={n.id} className={`nav-item${tab===n.id?" active":""}`} onClick={()=>setTab(n.id)}>
              <svg viewBox="0 0 24 24"><path d={n.d}/></svg>{n.label}
            </button>
          ))}
          <button className="nav-fab" onClick={()=>setShowAdd(true)}>
            <div className="fab-circle">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            </div>
          </button>
          {[
            {id:"feed",label:"Feed",d:"M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1M19 20a2 2 0 002-2V8a2 2 0 00-2-2h-5M8 12h3m-3 4h8M8 8h1"},
            {id:"perfil",label:"Perfil",d:"M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"},
          ].map(n=>(
            <button key={n.id} className={`nav-item${tab===n.id?" active":""}`} onClick={()=>setTab(n.id)}>
              <svg viewBox="0 0 24 24"><path d={n.d}/></svg>{n.label}
            </button>
          ))}
        </div>

        {showAdd&&<AddBarModal onAdd={addBar} onClose={()=>{setShowAdd(false);setPendingCoords(null)}} uploadImage={uploadImage} initialCoords={pendingCoords}/>}
        {debatePost&&<DebateModal post={debatePost} onClose={()=>setDebatePost(null)}/>}
        {selectedBar&&<BarDetalleModal bar={selectedBar} userId={userId} profile={profile} allProfiles={bares.flatMap(b=>b.resenas||[]).map(r=>r.profiles).filter(Boolean)} uploadImage={uploadImage} onClose={()=>setSelectedBar(null)} onRefresh={()=>{refetch();setSelectedBar(null)}}/>}
        {showEditPerfil&&<EditPerfilModal profile={profile} onClose={()=>setShowEditPerfil(false)} onRefresh={()=>window.location.reload()}/>}
        {showNotifs&&<NotifPanel notifs={notifs} bares={bares} onClose={()=>setShowNotifs(false)} onMarkRead={()=>{markAllRead();setShowNotifs(false)}} onBarClick={(bar)=>{setShowNotifs(false);setSelectedBar(bar)}}/>}
        {showNewPost&&<NuevoPostModal onPost={createPost} onClose={()=>setShowNewPost(false)} uploadImage={uploadImage}/>}
      </div>
    </>
  );
}
