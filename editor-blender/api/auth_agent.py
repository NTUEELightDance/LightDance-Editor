from .client import client


# TODO: Handle cookies
# CookieJar?

class AuthAgent:

    async def login(self, username, password):
        data = {'username': username, 'password': password}

        try:
            res = await client.post('/api/login', json=data)
            res = await res.json()

            return {
                "success": True,
                "token": res["token"],
            }

        except Exception as e:
            return {
                "success": False,
            }


authAgent = AuthAgent()
