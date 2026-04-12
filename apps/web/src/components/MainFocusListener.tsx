'use client';

import { useEffect } from 'react';

export default function MainFocusListener() {
  useEffect(() => {
    const main = document.getElementById('MAIN_CONTENT_AREA');
    if (main) {
      const handleMouseEnter = () => main.focus();
      main.addEventListener('mouseenter', handleMouseEnter);
      
      // Initial focus
      main.focus();

      return () => {
        main.removeEventListener('mouseenter', handleMouseEnter);
      };
    }
  }, []);

  return null;
}
