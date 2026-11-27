/* Cookie lišta a správa souhlasů – Český chřest a Mělnický křen.
   Bez závislostí. Volba se ukládá jen v prohlížeči (localStorage, klíč cc_consent_v1), na server se neposílá.
   Výchozí stav: povoleny jsou jen nezbytné cookies. Analytické a marketingové jsou vypnuté, dokud je návštěvník nezapne.

   Použití na stránce:
   - <script src="./gdpr.js" defer></script>
   - odkaz "Nastavení cookies" kdekoli: <a href="Ochrana-udaju.dc.html#cookies" data-cookie-settings>Cookies</a>
   - skript, který smí běžet jen po souhlasu (např. analytika):
       <script type="text/plain" data-consent="analytics" src="https://…"></script>
     po souhlasu ho gdpr.js sám spustí. Totéž pro data-consent="marketing".
   - v kódu: window.CCConsent.has('analytics') a událost 'cc-consent' na window. */
(function () {
  'use strict';
  var KEY = 'cc_consent_v1';
  var VERSION = 1;
  var POLICY = 'Ochrana-udaju.dc.html#cookies';

  function load() {
    try {
      var d = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (d && d.v === VERSION) return d;
    } catch (e) {}
    return null;
  }
  function save(analytics, marketing) {
    var d = { v: VERSION, necessary: true, analytics: !!analytics, marketing: !!marketing, ts: new Date().toISOString() };
    try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {}
    state = d;
    activate();
    try { window.dispatchEvent(new CustomEvent('cc-consent', { detail: d })); } catch (e) {}
    return d;
  }

  var state = load();

  window.CCConsent = {
    has: function (cat) { return cat === 'necessary' || !!(state && state[cat]); },
    open: function () { openDialog(true); },
    get: function () { return state; }
  };

  // Spustí skripty čekající na souhlas
  function activate() {
    var list = document.querySelectorAll('script[type="text/plain"][data-consent]');
    Array.prototype.forEach.call(list, function (el) {
      if (el.getAttribute('data-done') || !window.CCConsent.has(el.getAttribute('data-consent'))) return;
      var s = document.createElement('script');
      Array.prototype.forEach.call(el.attributes, function (a) {
        if (a.name !== 'type' && a.name !== 'data-consent') s.setAttribute(a.name, a.value);
      });
      s.text = el.text;
      el.setAttribute('data-done', '1');
      el.parentNode.insertBefore(s, el.nextSibling);
    });
  }

  var FONT = "'Instrument Sans','Segoe UI',system-ui,sans-serif";
  var root = null;

  function el(tag, css, html) {
    var e = document.createElement(tag);
    if (css) e.style.cssText = css;
    if (html != null) e.innerHTML = html;
    return e;
  }
  var BTN = 'min-height:48px;padding:0 22px;border-radius:999px;font:700 16px ' + FONT + ';cursor:pointer;box-sizing:border-box;';
  var BTN_DARK = BTN + 'border:2px solid #17241A;background:#17241A;color:#FFFFFF;';
  var BTN_LINE = BTN + 'border:2px solid #17241A;background:#FFFFFF;color:#17241A;';

  function close() { if (root) { root.remove(); root = null; } }

  function row(id, title, text, checked, locked) {
    var l = el('label', 'display:flex;gap:12px;align-items:flex-start;padding:14px 0;border-top:1px solid #E3E7DA;cursor:' + (locked ? 'default' : 'pointer'));
    var i = el('input', 'width:22px;height:22px;margin:2px 0 0;flex:none;accent-color:#2E4A26');
    i.type = 'checkbox'; i.id = id; i.checked = checked; i.disabled = locked;
    var t = el('span', 'display:block;font-size:15px;line-height:1.45;color:#3B4738', '<strong style="display:block;font-size:16px;color:#17241A">' + title + (locked ? ' (vždy zapnuto)' : '') + '</strong>' + text);
    l.appendChild(i); l.appendChild(t);
    return l;
  }

  function openDialog(settings) {
    close();
    root = el('div', 'position:fixed;left:0;right:0;bottom:0;z-index:2147483000;font-family:' + FONT + ';color:#17241A');
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', settings ? 'true' : 'false');
    root.setAttribute('aria-label', 'Nastavení cookies');
    var wrap = el('div', 'max-width:980px;margin:0 auto 16px;background:#FFFFFF;border:2px solid #17241A;border-radius:20px;padding:22px clamp(16px,3vw,28px);box-shadow:0 10px 40px rgba(0,0,0,.25);box-sizing:border-box;max-height:88vh;overflow:auto;width:calc(100% - 24px)');

    if (!settings) {
      wrap.innerHTML = '<div style="font:800 20px/1.2 \'Bricolage Grotesque\',' + FONT + ';margin-bottom:8px">Cookies na našem webu</div>' +
        '<p style="margin:0 0 16px;font-size:15px;line-height:1.5;color:#3B4738">Nezbytné cookies web potřebuje k provozu. Analytické a marketingové zapneme jen s vaším souhlasem. Volbu můžete kdykoli změnit v nastavení cookies. Podrobnosti najdete v <a href="' + POLICY + '" style="color:#2E4A26;font-weight:700">zásadách ochrany osobních údajů</a>.</p>';
      var b = el('div', 'display:flex;gap:10px;flex-wrap:wrap');
      var all = el('button', BTN_DARK, 'Přijmout vše'); all.type = 'button';
      var none = el('button', BTN_DARK, 'Odmítnout vše'); none.type = 'button';
      var set = el('button', BTN_LINE, 'Nastavit'); set.type = 'button';
      all.onclick = function () { save(true, true); close(); };
      none.onclick = function () { save(false, false); close(); };
      set.onclick = function () { openDialog(true); };
      b.appendChild(all); b.appendChild(none); b.appendChild(set);
      wrap.appendChild(b);
    } else {
      wrap.appendChild(el('div', 'font:800 20px/1.2 \'Bricolage Grotesque\',' + FONT + ';margin-bottom:6px', 'Nastavení cookies'));
      wrap.appendChild(el('p', 'margin:0 0 8px;font-size:15px;line-height:1.5;color:#3B4738', 'Vyberte, které kategorie cookies smíme používat. Souhlas je dobrovolný a můžete ho kdykoli odvolat.'));
      wrap.appendChild(row('cc-nec', 'Nezbytné', 'Zajišťují chod webu a pamatují si tuto vaši volbu. Nelze je vypnout.', true, true));
      wrap.appendChild(row('cc-ana', 'Analytické', 'Anonymní statistiky návštěvnosti, abychom věděli, co na webu zlepšit. Zatím žádné nepoužíváme.', !!(state && state.analytics), false));
      wrap.appendChild(row('cc-mkt', 'Marketingové', 'Měření reklam a vložený obsah třetích stran. Zatím žádné nepoužíváme.', !!(state && state.marketing), false));
      var b2 = el('div', 'display:flex;gap:10px;flex-wrap:wrap;margin-top:12px');
      var sv = el('button', BTN_DARK, 'Uložit výběr'); sv.type = 'button';
      var all2 = el('button', BTN_LINE, 'Přijmout vše'); all2.type = 'button';
      var no2 = el('button', BTN_LINE, 'Odmítnout vše'); no2.type = 'button';
      sv.onclick = function () { save(document.getElementById('cc-ana').checked, document.getElementById('cc-mkt').checked); close(); };
      all2.onclick = function () { save(true, true); close(); };
      no2.onclick = function () { save(false, false); close(); };
      b2.appendChild(sv); b2.appendChild(all2); b2.appendChild(no2);
      wrap.appendChild(b2);
    }
    root.appendChild(wrap);
    document.body.appendChild(root);
    var first = wrap.querySelector('button');
    if (first && settings) first.focus();
  }

  function init() {
    activate();
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('[data-cookie-settings]');
      if (a) { e.preventDefault(); openDialog(true); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && root && state) close();
    });
    if (!state) openDialog(false);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
