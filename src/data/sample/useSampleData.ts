import { useMemo, useState } from 'react';

import * as sample from './sample';
import type { Comment, EventScope, Letter, PigeonEvent, Post, UserRef } from './types-shared';

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
    () => (draft: { title: string; text: string; when: string; where?: string; scope: EventScope; invited: UserRef[] }) =>
      setEvents((current) => [
        { id: `e-${Date.now()}`, author: sample.me, createdAt: Date.now(), going: 0, liked: false, ...draft },
        ...current,
      ]),
    [],
  );
  return { events, like, add };
}
