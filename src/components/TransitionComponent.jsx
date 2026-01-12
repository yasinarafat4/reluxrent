import TransitionContext from '@/contexts/TransitionContext';
import { gsap } from 'gsap';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import { SwitchTransition, Transition } from 'react-transition-group';

const TransitionComponent = ({ children }) => {
  const router = useRouter();
  const { toggleCompleted } = useContext(TransitionContext);
  return (
    <SwitchTransition>
      <Transition
        key={router.pathname}
        timeout={500}
        onEnter={(node) => {
          toggleCompleted(false);
          gsap.set(node, { autoAlpha: 0, scale: 0.8, xPercent: -100 });
          gsap
            .timeline({
              paused: true,
              onComplete: () => toggleCompleted(true),
            })
            .to(node, { autoAlpha: 1, xPercent: 0, duration: 0.25 })
            .to(node, { scale: 1, duration: 0.25 })
            .play();
        }}
        onExit={(node) => {
          gsap.timeline({ paused: true }).to(node, { scale: 0.8, duration: 0.2 }).to(node, { xPercent: 100, autoAlpha: 0, duration: 0.2 }).play();
        }}
      >
        {(state) => <div style={{ opacity: state === 'entered' ? 1 : 0 }}>{children}</div>}
      </Transition>
    </SwitchTransition>
  );
};

export default TransitionComponent;
