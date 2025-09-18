import { useEffect } from "react";

type NotificationProps = {
  msg: string;
  position?: "bottom-0" | "top-0" | string;
  type?: "message" | "error" | "warning";
  delay?: number;
  onClose: () => void;
  notificationClass?: string;
};

const Notification = ({
  msg,
  type,
  delay = 1000,
  onClose,
  notificationClass,
}: NotificationProps) => {
  // States

  // Lifecycle
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, onClose]);
  // Functions

  return (
    <div
      className={`w-fit justify-center items-center pointer-events-none z-150`}
    >
      <div
        className={`flex justify-center items-center w-full rounded-md bg-neutral-400/30 !text-orange-700 ${
          type && ""
        } ${notificationClass && ""}`}
      >
        <p className="!rounded-md pl-2 pr-2">{msg}</p>
      </div>
    </div>
  );
};

export default Notification;
