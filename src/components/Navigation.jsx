import React, { useEffect, useRef, useState } from 'react';

export default function Navigation({
  eras,
  currentEra,
  currentEvent,
  visible,
  accentColor,
  onJumpToEra,
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <>
      <nav className={`sticky-nav${visible ? ' visible' : ''}`}>
        <div className="nav-brand">
          <span className="nav-brand-mark" style={{ background: accentColor }} />
          <div className="nav-brand-copy">
            <strong>{currentEvent?.title}</strong>
            <span className="nav-brand-meta">{currentEvent?.scripture}</span>
          </div>
        </div>

        <button
          type="button"
          className="current-era-btn"
          style={{ color: accentColor }}
          aria-expanded={open}
          onClick={(event) => {
            event.stopPropagation();
            setOpen((value) => !value);
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
          <button
            key={era.id}
            type="button"
            role="menuitem"
            onClick={() => {
              onJumpToEra(era.id);
              setOpen(false);
            }}
          >
            <span>{era.name}</span>
            <span className="era-date">{era.dateRange}</span>
          </button>
        ))}
      </div>
    </>
  );
}
