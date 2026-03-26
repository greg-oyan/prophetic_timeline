import React from 'react';

export default function Closing({ totalEvents }) {
  return (
    <>
      <section className="closing">
        <span className="closing-kicker">Journey complete</span>
        <blockquote>
          &ldquo;He who testifies to these things says, &lsquo;Yes, I am coming
          soon.&rsquo; Amen. Come, Lord Jesus.&rdquo;
        </blockquote>
        <cite>Revelation 22:20</cite>
      </section>
      <footer>
        <p>The Prophetic Timeline presents {totalEvents} events across 8 eras.</p>
        <p>
          Dates follow mainstream scholarly consensus where available, with
          prophetic links surfaced where the narrative calls for them.
        </p>
      </footer>
    </>
  );
}
