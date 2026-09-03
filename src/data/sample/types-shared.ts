// Screen-facing sample types. Deliberately UI-shaped (waits on no API) — a
// later session swaps these for real contract types screens already compile
// against (UI-DESIGN §4). Nothing here maps to the DB this slice.

export type UserRef = { id: string; username: string; name: string };

export type PostKind = 'text' | 'photo' | 'blog';

export type Post = {
  id: string;
  author: UserRef;
  createdAt: number;
  kind: PostKind;
  // text post: the words; photo: caption; blog: excerpt (body opens in detail)
  text: string;
  excerpt?: string;
  likes: number;
  liked: boolean;
  commentCount: number;
};

export type Comment = {
  id: string;
  author: UserRef;
  createdAt: number;
  text: string;
};

export type Story = {
  id: string;
  author: UserRef;
  createdAt: number;
  text: string;
};

export type WallPost = {
  id: string;
  author: UserRef;
  createdAt: number;
  text: string;
};

export type LetterState = 'inTransit' | 'sealed' | 'opened' | 'overdue' | 'draft';

export type Letter = {
  id: string;
  from: UserRef;
  to: UserRef;
  state: LetterState;
  createdAt: number;
  /** release/arrival time while in transit; absent for drafts */
  arrivesAt?: number;
  /** 0..1 flight progress for in-transit letters */
  progress?: number;
  /** present once delivered; sealed until opened */
  text?: string;
  subject: string;
};

export type PigeonStats = {
  inFlight: number;
  delivered: number;
  received: number;
};

export type FriendRequest = {
  id: string;
  from: UserRef;
  createdAt: number;
  message?: string;
};

export type Friend = UserRef & { pin: { x: number; y: number }; mapLabel: string };
