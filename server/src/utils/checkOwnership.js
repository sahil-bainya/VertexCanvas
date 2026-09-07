export const getBoardAccess = (board, userId) => {
  // String comparison use karo - reliable
  if (board.owner.toString() === userId.toString()) {
    return { isOwner: true, isCollaborator: false };
  }
  
  const isCollaborator = board.collaborators?.some(
    (collabId) => collabId.toString() === userId.toString()
  );
  
  if (isCollaborator) {
    return { isOwner: false, isCollaborator: true };
  }
  
  return { isOwner: false, isCollaborator: false };
};