/* Přihlášení k odběru novinek – napojení na Ecomail (veřejná adresa formuláře, žádný tajný klíč). */
(function () {
  var FORM_ACTION = 'https://ceskychrest.ecomailapp.cz/public/subscribe/2/2bb287d15897fe2f9d89c882af9a3a8b';
  var FIELD = 'email';

  function say(box, text, ok) {
    var msg = box.querySelector('[data-nl-msg]');
    if (!msg) return;
    msg.textContent = text;
    msg.style.fontWeight = '700';
    msg.style.color = ok ? '#17241A' : '#8A1C1C';
  }

  // Delegace události: stránky se vykreslují až po načtení, formulář tedy nemusí v tu chvíli existovat.
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-nl] button');
    if (!btn) return;
    var box = btn.closest('[data-nl]');
    var input = box.querySelector('input[type=email]');
    var consent = box.querySelector('input[type=checkbox]');
    var v = (input.value || '').trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) return say(box, 'Zkontrolujte prosím e-mail.', false);
    if (!consent || !consent.checked) return say(box, 'Potvrďte prosím souhlas se zasíláním novinek.', false);
    btn.disabled = true;
    var body = new URLSearchParams();
    body.set(FIELD, v);
    fetch(FORM_ACTION, { method: 'POST', mode: 'no-cors', body: body })
      .then(function () {
        say(box, 'Hotovo, děkujeme. Odběr je zapsaný.', true);
        input.value = '';
        consent.checked = false;
      })
      .catch(function () { say(box, 'Nepodařilo se odeslat, zkuste to prosím později.', false); })
      .then(function () { btn.disabled = false; });
  });
})();
