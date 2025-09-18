//USERNAME
export function getStorageUsername() {
  try {
    return JSON.parse(sessionStorage.getItem("anochat-username") ?? "");
  } catch (error) {
    return "";
  }
}

export function setStorageUsername(username: string) {
  sessionStorage.setItem("anochat-username", username);
}

export function clearStorageUsername() {
  sessionStorage.removeItem("anochat-username");
}

//ROOM DATA
export function setStorageRoomData({
  title,
  topics,
  isPublic,
}: {
  title: string;
  topics?: string;
  isPublic?: boolean;
}) {
  sessionStorage.setItem(
    "anonchat-roomData",
    JSON.stringify({
      title,
      topics: topics ?? "",
      isPublic: isPublic ?? false,
    })
  );
}

export function clearStorageRoomData() {
  sessionStorage.removeItem("anochat-roomData");
}
