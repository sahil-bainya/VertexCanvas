export const getBoardAccess = (board, userId) => {
  if (board.owner.equals(userId)) {
    return { isOwner: true, isCollaborator: false };
  }
  
  const isCollaborator = board.collaborators?.some(
    (collabId) => collabId.equals(userId)
  );
  
  if (isCollaborator) {
    return { isOwner: false, isCollaborator: true };
  }
  
  return { isOwner: false, isCollaborator: false };
};