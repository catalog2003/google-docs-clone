"""Custom exceptions."""
from fastapi import HTTPException, status

class AppException(HTTPException):
    pass

class NotFoundException(AppException):
    def __init__(self, entity: str):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=f"{entity} not found")

class PermissionDeniedException(AppException):
    def __init__(self):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")

class DocumentLockedException(AppException):
    def __init__(self):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail="Document is locked by another user")
