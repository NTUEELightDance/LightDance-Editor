from dataclasses import dataclass

from ..client import client

# TODO: Handle returned cookies
# CookieJar?


@dataclass
class LoginResult:
    success: bool
    token: str = ""


class AuthAgent:
    async def login(self, username: str, password: str) -> LoginResult:
        data = {"username": username, "password": password}

        try:
            res = await client.post("/api/login", json=data)

            return LoginResult(success=True, token=res["token"])

        except Exception as e:
            print(e)
            return LoginResult(success=False)


authAgent = AuthAgent()
