// Minimal pointer-event surface used by the web overlay handlers.
type PointerEventSpec = { clientX: number; clientY: number; pointerId: number; currentTarget: HTMLElement };
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Text } from 'react-native';
import { BRASS_RAIL } from '../theme/palette';

// Brass scrollbar (PM CogScrollbar port for RN-web): a hairline rail down the
// right edge, rivets, and a pigeon that travels (and "flaps") with real
// scroll progress of the marked scroll container ([data-brassscroll] via
// ScreenScroll). Drag the pigeon or click the rail to jump — it drives the
// same scroll it reports, one source of truth. Web-only.
const BIRD = 26;

export function BrassRail() {
  const [source, setSource] = useState<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [scrollable, setScrollable] = useState(false);
  const [dragging, setDragging] = useState(false);
  const rail = useRef<{ top: number; height: number } | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let frame = 0;
    function measure() {
      // Pick the deepest scrollable overflow container with the tallest track
      // (RN-web ScrollViews emit overflow:auto divs; the tallest is the page body).
      const el = [...document.querySelectorAll<HTMLElement>('div')]
        .filter((cand) => getComputedStyle(cand).overflowY === 'auto' && cand.scrollHeight - cand.clientHeight > 4)
        .sort((a, b) => b.scrollHeight - a.scrollHeight)[0] ?? null;
      setSource(el);
      if (el) {
        const travel = el.scrollHeight - el.clientHeight;
        setScrollable(travel > 4);
        setProgress(travel <= 0 ? 0 : el.scrollTop / travel);
      } else {
        setScrollable(false);
      }
    }
    function tick() {
      measure();
      frame = 0;
    }
    measure();
    const interval = window.setInterval(() => {
      if (!frame) frame = window.requestAnimationFrame(tick);
    }, 250);
    return () => {
      window.clearInterval(interval);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!source) return undefined;
    const onScroll = () => {
      const travel = source.scrollHeight - source.clientHeight;
      setProgress(travel <= 0 ? 0 : source.scrollTop / travel);
    };
    source.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => source.removeEventListener('scroll', onScroll);
  }, [source]);

  const scrollToClientY = useCallback((clientY: number) => {
    const box = railRef.current?.getBoundingClientRect();
    if (!box || !source) return;
    const travel = box.height - BIRD;
    if (travel <= 0) return;
    const fraction = Math.min(1, Math.max(0, (clientY - box.top - BIRD / 2) / travel));
    source.scrollTo({ top: fraction * (source.scrollHeight - source.clientHeight) });
  }, [source]);

  if (typeof window === 'undefined') return null;
  if (Platform.OS !== 'web' || !scrollable) return null;

  const onRailPointerDown = (event: PointerEventSpec) => {
    scrollToClientY(event.clientY);
    setDragging(true);
  };
  const onMove = (event: PointerEventSpec) => {
    if (dragging) scrollToClientY(event.clientY);
  };
  const endDrag = () => setDragging(false);


  return (
    <div
      ref={railRef as unknown as React.Ref<HTMLDivElement>}
      style={{
        position: 'fixed', top: 0, bottom: 0, right: 0, width: 30, zIndex: 40,
        pointerEvents: 'none',
      } as React.CSSProperties}
      aria-hidden
    >
      <div
        onPointerDown={onRailPointerDown}
        style={{ pointerEvents: dragging ? 'none' : 'auto', position: 'absolute', top: 8, bottom: 8, right: 14, width: 1, cursor: 'pointer', background: BRASS_RAIL.railGradient }}
      />
      <div style={{ position: 'absolute', top: 8, bottom: 8, right: 12, width: 4, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <span key={i} style={{ height: 3, width: 3, borderRadius: 2, background: BRASS_RAIL.rivet, alignSelf: 'center', display: 'block' }} />
        ))}
      </div>
      <div
        onPointerDown={onRailPointerDown}
        onPointerMove={onMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        style={{
          pointerEvents: 'auto', position: 'absolute', top: `${progress * 100}%`, right: 0,
          width: BIRD, height: BIRD, transform: `translateY(-${progress * BIRD}px)`,
          cursor: dragging ? 'grabbing' : 'grab', touchAction: 'none',
          filter: `drop-shadow(0 0 6px ${BRASS_RAIL.glow})`, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 17 }}>🕊️</Text>
      </div>
    </div>
  );
}
