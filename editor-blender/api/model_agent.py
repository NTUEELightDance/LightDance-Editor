import asyncio
import traceback
from dataclasses import dataclass
from typing import Optional

from ..client import client
from ..core.models import ModelsArray
from ..core.utils.convert import models_query_to_state
from ..graphqls.queries import GET_MODELS, QueryModelPayload


@dataclass
class ModelAgent:
    async def get_models(self) -> Optional[ModelsArray]:
        try:
            response = await client.execute(QueryModelPayload, GET_MODELS)
            models = response["models"]

            return models_query_to_state(models)

        except asyncio.CancelledError:
            pass

        except Exception:
            traceback.print_exc()

        return None


model_agent = ModelAgent()
