import React, { useEffect, useRef } from 'react';
import EventCard from './EventCard';

export default function EraSection({ era }) {
  const headerRef = useRef(null);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed');
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id={era.id} className={`era-section ${era.cssClass}`} data-era={era.name}>
      <div className="era-header" ref={headerRef}>
        <div className="parallax-bg"><div className="layer"></div></div>
        <span className="era-number">Era {era.number}</span>
        <h2 className="era-title">{era.name}</h2>
        <p className="era-date-range">{era.dateRange}</p>
      </div>
      <div className="events-container">
        {era.events.map((event, i) => (
          <EventCard key={event.id} event={event} delay={(i % 3) * 0.08} />
        ))}
      </div>
    </section>
  );
}
