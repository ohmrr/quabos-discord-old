export const celestialEmojis = {
  alien: '👽',
  rocket: '🚀',
  planet: '🪐',
  crescent: '🌙',
  moon: '🌕',
  comet: '☄️',
  galaxy: '🌌',
  ufo: '🛸',
  salute: '🖖',
  sparkles: '✨',
};

export const utilEmojis = {
  success: '✅',
  error: '❌',
  denied: '🚫',
  stop: '🛑',
  link: '🔗',
  audio: '🔉',
  volumeUp: '🔊',
  music: '🎵',
  loading: '⏳',
  loadingAlt: '⌛',
};

export function getRandomCelestialEmoji(): string {
  const emojiList = Object.values(celestialEmojis);
  const randIndex = Math.floor(Math.random() * emojiList.length);

  return emojiList[randIndex];
}
