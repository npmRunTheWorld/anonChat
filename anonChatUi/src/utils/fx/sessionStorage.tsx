export function setStorageUsername(username: string) {
  sessionStorage.setItem("anochat-username", username);
}

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

export function clearStorageUsername() {
  sessionStorage.removeItem("anochat-username");
}

export function clearStorageRoomData() {
  sessionStorage.removeItem("anochat-roomData");
}
