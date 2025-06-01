from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime

from pydantic import BaseModel


class LogEventBase(BaseModel):
    session_id: UUID
    user_id: str
    event_type: str
    event_details_json: Optional[Dict[str, Any]] = None

    # Examples for event_details_json:
    # - code_submitted: {
    #       "challenge_id": "<challenge.id>",
    #       "submitted_code": "...",
    #       "run_result": "...",
    #       "is_correct": true,
    #       "error_type": null,
    #       "error_message": null,
    #       "attempt_number": 1
    #   }
    # - documentation_accessed: {
    #       "document_id": "<doc_topic.id>",
    #       "time_spent_seconds": 120,
    #       "challenge_context_id": "<challenge.id>"
    #   }
    # - hint_requested: {
    #       "hint_id": "<hint.id>",
    #       "challenge_id": "<challenge.id>",
    #       "requested_modality": "visual"
    #   }
    # etc.


class LogEventCreate(LogEventBase):
    # id and timestamp come from DB
    pass


class LogEventRead(LogEventBase):
    id: UUID
    timestamp: datetime

    class Config:
        orm_mode = True
