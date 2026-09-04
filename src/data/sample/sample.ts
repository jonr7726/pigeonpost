import type { ProfilePageBlob } from '../../ui/profile/blobs';
import type { Comment, Friend, FriendRequest, Letter, Post, Story, WallPost } from './types-shared';

// Deterministic seed. Times are offsets from a fixed epoch so stories stay
// "fresh" and letters stay pending whenever the app opens (storyboard data).
const NOW = Date.now();
const hours = (n: number) => NOW - n * 3_600_000;
const days = (n: number) => NOW + n * 86_400_000;

export const me = { id: 'u-wren', username: 'wren', name: 'Wren' };

export const users = {
  marta: { id: 'u-marta', username: 'marta', name: 'Marta' },
  hubert: { id: 'u-hubert', username: 'hubert', name: 'Hubert' },
  nia: { id: 'u-nia', username: 'nia', name: 'Nia' },
  otto: { id: 'u-otto', username: 'otto', name: 'Otto' },
} as const;

export const friends: Friend[] = [
  { ...users.marta, pin: { x: 0.32, y: 0.24 }, mapLabel: 'Marta' },
  { ...users.hubert, pin: { x: 0.61, y: 0.55 }, mapLabel: 'Hubert' },
  { ...users.nia, pin: { x: 0.78, y: 0.3 }, mapLabel: 'Nia' },
  { ...users.otto, pin: { x: 0.45, y: 0.72 }, mapLabel: 'Otto' },
];

export const stories: Story[] = [
  { id: 'st-1', author: users.marta, createdAt: hours(2), text: 'the lake, at last' },
  { id: 'st-2', author: users.hubert, createdAt: hours(5), text: '' },
  { id: 'st-3', author: users.nia, createdAt: hours(9), text: '' },
];

export const posts: Post[] = [
  {
    id: 'p-5', author: me, createdAt: hours(9), kind: 'text',
    text: 'chart update: moved my pin to the east lofts for the season — come find me',
    likes: 4, liked: false, commentCount: 1,
  },
  {
    id: 'p-1', author: users.hubert, createdAt: hours(26), kind: 'photo',
    text: 'sunday market favourites', likes: 3, liked: false, commentCount: 2,
  },
  {
    id: 'p-2', author: users.marta, createdAt: hours(40), kind: 'text',
    text: 'first letter to Hubert is on the wing — three days feels long when you pressed the seal yourself',
    likes: 5, liked: true, commentCount: 1,
  },
  {
    id: 'p-3', author: users.nia, createdAt: hours(90), kind: 'blog',
    text: 'reading the world map like a snail reads weather',
    excerpt: 'Nia writes about the chart pinned above her desk — the hand-drawn world this app...',
    likes: 8, liked: false, commentCount: 0,
  },
  {
    id: 'p-4', author: users.otto, createdAt: hours(120), kind: 'text',
    text: 'pi·geon·post (n.) a one-off thought, sealed once, read once, kept forever',
    likes: 2, liked: false, commentCount: 0,
  },
];

export const comments: Record<string, Comment[]> = {
  'p-1': [
    { id: 'c-1', author: users.marta, createdAt: hours(20), text: 'the grey ones were my pick' },
    { id: 'c-2', author: users.otto, createdAt: hours(18), text: 'that bread, though' },
  ],
  'p-2': [{ id: 'c-3', author: users.hubert, createdAt: hours(30), text: 'worth every hour' }],
  'p-3': [],
  'p-4': [],
};

export const wallPosts: WallPost[] = [
  { id: 'w-1', author: users.otto, createdAt: hours(6), text: 'nice chart update — pin us at the same lake!' },
  { id: 'w-2', author: users.marta, createdAt: days(-2), text: 'wren brings the walls back, tell everyone' },
];

// Letters in every state (UI-DESIGN §5.4): in-transit, sealed, opened, overdue.
export const letters: Letter[] = [
  {
    id: 'l-1', from: me, to: users.hubert, state: 'inTransit', subject: 'the lake proposal',
    createdAt: hours(20), arrivesAt: days(3), progress: 0.35,
    text: 'Hubert — the west pond at first light. Bring the grey kite; I will trade you the brass compass for the good coffee. The pigeon left on Sunday and I already feel like a character in a story I know too little about. Yours, Wren',
  },
  {
    id: 'l-2', from: users.marta, to: me, state: 'sealed', subject: 'a recipe, of sorts',
    createdAt: hours(40), arrivesAt: days(-0.2),
  },
  {
    id: 'l-3', from: users.nia, to: me, state: 'opened', subject: 'a deed of safekeeping',
    createdAt: days(-4),
    text: 'I, ____________, entrust to ____________ the keys to my password vault.\n\nMaster password: ____________\nRecovery code: ____________\n\nThe holder shall keep both in their own vault and nowhere else, show them to no one, and return them only on the day I ask.\n\nShould either key ever touch another channel by accident, the holder shall tell me at once, so I can reset the password and issue this deed anew.\n\nSigned: ____________\nDate: ____________',
  },
  {
    id: 'l-4', from: users.otto, to: me, state: 'overdue', subject: 'brass compass — where?',
    createdAt: days(-9), 
  },
  {
    id: 'l-5', from: me, to: users.nia, state: 'draft', subject: 'draft — library swap',
    createdAt: hours(3),
    text: 'Nia — half a draft, still finding the sentence...',
  },
];

export const friendRequests: FriendRequest[] = [
  { id: 'r-1', from: { id: 'u-pas', username: 'pascal', name: 'Pascal' }, createdAt: hours(9), message: 'we met at the market — you called my pigeon slow, and I have held a grudge politely since' },
];

// The two proof layouts (§8.4): Instagram-ish and MySpace-maximal, both
// rendered by the same PageRenderer from the same blob shape.
export const instagramLayout: ProfilePageBlob = {
  theme: { mode: 'dark', accent: 'accent' },
  layout: [
    { id: 'inst-about', widget: 'about', span: 2 },
    { id: 'inst-recent', widget: 'recentPosts', span: 2 },
    { id: 'inst-pigeons', widget: 'pigeons', span: 1 },
    { id: 'inst-wall', widget: 'wall', span: 2 },
  ],
};

export const myspaceLayout: ProfilePageBlob = {
  theme: { mode: 'light', accent: 'accentAlt' },
  layout: [
    { id: 'ms-about', widget: 'about', span: 1, theme: { panel: 'paper', accent: 'wax' } },
    { id: 'ms-wall', widget: 'wall', span: 1, theme: { accent: 'wax' } },
    { id: 'ms-pigeons', widget: 'pigeons', span: 1, theme: { accent: 'accentAlt' } },
    { id: 'ms-recent', widget: 'recentPosts', span: 2, theme: { panel: 'paper' } },
  ],
};

export const myProfile = {
  userId: me.id,
  layout: instagramLayout,
  stats: { inFlight: 3, delivered: 12, received: 21 } as const,
};
