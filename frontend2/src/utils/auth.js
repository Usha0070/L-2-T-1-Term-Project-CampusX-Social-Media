const AUTH_KEY_PREFIX = "campusx_auth_";

export const getAuthData = (userId) => {
  const key = `${AUTH_KEY_PREFIX}${userId}`;
  const data = sessionStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

export const setAuthData = (userId, token) => {
  const key = `${AUTH_KEY_PREFIX}${userId}`;
  sessionStorage.setItem(key, JSON.stringify({ userId, token }));
};

export const removeAuthData = (userId) => {
  const key = `${AUTH_KEY_PREFIX}${userId}`;
  sessionStorage.removeItem(key);
};

export const getCurrentUserId = () => {
  const currentUserKey = sessionStorage.getItem(`${AUTH_KEY_PREFIX}current`);
  return currentUserKey ? JSON.parse(currentUserKey).userId : null;
};

export const getCurrentUserToken = () => {
  const currentUserKey = sessionStorage.getItem(`${AUTH_KEY_PREFIX}current`);
  return currentUserKey ? JSON.parse(currentUserKey).token : null;
};

export const setCurrentUser = (userId) => {
  const authData = getAuthData(userId);
  if (authData) {
    sessionStorage.setItem(`${AUTH_KEY_PREFIX}current`, JSON.stringify(authData));
  }
};

export const clearCurrentUser = () => {
  const currentUserId = getCurrentUserId();
  if (currentUserId) {
    removeAuthData(currentUserId);
  }
  sessionStorage.removeItem(`${AUTH_KEY_PREFIX}current`);
};
