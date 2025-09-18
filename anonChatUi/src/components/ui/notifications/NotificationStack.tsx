import React, { useState, type SetStateAction } from "react";
import Notification from "./Notification";

export type NotificationItem = {
  id: number | string;
  msg: string;
  type?: string;
};

export type NotificationStackProps = {
  notificationArr: NotificationItem[];
  setNotificationArr: React.Dispatch<SetStateAction<NotificationItem[]>>;
  notiStackClass?: string;
  singleNotificationClass?: string;
};

export default function NotificationStack({
  notificationArr,
  setNotificationArr,
  notiStackClass,
  singleNotificationClass,
}: NotificationStackProps) {
  return (
    <div className={`absolute inset-0 w-full`}>
      <div
        className={`h-20 flex flex-col gap-2 overflow-hidden ${notiStackClass}`}
      >
        {notificationArr.map((n) => (
          <Notification
            key={n.id}
            msg={n.msg}
            type={n.type as any}
            onClose={() =>
              setNotificationArr((prev) => prev.filter((x) => x.id !== n.id))
            }
            notificationClass={singleNotificationClass}
          />
        ))}
      </div>
    </div>
  );
}
