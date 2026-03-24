import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { eras } from '../data/timeline';

// Spacing between items along the Z axis
const CARD_SPACING = 600;
const ERA_HEADER_SPACING = 300; // extra before each era header
const FOCUS_RANGE = 250; // Z distance from camera where card is "in focus"
const FADE_RANGE = 800; // Z distance where card starts to fade

export default function Timeline3D() {
  const [cameraZ, setCameraZ] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentEraName, setCurrentEraName] = useState(eras[0].name);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const runwayRef = useRef(null);
  const dropdownRef = useRef(null);

  // Build flat list of items: hero, [era_header, event, event, ...], closing
  const items = useMemo(() => {
    const list = [];
    list.push({ type: 'hero', id: 'hero' });
    eras.forEach((era) => {
      list.push({ type: 'era-header', id: `header-${era.id}`, era });
      era.events.forEach((event) => {
        list.push({ type: 'event', id: `event-${event.id}`, event, era });
      });
    });
    list.push({ type: 'closing', id: 'closing' });
    return list;
  }, []);

  // Z position for each item
  const itemPositions = useMemo(() => {
    const positions = [];
    let z = 0;
    items.forEach((item, i) => {
      if (item.type === 'era-header' && i > 1) {
        z += ERA_HEADER_SPACING; // extra gap before era headers
      }
      positions.push(z);
      z += CARD_SPACING;
    });
    return positions;
  }, [items]);

  const totalDepth = itemPositions[itemPositions.length - 1] || 0;
  const scrollMultiplier = totalDepth;

  // Map each item to its era for color lookup
  const getEraForIndex = useCallback((idx) => {
    const item = items[idx];
    if (!item) return eras[0];
    if (item.era) return item.era;
    // hero or closing — find nearest era
    if (item.type === 'hero') return eras[0];
    return eras[eras.length - 1];
  }, [items]);

  // Scroll handler
  const handleScroll = useCallback(() => {
    if (!runwayRef.current) return;
    const el = runwayRef.current;
    const scrollTop = window.scrollY;
    const maxScroll = el.scrollHeight - window.innerHeight;
    const fraction = maxScroll > 0 ? Math.min(scrollTop / maxScroll, 1) : 0;
    const newCameraZ = fraction * scrollMultiplier;
    setCameraZ(newCameraZ);

    // Find closest item to camera
    let closestIdx = 0;
    let closestDist = Infinity;
    itemPositions.forEach((z, i) => {
      const dist = Math.abs(z - newCameraZ);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    });
    setActiveIndex(closestIdx);

    // Determine era
    const era = getEraForIndex(closestIdx);
    setCurrentEraName(era.name);
  }, [scrollMultiplier, itemPositions, getEraForIndex]);

  useEffect(() => {
    const onScroll = () => requestAnimationFrame(handleScroll);
    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [handleScroll]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  // Jump to era
  const jumpToEra = useCallback((eraId) => {
    const idx = items.findIndex(
      (item) => item.type === 'era-header' && item.id === `header-${eraId}`
    );
    if (idx < 0) return;
    const targetZ = itemPositions[idx];
    const fraction = totalDepth > 0 ? targetZ / totalDepth : 0;
    const maxScroll =
      (runwayRef.current?.scrollHeight || 0) - window.innerHeight;
    window.scrollTo({ top: fraction * maxScroll, behavior: 'smooth' });
    setDropdownOpen(false);
  }, [items, itemPositions, totalDepth]);

  // Current era color
  const activeEra = getEraForIndex(activeIndex);
  const accentColor = activeEra.accent;

  // Scroll progress
  const progress = totalDepth > 0 ? (cameraZ / totalDepth) * 100 : 0;

  // Background gradient per era
  const bgMap = {
    'era-creation': 'radial-gradient(ellipse at 50% 50%, #0d2818 0%, #0a0a0f 70%)',
    'era-patriarchs': 'radial-gradient(ellipse at 50% 50%, #1a1508 0%, #0a0a0f 70%)',
    'era-exodus': 'radial-gradient(ellipse at 50% 50%, #1f0a08 0%, #0a0a0f 70%)',
    'era-kingdom': 'radial-gradient(ellipse at 50% 50%, #140e24 0%, #0a0a0f 70%)',
    'era-exile': 'radial-gradient(ellipse at 50% 50%, #10121a 0%, #0a0a0f 70%)',
    'era-christ': 'radial-gradient(ellipse at 50% 50%, #1a1610 0%, #0a0a0f 70%)',
    'era-destruction': 'radial-gradient(ellipse at 50% 50%, #1a0c06 0%, #0a0a0f 70%)',
    'era-secondcoming': 'radial-gradient(ellipse at 50% 50%, #14141e 0%, #0a0a0f 70%)',
  };
  const bgGradient = bgMap[activeEra.cssClass] || bgMap['era-creation'];

  return (
    <>
      {/* Scroll progress bar */}
      <div
        className="scroll-progress"
        style={{ width: `${progress}%`, background: accentColor }}
      />

      {/* Sticky nav */}
      <nav className={`sticky-nav${cameraZ > 200 ? ' visible' : ''}`}>
        <button
          className="current-era-btn"
          style={{ color: accentColor }}
          aria-expanded={dropdownOpen}
          onClick={(e) => {
            e.stopPropagation();
            setDropdownOpen(!dropdownOpen);
          }}
        >
          {currentEraName}
        </button>
      </nav>
      <div
        ref={dropdownRef}
        className={`era-dropdown${dropdownOpen ? ' open' : ''}`}
        role="menu"
      >
        {eras.map((era) => (
          <a
            key={era.id}
            href={`#${era.id}`}
            role="menuitem"
            onClick={(e) => {
              e.preventDefault();
              jumpToEra(era.id);
            }}
          >
            {era.name} <span className="era-date">{era.dateRange}</span>
          </a>
        ))}
      </div>

      {/* Atmospheric background */}
      <div
        className="tunnel-atmosphere"
        style={{ background: bgGradient }}
      />
      <div className="tunnel-lines" style={{ '--era-accent': accentColor }} />

      {/* 3D Viewport */}
      <div className="tunnel-viewport">
        <div className="tunnel-scene">
          {items.map((item, i) => {
            const itemZ = itemPositions[i];
            const relativeZ = itemZ - cameraZ;

            // Cull items far behind or way ahead
            if (relativeZ < -400 || relativeZ > 4000) return null;

            // Opacity: full at focus, fading further away
            const dist = Math.abs(relativeZ);
            let opacity;
            if (dist < FOCUS_RANGE) {
              opacity = 1;
            } else if (dist < FADE_RANGE) {
              opacity = 1 - (dist - FOCUS_RANGE) / (FADE_RANGE - FOCUS_RANGE);
            } else {
              opacity = Math.max(0, 0.15 - (dist - FADE_RANGE) / 3000);
            }

            // Items behind camera fade faster
            if (relativeZ < 0) {
              opacity *= Math.max(0, 1 + relativeZ / 400);
            }

            const inFocus = dist < FOCUS_RANGE;

            // Slight horizontal offset for variety
            const xOffsets = [0, 30, -20, 15, -30, 10, -15, 25, -10, 5];
            const xOff = xOffsets[i % xOffsets.length];

            const style = {
              transform: `translate(-50%, -50%) translateZ(${relativeZ}px) translateX(${xOff}px)`,
              opacity: Math.max(0, opacity),
              '--era-accent': item.era?.accent || activeEra.accent,
              '--era-glow': item.era?.glow || activeEra.glow,
            };

            if (item.type === 'hero') {
              return (
                <div key={item.id} className="tunnel-hero" style={style}>
                  <h1>The Prophetic Timeline</h1>
                  <p className="subtitle">
                    From Creation to the New Creation &mdash; an immersive
                    journey through Biblical prophetic history
                  </p>
                  <div className="scroll-hint">
                    Begin the journey
                    <span>&darr;</span>
                  </div>
                </div>
              );
            }

            if (item.type === 'era-header') {
              return (
                <div key={item.id} className="tunnel-era-header" style={style}>
                  <div className="era-number">Era {item.era.number}</div>
                  <h2 className="era-title">{item.era.name}</h2>
                  <p className="era-date-range">{item.era.dateRange}</p>
                </div>
              );
            }

            if (item.type === 'closing') {
              return (
                <div key={item.id} className="tunnel-closing" style={style}>
                  <blockquote>
                    &ldquo;He who testifies to these things says, &lsquo;Yes, I am
                    coming soon.&rsquo; Amen. Come, Lord Jesus.&rdquo;
                  </blockquote>
                  <cite>&mdash; Revelation 22:20</cite>
                </div>
              );
            }

            // Event card
            return (
              <div
                key={item.id}
                className={`tunnel-card${inFocus ? ' in-focus' : ''}`}
                style={style}
              >
                <span className="event-date">{item.event.date}</span>
                <h3>{item.event.title}</h3>
                <p className="event-desc">{item.event.desc}</p>
                <p className="scripture-ref">{item.event.scripture}</p>
                {item.event.prophetic && (
                  <p className="prophetic-note">{item.event.prophetic}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Depth indicator (right rail dots) */}
      <div className="depth-indicator">
        {items.map((item, i) => {
          if (item.type === 'hero' || item.type === 'closing') return null;
          const isEraMarker = item.type === 'era-header';
          return (
            <div
              key={item.id}
              className={`depth-dot${i === activeIndex ? ' active' : ''}${isEraMarker ? ' era-marker' : ''}`}
              style={i === activeIndex ? { background: accentColor, boxShadow: `0 0 8px ${activeEra.glow}` } : undefined}
              title={item.type === 'era-header' ? item.era.name : item.event?.title}
              onClick={() => {
                const fraction = totalDepth > 0 ? itemPositions[i] / totalDepth : 0;
                const maxScroll = (runwayRef.current?.scrollHeight || 0) - window.innerHeight;
                window.scrollTo({ top: fraction * maxScroll, behavior: 'smooth' });
              }}
            />
          );
        })}
      </div>

      {/* Invisible scroll runway */}
      <div ref={runwayRef} className="scroll-runway" style={{ height: `${items.length * 100 + 100}vh` }} />
    </>
  );
}
