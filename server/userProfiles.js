// ============================================================
// userProfiles.js — учётные записи игроков: профиль, контакты,
// флаги приватности и взаимные друзья. Персист на диск (users.json) —
// переживает перезапуск процесса (в отличие от игровых комнат).
//
// Профиль:
//   { id, name,
//     contacts: { email, vk, github },   // строки (могут быть пустыми)
//     privacy:  { email, vk, github },   // bool: true = контакт публичный
//     friends:  string[],                 // userId друзей (связь взаимная)
//     createdAt, updatedAt }
//
// Идентификатор игрока (id) приходит с клиента (localStorage) — стабилен
// для устройства и переживает переподключения/смену комнат.
// ============================================================

const fs   = require('fs');
const path = require('path');

const STORE_PATH   = path.join(__dirname, 'users.json');
const CONTACT_KEYS = ['email', 'vk', 'github'];

// users: Map<userId, Profile>
const users = new Map();

const emptyContacts = () => ({ email: '', vk: '', github: '' });
const emptyPrivacy  = () => ({ email: false, vk: false, github: false });

function normalizeProfile(p = {}) {
  return {
    id:        p.id,
    name:      (p.name || 'Игрок').toString().slice(0, 32),
    contacts:  { ...emptyContacts(), ...(p.contacts || {}) },
    privacy:   { ...emptyPrivacy(),  ...(p.privacy  || {}) },
    friends:   Array.isArray(p.friends) ? [...new Set(p.friends)] : [],
    createdAt: p.createdAt || Date.now(),
    updatedAt: p.updatedAt || Date.now(),
  };
}

// ── Загрузка с диска при старте ──────────────────────────
try {
  const raw = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
  if (Array.isArray(raw)) for (const p of raw) if (p && p.id) users.set(p.id, normalizeProfile(p));
} catch { /* файла нет / пустой — стартуем с чистого хранилища */ }

let saveTimer = null;
function save() {
  // Лёгкий дебаунс: не блокируем диск на каждую мелкую правку.
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      fs.writeFileSync(STORE_PATH, JSON.stringify([...users.values()], null, 2));
    } catch (e) { console.warn('[users] не удалось сохранить:', e.message); }
  }, 200);
}

// Гарантировать наличие профиля. Имя задаётся ТОЛЬКО при создании
// (далее им управляет владелец через updateProfile, позывной его не трёт).
function ensureUser(userId, name) {
  if (!userId) return null;
  let p = users.get(userId);
  if (!p) {
    p = normalizeProfile({ id: userId, name });
    users.set(userId, p);
    save();
  }
  return p;
}

function getProfile(userId) { return users.get(userId) || null; }

function updateProfile(userId, patch = {}) {
  const p = users.get(userId);
  if (!p) return null;
  if (typeof patch.name === 'string' && patch.name.trim()) {
    p.name = patch.name.trim().slice(0, 32);
  }
  if (patch.contacts && typeof patch.contacts === 'object') {
    for (const k of CONTACT_KEYS) {
      if (typeof patch.contacts[k] === 'string') p.contacts[k] = patch.contacts[k].trim().slice(0, 120);
    }
  }
  if (patch.privacy && typeof patch.privacy === 'object') {
    for (const k of CONTACT_KEYS) {
      if (typeof patch.privacy[k] === 'boolean') p.privacy[k] = patch.privacy[k];
    }
  }
  p.updatedAt = Date.now();
  save();
  return p;
}

// ── Друзья (связь взаимная) ──────────────────────────────
function areFriends(a, b) {
  const pa = users.get(a);
  return !!pa && pa.friends.includes(b);
}

function addFriend(a, b) {
  if (!a || !b) return { error: 'Профиль не найден' };
  if (a === b)  return { error: 'Нельзя добавить себя в друзья' };
  const pa = users.get(a), pb = users.get(b);
  if (!pa || !pb) return { error: 'Профиль не найден' };
  if (!pa.friends.includes(b)) pa.friends.push(b);
  if (!pb.friends.includes(a)) pb.friends.push(a);   // взаимность
  pa.updatedAt = pb.updatedAt = Date.now();
  save();
  return { ok: true };
}

function removeFriend(a, b) {
  const pa = users.get(a), pb = users.get(b);
  if (!pa || !pb) return { error: 'Профиль не найден' };
  pa.friends = pa.friends.filter(x => x !== b);
  pb.friends = pb.friends.filter(x => x !== a);
  pa.updatedAt = pb.updatedAt = Date.now();
  save();
  return { ok: true };
}

// Краткая карточка друга для списков.
function friendCard(userId) {
  const p = users.get(userId);
  return p ? { id: p.id, name: p.name } : { id: userId, name: '—', missing: true };
}

// Полный профиль владельца: все контакты + флаги приватности + друзья.
function ownView(userId) {
  const p = users.get(userId);
  if (!p) return null;
  return {
    id:       p.id,
    name:     p.name,
    contacts: { ...p.contacts },
    privacy:  { ...p.privacy },
    friends:  p.friends.map(friendCard),
    self:     true,
  };
}

// Публичный профиль (для чужих глаз): только контакты с флагом public.
function publicView(targetId, viewerId) {
  const p = users.get(targetId);
  if (!p) return null;
  const contacts = {};
  for (const k of CONTACT_KEYS) {
    if (p.privacy[k] && p.contacts[k]) contacts[k] = p.contacts[k];   // только публичные и непустые
  }
  return {
    id:          p.id,
    name:        p.name,
    contacts,
    friends:     p.friends.map(friendCard),
    friendCount: p.friends.length,
    isFriend:    viewerId ? areFriends(viewerId, targetId) : false,
    self:        viewerId === targetId,
  };
}

module.exports = {
  ensureUser, getProfile, updateProfile,
  addFriend, removeFriend, areFriends,
  ownView, publicView,
};
