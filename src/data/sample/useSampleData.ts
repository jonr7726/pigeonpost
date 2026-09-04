import { useMemo, useState } from 'react';

import * as sample from './sample';
import type { Comment, Letter, Post } from './types-shared';

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
  return { posts, stories, like };
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

// Your loft on the chart, movable via the map cog ("change your location").
const HOME_PIN = { x: 0.5, y: 0.62 };
export function useMyPin() {
  const [pin, setPin] = useState(HOME_PIN);
  return { pin, setPin };
}
