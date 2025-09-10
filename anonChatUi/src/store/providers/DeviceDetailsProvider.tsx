import { createContext, useEffect, useLayoutEffect, useState } from "react";

export type ReactChildren = Readonly<{
  children: React.ReactNode;
}>;

type DeviceDetailsContextType = {
  isMobile: boolean;
};

export const DeviceDetailsContext =
  createContext<DeviceDetailsContextType | null>(null);

export function DeviceDetailsProvider({ children }: ReactChildren) {
  const [isMobile, setIsMobile] = useState(false);
  useLayoutEffect(() => {
    const checkScreen = () => {
      const screenWidth = window.innerWidth;
      setIsMobile(screenWidth < 768);
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

/*   useEffect(() => {
    console.log(isMobile);
  }, [isMobile]);
 */
  return (
    <DeviceDetailsContext.Provider value={{ isMobile }}>
      {children}
    </DeviceDetailsContext.Provider>
  );
}
