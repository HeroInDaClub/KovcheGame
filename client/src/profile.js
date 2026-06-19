// ── Стабильная идентификация игрока (localStorage) ───────
// Переживает перезагрузку/переподключение и смену комнат. На этот id
// сервер вешает профиль, контакты и список друзей.
const UID_KEY = 'aegis_user_id';

export function getUserId() {
  let id = localStorage.getItem(UID_KEY);
  if (!id) {
    id = (crypto.randomUUID?.() || `u_${Date.now()}_${Math.random().toString(36).slice(2)}`);
    localStorage.setItem(UID_KEY, id);
  }
  return id;
}
