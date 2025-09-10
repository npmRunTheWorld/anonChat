import { DeviceDetailsProvider } from "./DeviceDetailsProvider";
import type { ReactChildren } from "./DeviceDetailsProvider";

export function ClientProvider({ children }: ReactChildren) {
  return <DeviceDetailsProvider>{children}</DeviceDetailsProvider>;
}
