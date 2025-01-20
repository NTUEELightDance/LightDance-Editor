import asyncio
import traceback
from dataclasses import dataclass

from ..client import client
from ..core.models import DancersArray
from ..core.utils.convert import dancers_query_to_state
from ..schemas.queries import (
    GET_DANCERS,
    QueryDancersPayload,
    QueryPartOrderByWithRelationInput,
)


@dataclass
class DancerAgent:
    async def get_dancers(self) -> DancersArray | None:
        """Get the dancer part list from the server."""
        try:
            response = await client.execute(
                QueryDancersPayload,
                GET_DANCERS,
                variables={"orderBy": [QueryPartOrderByWithRelationInput(id="asc")]},
            )
            dancers = response["dancers"]

            return dancers_query_to_state(dancers)

        except asyncio.CancelledError:
            pass

        except Exception:
            traceback.print_exc()

        return None


dancer_agent = DancerAgent()
