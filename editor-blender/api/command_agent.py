import json
from dataclasses import dataclass

from ..client import client
from ..graphqls.command import ToControllerServerPartial


@dataclass
class CommandAgent:
    async def send_to_controller_server(self, msg_partial: ToControllerServerPartial):
        msg_full = json.dumps(
            {
                **(msg_partial.to_dict()),
                "from": "controlPanel",
                "statusCode": 0,
            }
        )
        await client.send_command(msg_full)


command_agent = CommandAgent()
