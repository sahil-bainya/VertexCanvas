export const getBoardAccess = (board, userOrId) => {
  const isUserObject =
    userOrId && typeof userOrId === "object" && "role" in userOrId;

  const userId = isUserObject ? userOrId._id : userOrId;
  const userRole = isUserObject ? userOrId.role : null;

  // Admin bypass
  if (userRole === "admin") {
    return { isOwner: true, isCollaborator: true, isAdmin: true };
  }

  if (board.owner.toString() === userId.toString()) {
    return { isOwner: true, isCollaborator: false, isAdmin: false };
  }

  const isCollaborator = board.collaborators?.some(
    (collabId) => collabId.toString() === userId.toString(),
  );

  if (isCollaborator) {
    return { isOwner: false, isCollaborator: true, isAdmin: false };
  }

  return { isOwner: false, isCollaborator: false, isAdmin: false };
};