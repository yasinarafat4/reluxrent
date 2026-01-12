import { useCallback, useEffect, useRef, useState } from 'react';

const Counter = ({ value }) => {
  const [count, setCount] = useState(0);
  const [hasStartedCounting, setHasStartedCounting] = useState(false);
  const observerRef = useRef(null);

  const startCounting = useCallback(() => {
    let currentCount = 0;
    const interval = setInterval(() => {
      if (currentCount >= value) {
        clearInterval(interval);
      } else {
        currentCount++;
        setCount(currentCount);
      }
    }, 100);
  }, [value]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStartedCounting) {
          startCounting();
          setHasStartedCounting(true);
        }
      },
      { threshold: 0.3 },
    );

    const currentObserverRef = observerRef.current;

    if (currentObserverRef) {
      observer.observe(currentObserverRef);
    }

    return () => {
      if (currentObserverRef) {
        observer.unobserve(currentObserverRef);
      }
    };
  }, [startCounting, hasStartedCounting]);

  return (
    <span ref={observerRef}>
      <span>{count}</span>
    </span>
  );
};

export default Counter;
