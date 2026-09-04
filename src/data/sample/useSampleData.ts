import { useMemo, useState } from 'react';

import * as sample from './sample';
import type { Comment, EventScope, Group, Letter, PigeonEvent, Post, UserRef } from './types-shared';

// The assumed-reactive store screens read so they behave like the real thing;
// a later session swaps this module's hooks for API calls screens never notice
// (UI-DESIGN §4: screens import only useSampleData + components).

export function useSampleData() {
  return sampleState;
}

export function useFeed() {
  const [posts, setPosts] = useState<Post[]>(sample.posts);
  const [stories] = useState(sample.stories);
  const like = useMemo(
    () => (postId: string) =>
      setPosts((current) =>
        current.map((post) =>
          post.id === postId
            ? { ...post, liked: !post.liked, likes: post.likes + (post.liked ? -1 : 1) }
            : post,
        ),
      ),
    [],
  );
  const add = useMemo(
    () => (text: string) =>
      setPosts((current) => [
        { id: `p-${Date.now()}`, author: sample.me, createdAt: Date.now(), kind: 'text', text, likes: 0, liked: false, commentCount: 0 },
        ...current,
      ]),
    [],
  );
  return { posts, stories, like, add };
}

export function useProfile(username: string) {
  const [profileName] = useState(username);
  const isMe = profileName === sample.me.username;
  const blob = isMe ? sample.instagramLayout : sample.myspaceLayout;
  const widgetData = {
    about:
      isMe
        ? { heading: 'about', bio: 'pigeon keeper. letters over threads. the chart is the plan.', wantToMeet: 'slow correspondents' }
        : { heading: 'marta', bio: 'keeps the east lofts and one very old recipe book.', wantToMeet: 'anyone with a stamp' },
    wall: sample.wallPosts,
    recentPosts: sample.posts.filter((post) => post.author.username === profileName),
    pigeons: sample.myProfile.stats,
  };
  return { isMe, blob, widgetData, layoutName: isMe ? 'instagram-ish' : 'myspace-maximal' };
}

export function useLetters() {
  const [letters, setLetters] = useState<Letter[]>(sample.letters);
  const [opened, setOpened] = useState<Record<string, boolean>>({});
  const open = useMemo(
    () => (letterId: string) => {
      setOpened((current) => ({ ...current, [letterId]: true }));
      setLetters((current) =>
        current.map((letter) =>
          letter.id === letterId && letter.state === 'sealed'
            ? { ...letter, state: 'opened', text: letter.text ?? '(the inner letter arrives when the server does)' }
            : letter,
        ),
      );
    },
    [],
  );
  return { letters, commentsFor: (): Comment[] => [], open };
}

const sampleState = {
  me: sample.me,
  friends: sample.friends,
  friendRequests: sample.friendRequests,
};

export function useEvents() {
  const [events, setEvents] = useState<PigeonEvent[]>(sample.events);
  const like = useMemo(
    () => (eventId: string) =>
      setEvents((current) =>
        current.map((e) => (e.id === eventId ? { ...e, liked: !e.liked, going: e.going + (e.liked ? -1 : 1) } : e)),
      ),
    [],
  );
  const add = useMemo(
    () => (draft: { title: string; text: string; when: string; where?: string; scope: EventScope; invited: UserRef[]; plate?: string }) => {
      const id = `e-${Date.now()}`;
      setEvents((current) => [{ id, author: sample.me, createdAt: Date.now(), going: 0, liked: false, ...draft }, ...current]);
      return id;
    },
    [],
  );
  return { events, like, add };
}

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>(sample.groups);
  const rename = useMemo(
    () => (groupId: string, name: string) =>
      setGroups((gs) => gs.map((g) => (g.id === groupId ? { ...g, name } : g))),
    [],
  );
  const leave = useMemo(
    () => (groupId: string) => setGroups((gs) => gs.filter((g) => g.id !== groupId)),
    [],
  );
  const invite = useMemo(
    () => (groupId: string, usersToAdd: UserRef[]) =>
      setGroups((gs) => gs.map((g) => (g.id === groupId ? { ...g, members: [...g.members, ...usersToAdd] } : g))),
    [],
  );
  const decide = useMemo(
    () => (groupId: string, username: string, accept: boolean) =>
      setGroups((gs) =>
        gs.map((g) => {
          if (g.id !== groupId) return g;
          const req = g.requests.find((u) => u.username === username);
          return accept && req
            ? { ...g, members: [...g.members, req], requests: g.requests.filter((u) => u.username !== username) }
            : { ...g, requests: g.requests.filter((u) => u.username !== username) };
        }),
      ),
    [],
  );
  const post = useMemo(
    () => (groupId: string, text: string) =>
      setGroups((gs) =>
        gs.map((g) =>
          g.id === groupId
            ? { ...g, posts: [{ id: `gp-${Date.now()}`, author: sample.me, createdAt: Date.now(), kind: 'text', text, likes: 0, liked: false, commentCount: 0 }, ...g.posts] }
            : g,
        ),
      ),
    [],
  );
  const like = useMemo(
    () => (groupId: string, postId: string) =>
      setGroups((gs) =>
        gs.map((g) =>
          g.id === groupId
            ? {
                ...g,
                posts: g.posts.map((p) => (p.id === postId ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p)),
              }
            : g,
        ),
      ),
    [],
  );
  return { groups, rename, leave, invite, decide, post, like };
}
