import React, { useEffect, useRef } from 'react';

export default function EventCard({ event, delay }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
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
    <div
      ref={ref}
      className="event-card"
      tabIndex={0}
      style={{ transitionDelay: `${delay}s` }}
    >
      <span className="event-date">{event.date}</span>
      <h3>{event.title}</h3>
      <p className="event-desc">{event.desc}</p>
      <p className="scripture-ref">{event.scripture}</p>
      {event.prophetic && (
        <p className="prophetic-note">{event.prophetic}</p>
      )}
    </div>
  );
}
