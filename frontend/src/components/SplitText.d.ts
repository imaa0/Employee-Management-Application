declare module "@/components/SplitText" {
  import { FC } from "react";

  interface SplitTextProps {
    text: string;
    className?: string;
    delay?: number;
    duration?: number;
    ease?: string;
    splitType?: string;
    from?: Record<string, unknown>;
    to?: Record<string, unknown>;
    threshold?: number;
    rootMargin?: string;
    textAlign?: string;
    tag?: string;
    onLetterAnimationComplete?: () => void;
  }

  const SplitText: FC<SplitTextProps>;
  export default SplitText;
}
