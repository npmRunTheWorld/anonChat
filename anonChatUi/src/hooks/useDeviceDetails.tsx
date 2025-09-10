import { DeviceDetailsContext } from "@/store/providers/DeviceDetailsProvider";
import { useContext } from "react";

//device details hook
//device details hook
export function useDeviceDetails() {
   const context = useContext(DeviceDetailsContext);
   if (!context) {
     throw new Error(
       "useDeviceDetails must be used within a deviceDetailsProvicer"
     );
   }
 
   return context;
 }
 