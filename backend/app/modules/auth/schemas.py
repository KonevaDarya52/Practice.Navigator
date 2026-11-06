import re
import uuid

from pydantic import EmailStr, Field, field_validator

from app.core.schemas import CamelModel


class OrganizationShort(CamelModel):
    id: uuid.UUID
    name: str
    status: str
    moderator_comment: str = ""


class UserOut(CamelModel):
    id: uuid.UUID
    email: str
    role: str
    full_name: str
    # Есть только у представителя компании
    organization: OrganizationShort | None = None


class TokenOut(CamelModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class LoginIn(CamelModel):
    email: EmailStr
    password: str


def _check_full_name(value: str) -> str:
    value = " ".join(value.split())
    if len(value.split(" ")) < 2:
        raise ValueError("Укажи фамилию и имя")
    return value


class StudentRegisterIn(CamelModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(max_length=255)

    _name = field_validator("full_name")(_check_full_name)


class CompanyRegisterIn(CamelModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(max_length=255)  # представитель компании
    organization_name: str = Field(min_length=2, max_length=255)
    inn: str
    contact_phone: str = Field(default="", max_length=32)
    website: str = Field(default="", max_length=255)

    _name = field_validator("full_name")(_check_full_name)

    @field_validator("inn")
    @classmethod
    def check_inn(cls, value: str) -> str:
        value = value.strip()
        # ИНН организации — 10 цифр, ИП — 12
        if not re.fullmatch(r"\d{10}|\d{12}", value):
            raise ValueError("ИНН — это 10 или 12 цифр")
        return value
