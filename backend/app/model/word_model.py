from pydantic import BaseModel
class wordModel(BaseModel):
    word: str
    path: str
    username: str