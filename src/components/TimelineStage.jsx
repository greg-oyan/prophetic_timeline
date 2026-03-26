import React, { forwardRef, useMemo } from 'react';

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

function getPanelLayout(relativeIndex, localProgress) {
  const slots = {
    previous: { x: 24, y: 64, scale: 0.72, tilt: 3, lift: 8, opacity: 0.74 },
    current: { x: 58, y: 54, scale: 0.72, tilt: 3, lift: 8, opacity: 0.96 },
    next: { x: 81, y: 24, scale: 0.72, tilt: 3, lift: 8, opacity: 0.74 },
    farPrevious: { x: 10, y: 32, scale: 0.72, tilt: 3, lift: 8, opacity: 0.02 },
    farNext: { x: 93, y: 74, scale: 0.72, tilt: 3, lift: 8, opacity: 0.02 },
  };

  if (relativeIndex === -1) {
    return {
      x: lerp(slots.previous.x, slots.farPrevious.x, localProgress),
      y: lerp(slots.previous.y, slots.farPrevious.y, localProgress),
      scale: lerp(slots.previous.scale, slots.farPrevious.scale, localProgress),
      tilt: lerp(slots.previous.tilt, slots.farPrevious.tilt, localProgress),
      lift: lerp(slots.previous.lift, slots.farPrevious.lift, localProgress),
      opacity: lerp(slots.previous.opacity, slots.farPrevious.opacity, localProgress),
    };
  }

  if (relativeIndex === 0) {
    return {
      x: lerp(slots.current.x, slots.previous.x, localProgress),
      y: lerp(slots.current.y, slots.previous.y, localProgress),
      scale: lerp(slots.current.scale, slots.previous.scale, localProgress),
      tilt: lerp(slots.current.tilt, slots.previous.tilt, localProgress),
      lift: lerp(slots.current.lift, slots.previous.lift, localProgress),
      opacity: lerp(slots.current.opacity, slots.previous.opacity, localProgress),
    };
  }

  if (relativeIndex === 1) {
    return {
      x: lerp(slots.next.x, slots.current.x, localProgress),
      y: lerp(slots.next.y, slots.current.y, localProgress),
      scale: lerp(slots.next.scale, slots.current.scale, localProgress),
      tilt: lerp(slots.next.tilt, slots.current.tilt, localProgress),
      lift: lerp(slots.next.lift, slots.current.lift, localProgress),
      opacity: lerp(slots.next.opacity, slots.current.opacity, localProgress),
    };
  }

  if (relativeIndex === 2) {
    return {
      x: lerp(slots.farNext.x, slots.next.x, localProgress),
      y: lerp(slots.farNext.y, slots.next.y, localProgress),
      scale: lerp(slots.farNext.scale, slots.next.scale, localProgress),
      tilt: lerp(slots.farNext.tilt, slots.next.tilt, localProgress),
      lift: lerp(slots.farNext.lift, slots.next.lift, localProgress),
      opacity: lerp(slots.farNext.opacity, slots.next.opacity, localProgress),
    };
  }

  return null;
}

const TimelineStage = forwardRef(function TimelineStage(
  {
    eras,
    events,
    activeIndex,
    progress,
    currentEvent,
    expandedEventId,
    onToggleExpand,
  },
  ref
) {
  const activeEvent = currentEvent ?? events[activeIndex] ?? events[0];
  const expandedEvent = events.find((event) => event.id === expandedEventId) ?? null;
  const floatingIndex = progress * Math.max(events.length - 1, 1);
  const baseIndex = Math.floor(floatingIndex);
  const localProgress = floatingIndex - baseIndex;

  const visibleEvents = useMemo(
    () =>
      events.filter((event) => {
        const relativeIndex = event.index - baseIndex;
        return relativeIndex >= -1 && relativeIndex <= 2;
      }),
    [events, baseIndex]
  );

  const activeEra = eras.find((era) => era.id === activeEvent.eraId) ?? eras[0];

  return (
    <section
      className="timeline-journey grounded-timeline"
      ref={ref}
      style={{ '--journey-length': `${Math.max(events.length * 34, 1450)}vh` }}
    >
      <div className={`timeline-stage stage-${activeEvent.eraClass}`}>
        <div className="scene-sky" />
        <div className="scene-vignette" />
        <div className="scene-architecture scene-left" />
        <div className="scene-architecture scene-right" />
        <div className="scene-accent corner-top-left" />
        <div className="scene-accent corner-bottom-right" />

        <header className="timeline-topline">
          <div className="topline-date">{activeEvent.date}</div>
          <div className="topline-meta">
            <span>{activeEvent.scripture}</span>
            <span>{activeEra.name}</span>
          </div>
        </header>

        <div className="timeline-stage-world">
          <div className="timeline-horizon-glow" />
          <div className="timeline-ground">
            <div className="ground-plane ground-center" />
            <div className="ground-plane ground-left" />
            <div className="ground-plane ground-right" />
            <div className="ground-center-line" />
            <div className="ground-grid">
              {Array.from({ length: 6 }).map((_, index) => (
                <span key={index} className="ground-grid-line" />
              ))}
            </div>
          </div>

          <div className="timeline-panels-layer">
            {visibleEvents.map((event) => {
              const relativeIndex = event.index - baseIndex;
              const layout = getPanelLayout(relativeIndex, localProgress);

              if (!layout) {
                return null;
              }

              const isPrimary = event.index === activeIndex;

              return (
                <article
                  key={event.id}
                  className={`timeline-panel${isPrimary ? ' active' : ''}`}
                  style={{
                    '--panel-x': `${layout.x}%`,
                    '--panel-y': `${layout.y}%`,
                    '--panel-scale': layout.scale.toFixed(3),
                    '--panel-tilt': `${layout.tilt.toFixed(2)}deg`,
                    '--panel-lift': `${layout.lift.toFixed(2)}px`,
                    '--panel-opacity': layout.opacity.toFixed(3),
                    '--panel-blur': '0px',
                    '--panel-accent': event.eraAccent,
                    zIndex: isPrimary ? 30 : 20 - Math.abs(relativeIndex),
                  }}
                  role="button"
                  tabIndex={0}
                  onClick={() => onToggleExpand(event.id)}
                  onKeyDown={(keyEvent) => {
                    if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
                      keyEvent.preventDefault();
                      onToggleExpand(event.id);
                    }
                  }}
                >
                  <div className="timeline-panel-surface">
                    <div className="timeline-panel-header">
                      <span className="timeline-panel-date">{event.date}</span>
                      <span className="timeline-panel-era">{event.eraName}</span>
                    </div>
                    <h3>{event.title}</h3>
                    <div className="timeline-panel-collapsed">
                      {!isPrimary ? (
                        <div className="timeline-panel-preview-block">
                          <p className="timeline-panel-preview">{event.eraName}</p>
                        </div>
                      ) : null}
                      <div className="timeline-panel-expand">
                        See More Details
                      </div>
                    </div>
                  </div>
                  <div className="timeline-panel-stem" />
                </article>
              );
            })}
          </div>

          <aside className="timeline-sidebar">
            <span className="timeline-sidebar-era">Era {activeEvent.eraNumber}</span>
            <h2>{activeEvent.eraName}</h2>
            <div className="timeline-sidebar-progress">
              <strong>{String(activeIndex + 1).padStart(2, '0')}</strong>
              <span>{events.length} total events</span>
            </div>
          </aside>
        </div>

        <footer className="timeline-bottom-ui">
          <div className="timeline-minimap" aria-label="Timeline minimap">
            <div className="timeline-minimap-track" />
            <div
              className="timeline-minimap-progress"
              style={{ width: `${progress * 100}%` }}
            />
            {events.map((event) => (
              <span
                key={event.id}
                className={`timeline-minimap-dot${event.index === activeIndex ? ' active' : ''}`}
                style={{
                  left: `${(event.index / Math.max(events.length - 1, 1)) * 100}%`,
                  '--dot-accent': event.eraAccent,
                }}
              />
            ))}
          </div>
        </footer>

        {expandedEvent ? (
          <div className="timeline-expanded-overlay" onClick={() => onToggleExpand(expandedEvent.id)}>
            <article
              className="timeline-expanded-card"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="timeline-panel-header">
                <span className="timeline-panel-date">{expandedEvent.date}</span>
                <span className="timeline-panel-era">{expandedEvent.eraName}</span>
              </div>
              <h3>{expandedEvent.title}</h3>
              <div className="timeline-panel-body">
                <div className={`timeline-panel-visual visual-${expandedEvent.eraClass}`}>
                  <span className="visual-label">Scene</span>
                  <strong>{expandedEvent.eraName}</strong>
                </div>
                <div className="timeline-panel-copy">
                  <p className="timeline-panel-summary">{expandedEvent.desc}</p>
                  <div className="timeline-panel-meta">
                    <span>{expandedEvent.scripture}</span>
                    <span>Era {expandedEvent.eraNumber}</span>
                  </div>
                  {expandedEvent.prophetic ? (
                    <p className="timeline-panel-prophetic">{expandedEvent.prophetic}</p>
                  ) : null}
                </div>
              </div>
              <button
                type="button"
                className="timeline-expanded-close"
                onClick={() => onToggleExpand(expandedEvent.id)}
              >
                Close
              </button>
            </article>
          </div>
        ) : null}
      </div>
    </section>
  );
});

export default TimelineStage;
