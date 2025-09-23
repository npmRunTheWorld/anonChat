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
  notificationOptions: {
    root?: string;
    outer?: string;
    individual?: string;
  };
};

export default function NotificationStack({
  notificationArr,
  setNotificationArr,
  notificationOptions,
}: NotificationStackProps) {
  return (
    <>
      {notificationArr?.length ? (
        <div
          className={`absolute inset-0 w-fit h-fit ${notificationOptions?.root}`}
        >
          <div
            className={`h-20 flex flex-col gap-2 overflow-hidden  z-1 ${notificationOptions?.outer}`}
          >
            {notificationArr.map((n) => (
              <Notification
                key={n.id}
                msg={n.msg}
                type={n.type as any}
                onClose={() =>
                  setNotificationArr((prev) =>
                    prev.filter((x) => x.id !== n.id)
                  )
                }
                notificationClass={notificationOptions?.individual}
              />
            ))}
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
