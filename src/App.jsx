import React, {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { eras } from './data/timeline.js';
import ProgressBar from './components/ProgressBar.jsx';
import Navigation from './components/Navigation.jsx';
import TimelineStage from './components/TimelineStage.jsx';
import './styles/base.css';
import './styles/navigation.css';
import './styles/timeline-stage.css';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const lanePattern = [-1, 1];

function buildTimelineEvents() {
  let eventIndex = 0;

  return eras.flatMap((era, eraIndex) =>
    era.events.map((event, indexInEra) => {
      const lane = lanePattern[eventIndex % lanePattern.length];
      const timelineEvent = {
        ...event,
        eraId: era.id,
        eraName: era.name,
        eraNumber: era.number,
        eraAccent: era.accent,
        eraGlow: era.glow,
        eraClass: era.cssClass,
        eraDateRange: era.dateRange,
        eraIndex,
        indexInEra,
        index: eventIndex,
        lane,
      };

      eventIndex += 1;
      return timelineEvent;
    })
  );
}

export default function App() {
  const stageSectionRef = useRef(null);
  const timelineEvents = useMemo(buildTimelineEvents, []);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [journeyProgress, setJourneyProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [currentEra, setCurrentEra] = useState(eras[0].name);
  const [navVisible, setNavVisible] = useState(false);

  const currentEvent = timelineEvents[activeIndex] ?? timelineEvents[0];
  const accentColor = currentEvent?.eraAccent ?? '#c8a96e';

  const eraStops = useMemo(
    () =>
      eras.map((era) => ({
        ...era,
        eventIndex:
          timelineEvents.find((event) => event.eraId === era.id)?.index ?? 0,
      })),
    [timelineEvents]
  );

  const syncScrollState = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pageProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    const stageSection = stageSectionRef.current;

    let nextJourneyProgress = 0;

    if (stageSection) {
      const sectionTop = stageSection.offsetTop;
      const sectionHeight = stageSection.offsetHeight;
      const maxScrollable = Math.max(sectionHeight - window.innerHeight, 1);
      nextJourneyProgress = clamp(
        (scrollTop - sectionTop) / maxScrollable,
        0,
        1
      );
    }

    const nextIndex = Math.round(
      nextJourneyProgress * (timelineEvents.length - 1)
    );
    const nextEvent = timelineEvents[nextIndex] ?? timelineEvents[0];

    startTransition(() => {
      setScrollProgress(pageProgress);
      setJourneyProgress(nextJourneyProgress);
      setActiveIndex(nextIndex);
      setCurrentEra(nextEvent.eraName);
      setNavVisible(scrollTop > window.innerHeight * 0.35);
    });
  }, [timelineEvents]);

  useEffect(() => {
    let frameId = 0;

    const handleViewportChange = () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }

      frameId = window.requestAnimationFrame(() => {
        syncScrollState();
      });
    };

    window.addEventListener('scroll', handleViewportChange, { passive: true });
    window.addEventListener('resize', handleViewportChange);
    handleViewportChange();

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
      window.removeEventListener('scroll', handleViewportChange);
      window.removeEventListener('resize', handleViewportChange);
    };
  }, [syncScrollState]);

  useEffect(() => {
    if (expandedEventId == null) {
      return;
    }

    const expandedIndex = timelineEvents.findIndex(
      (event) => event.id === expandedEventId
    );

    if (expandedIndex >= 0 && expandedIndex !== activeIndex) {
      setActiveIndex(expandedIndex);
    }
  }, [expandedEventId, activeIndex, timelineEvents]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
        return;
      }

      const direction = event.key === 'ArrowDown' ? 1 : -1;
      const nextIndex = clamp(
        activeIndex + direction,
        0,
        timelineEvents.length - 1
      );

      if (nextIndex === activeIndex) {
        return;
      }

      const stageSection = stageSectionRef.current;
      if (!stageSection) {
        return;
      }

      const maxScrollable = Math.max(stageSection.offsetHeight - window.innerHeight, 1);
      const nextProgress = nextIndex / Math.max(timelineEvents.length - 1, 1);

      window.scrollTo({
        top: stageSection.offsetTop + maxScrollable * nextProgress,
        behavior: 'smooth',
      });
      event.preventDefault();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [activeIndex, timelineEvents.length]);

  const jumpToEra = useCallback(
    (eraId) => {
      const stageSection = stageSectionRef.current;
      if (!stageSection) {
        return;
      }

      const targetEra = eraStops.find((era) => era.id === eraId);
      if (!targetEra) {
        return;
      }

      const maxScrollable = Math.max(stageSection.offsetHeight - window.innerHeight, 1);
      const targetProgress =
        targetEra.eventIndex / Math.max(timelineEvents.length - 1, 1);

      window.scrollTo({
        top: stageSection.offsetTop + maxScrollable * targetProgress,
        behavior: 'smooth',
      });
    },
    [eraStops, timelineEvents.length]
  );

  return (
    <>
      <ProgressBar progress={scrollProgress} color={accentColor} />
      <Navigation
        eras={eraStops}
        currentEra={currentEra}
        currentEvent={currentEvent}
        visible={navVisible}
        accentColor={accentColor}
        onJumpToEra={jumpToEra}
      />
      <TimelineStage
        ref={stageSectionRef}
        events={timelineEvents}
        eras={eraStops}
        activeIndex={activeIndex}
        progress={journeyProgress}
        currentEvent={currentEvent}
        expandedEventId={expandedEventId}
        onToggleExpand={(eventId) =>
          setExpandedEventId((currentId) => (currentId === eventId ? null : eventId))
        }
      />
    </>
  );
}
