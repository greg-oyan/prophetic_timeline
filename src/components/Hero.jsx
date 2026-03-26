import React from 'react';

export default function Hero({ totalEvents }) {
  return (
    <section className="hero">
      <div className="hero-copy">
        <span className="hero-kicker">Scroll-driven biblical atlas</span>
        <h1>The Prophetic Timeline</h1>
        <p className="subtitle">
          Move through scripture as a continuous historical corridor, from
          Creation to the New Creation.
        </p>
      </div>

      <div className="hero-stats" aria-label="Timeline overview">
        <div>
          <strong>{totalEvents}</strong>
          <span>major moments</span>
        </div>
        <div>
          <strong>8</strong>
          <span>eras</span>
        </div>
        <div>
          <strong>1</strong>
          <span>continuous journey</span>
        </div>
      </div>

      <div className="scroll-hint">
        Scroll to traverse
        <span>&darr;</span>
      </div>
    </section>
  );
}
