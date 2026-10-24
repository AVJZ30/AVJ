/* Seasonal presentation only: no changes to catalog, navigation, forms or prices. */
(() => {
  if (document.getElementById('avj-halloween-style')) return;
  const style = document.createElement('style');
  style.id = 'avj-halloween-style';
  style.textContent = `
    :root { --avj-pumpkin: #ff8c32; --avj-magic: #a855f7; }
    body { position: relative; }
    body::before {
      content: ""; position: fixed; inset: 0; z-index: 2; pointer-events: none;
      background: radial-gradient(circle at 0% 4%, rgba(255,140,50,.12), transparent 32%),
                  radial-gradient(circle at 100% 95%, rgba(168,85,247,.11), transparent 35%);
    }
    .avj-halloween-decor {
      position: fixed; pointer-events: none; z-index: 35;
      display: flex; align-items: center; gap: 9px;
      filter: drop-shadow(2px 3px 0 rgba(18,9,26,.65));
      animation: avj-halloween-float 5s ease-in-out infinite;
    }
    .avj-halloween-top { top: 82px; right: 14px; font-size: clamp(22px,3vw,38px); }
    .avj-halloween-bottom { bottom: 18px; left: 12px; font-size: clamp(22px,3vw,33px); animation-delay: -2.5s; }
    .avj-halloween-label {
      background: #1a0d29; color: #ffb66c; border: 2px solid #ff8c32;
      padding: 7px 9px; border-radius: 2px; box-shadow: 3px 3px #000;
      font-family: 'Press Start 2P', monospace; font-size: 8px; line-height: 1.8;
      letter-spacing: 0; text-transform: uppercase;
    }
    @keyframes avj-halloween-float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    @media (max-width: 640px) {
      .avj-halloween-top { top: 74px; right: 7px; font-size: 21px; }
      .avj-halloween-bottom { bottom: 10px; left: 7px; font-size: 20px; }
      .avj-halloween-label { font-size: 6px; padding: 5px; }
    }
    @media (prefers-reduced-motion: reduce) {
      .avj-halloween-decor { animation: none; }
    }
  `;
  document.head.appendChild(style);
  function decorate() {
    if (!document.body || document.getElementById('avj-halloween-top')) return;
    const top = document.createElement('div');
    top.id = 'avj-halloween-top';
    top.className = 'avj-halloween-decor avj-halloween-top';
    top.setAttribute('aria-hidden', 'true');
    top.innerHTML = '<span>🦇</span><span>🎃</span>';
    const bottom = document.createElement('div');
    bottom.className = 'avj-halloween-decor avj-halloween-bottom';
    bottom.setAttribute('aria-hidden', 'true');
    bottom.innerHTML = '<span>👻</span><span class="avj-halloween-label">Feliz Halloween</span>';
    document.body.append(top, bottom);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', decorate, { once: true });
  } else {
    decorate();
  }
})();
