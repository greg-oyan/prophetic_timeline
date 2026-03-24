import React, { useState, useEffect, useCallback } from 'react';
import { eras } from './data/timeline';
import ProgressBar from './components/ProgressBar';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import EraSection from './components/EraSection';
import Closing from './components/Closing';

import './styles/base.css';
import './styles/navigation.css';
import './styles/hero.css';
import './styles/era.css';
import './styles/events.css';
import './styles/closing.css';

export default function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentEra, setCurrentEra] = useState(eras[0].name);
  const [navVisible, setNavVisible] = useState(false);

  const accentColor =
    eras.find((e) => e.name === currentEra)?.accent || '#c8a96e';

  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    setScrollProgress(progress);
    setNavVisible(scrollTop > window.innerHeight * 0.5);

    // Determine current era
    const scrollCenter = scrollTop + window.innerHeight * 0.4;
    const sections = document.querySelectorAll('.era-section');
    sections.forEach((section) => {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;
      if (scrollCenter >= top && scrollCenter < bottom) {
        const name = section.getAttribute('data-era');
        if (name) setCurrentEra(name);
      }
    });
  }, []);

  // Parallax
  const handleParallax = useCallback(() => {
    document.querySelectorAll('.parallax-bg .layer').forEach((layer) => {
      const section = layer.closest('.era-section');
      if (!section) return;
      const rect = section.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
      const offset = (rect.top / window.innerHeight) * -30;
      layer.style.transform = `translateY(${offset}px)`;
    });
  }, []);

  useEffect(() => {
    const onScroll = () => {
      requestAnimationFrame(() => {
        handleScroll();
        handleParallax();
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [handleScroll, handleParallax]);

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      const cards = Array.from(document.querySelectorAll('.event-card'));
      if (!cards.length) return;

      const focused = document.activeElement;
      let idx = cards.indexOf(focused);
      if (e.key === 'ArrowDown') {
        idx = idx < 0 ? 0 : Math.min(idx + 1, cards.length - 1);
      } else {
        idx = idx < 0 ? 0 : Math.max(idx - 1, 0);
      }
      cards[idx].focus();
      cards[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
      e.preventDefault();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <>
      <ProgressBar progress={scrollProgress} color={accentColor} />
      <Navigation
        currentEra={currentEra}
        visible={navVisible}
        accentColor={accentColor}
      />
      <Hero />
      {eras.map((era) => (
        <EraSection key={era.id} era={era} />
      ))}
      <Closing />
    </>
  );
}
