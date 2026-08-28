import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';

const SmoothScroll = ({ children }) => {
  const { pathname } = useLocation();
  const pageRef = useRef(null);

  useEffect(() => {
    // Reset scroll to top on route change
    window.scrollTo(0, 0);

    // GSAP page enter transition
    if (pageRef.current) {
      gsap.fromTo(
        pageRef.current,
        { opacity: 0, y: 15 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.6, 
          ease: 'power3.out',
          clearProps: 'all'
        }
      );
    }
  }, [pathname]);

  return (
    <div ref={pageRef} style={{ minHeight: '80vh' }}>
      {children}
    </div>
  );
};

export default SmoothScroll;
