const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Instrument+Sans:wght@400;500&display=swap');`

export default function LoginPage({ onLogin }) {
  return (
    <>
      <style>{FONTS}{`
        .login-wrap {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #1A1916;
          font-family: 'Instrument Sans', sans-serif;
          padding: 24px;
        }
        .login-logo {
          font-family: 'Syne', sans-serif;
          font-size: 48px;
          font-weight: 800;
          color: #FDFCFA;
          letter-spacing: -2px;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }
        .login-logo-dot { width: 14px; height: 14px; border-radius: 50%; background: #D94F3D; display: inline-block; }
        .login-sub {
          font-size: 15px;
          color: #5C5852;
          margin-bottom: 48px;
          text-align: center;
          line-height: 1.5;
          max-width: 280px;
        }
        .login-sub em { color: #9E9A92; font-style: normal; }
        .google-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #FDFCFA;
          color: #1A1916;
          border: none;
          border-radius: 12px;
          padding: 14px 24px;
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.12s;
          width: 100%;
          max-width: 320px;
          justify-content: center;
        }
        .google-btn:hover { opacity: 0.92; transform: translateY(-1px); }
        .google-btn:active { transform: scale(0.98); opacity: 0.85; }
        .google-icon { width: 20px; height: 20px; }
        .login-footer {
          margin-top: 32px;
          font-size: 11px;
          color: #5C5852;
          text-align: center;
          max-width: 240px;
          line-height: 1.6;
        }
        .login-pills {
          display: flex;
          gap: 8px;
          margin-top: 32px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .login-pill {
          font-size: 11px;
          background: #2A2926;
          color: #5C5852;
          padding: 4px 10px;
          border-radius: 20px;
          border: 1px solid #333;
        }
      `}</style>
      <div className="login-wrap">
        <div className="login-logo">
          <span className="login-logo-dot" />
          Barrio
        </div>
        <p className="login-sub">
          El ranking de bares del barrio.<br />
          <em>Hecho entre amigos, para amigos.</em>
        </p>
        <button className="google-btn" onClick={onLogin}>
          <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Entrar con Google
        </button>
        <div className="login-pills">
          <span className="login-pill">👑 Ranking del barrio</span>
          <span className="login-pill">🔥 Opiniones calientes</span>
          <span className="login-pill">👻 Bares fantasma</span>
          <span className="login-pill">🎰 ¿Dónde vamos?</span>
        </div>
        <p className="login-footer">Solo pueden entrar los que tienen el enlace. Tu grupo, tus bares.</p>
      </div>
    </>
  )
}
