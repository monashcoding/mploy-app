// Shared mutable state that DotBackground reads every frame
// and PageTransition writes to when navigation happens.
// Using a plain object (not React state) so the canvas animation
// loop can read it without re-renders.

export const transitionState = {
  active: false,
  direction: 1 as 1 | -1,
  startTime: 0,
};
