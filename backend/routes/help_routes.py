from fastapi import APIRouter

from database.schemas import HelpChatRequest, HelpChatResponse
from services.help_chat_service import HelpChatService


router = APIRouter(tags=["Help"])


@router.post("/help-chat", response_model=HelpChatResponse)
def help_chat(payload: HelpChatRequest) -> HelpChatResponse:
    """Return project-scoped support guidance for the in-app smart help assistant."""
    response = HelpChatService().answer(payload.message)
    return HelpChatResponse(**response)
