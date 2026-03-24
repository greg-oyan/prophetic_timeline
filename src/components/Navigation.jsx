import React, { useState, useEffect, useRef } from 'react';
import { eras } from '../data/timeline';

export default function Navigation({ currentEra, visible, accentColor }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <>
      <nav className={`sticky-nav${visible ? ' visible' : ''}`}>
        <button
          className="current-era-btn"
          style={{ color: accentColor }}
          aria-expanded={open}
          onClick={(e) => {
            e.stopPropagation();
            setOpen(!open);
          }}
        >
          {currentEra}
        </button>
      </nav>
      <div
        ref={dropdownRef}
        className={`era-dropdown${open ? ' open' : ''}`}
        role="menu"
      >
        {eras.map((era) => (
          <a
            key={era.id}
            href={`#${era.id}`}
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            {era.name} <span className="era-date">{era.dateRange}</span>
          </a>
        ))}
      </div>
    </>
  );
}
