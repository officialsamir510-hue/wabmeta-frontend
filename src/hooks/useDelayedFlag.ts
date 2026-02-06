import { useEffect, useState } from "react";

export function useDelayedFlag(flag: boolean, delay = 300) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!flag) {
      setShow(false);
      return;
    }
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [flag, delay]);

  return show;
}