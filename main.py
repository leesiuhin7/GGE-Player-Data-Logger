import json
import asyncio
import httpx
import time
import os
from typing import Any, Callable


def read_file(filename: str) -> Any:
    with open(filename, "r") as file:
        data = json.load(file)

    return data


def write_file(filename: str, data: Any) -> None:
    with open(filename, "w") as file:
        json.dump(data, file)



class ServerComm:

    def __init__(self) -> None:
        self.URL = os.environ.get("SERVER_URL", "")
        self.semaphore = asyncio.Semaphore(10)


    async def get_player_data(
        self
    ) -> dict[str, tuple[int, str, str]]:
        """
        Returns data of all players fetched from the server

        :return: Player data in the form of 
        {str(OID): (time, name, alliance)}
        :rtype: dict[str, tuple[str, str]]
        """

        player_data: dict[str, tuple[int, str, str]] = {}

        url = self._encode_url(2, 1, 5)
        response = httpx.get(url=url)
        json_content = json.loads(response.content)
        
        count = - (json_content["content"]["LR"] // - 10)

        current_time = int(time.time())

        async with httpx.AsyncClient() as client:
            tasks = [
                self._safe_fetch(client, i, time_data=current_time)
                for i in range(count)
            ]
            results = await asyncio.gather(*tasks)

        for result in results:
            for key in result:
                player_data[key] = result[key]

        return player_data


    async def _safe_fetch(
        self,
        client: httpx.AsyncClient,
        index: int,
        time_data: int
    ) -> dict[str, tuple[int, str, str]]:
        
        try:
            return await self._fetch(client, index, time_data)
        except Exception as e:
            return {}
    

    async def _fetch(
        self, 
        client: httpx.AsyncClient, 
        index: int,
        time_data: int
    ) -> dict[str, tuple[int, str, str]]:
        
        player_data_dict: dict[str, tuple[int, str, str]] = {}

        url = self._encode_url(2, 1, index * 10 + 5)
        async with self.semaphore:
            response = await client.get(url=url)

        json_content = json.loads(response.content)
        player_data = json_content["content"]["L"]

        for player in player_data:
            data_dict: dict = player[2]
            OID = data_dict.get("OID")
            name = data_dict.get("N", "")
            alliance = data_dict.get("AN", "")

            castles = data_dict.get("AP")
            if castles and OID is not None:
                player_data_dict[str(OID)] = (
                    time_data, name, alliance
                )

        return player_data_dict
    

    def _encode_url(self, LT: int, LID: int, SV: int) -> str:
        data_str = f'"LT":{LT},"LID":{LID},"SV":"{SV}"'
        return self.URL + data_str



class DeltaEncoder:

    @classmethod
    def append(
        cls, 
        data: dict[str, list[Any]],
        new_data: dict[str, Any],
        eq_func: Callable
    ) -> dict[str, list[Any]]:
        """
        Appends new data to delta-encoded data by directly modifying it

        :param data: The existing delta-encoded data
        :type data: dict[str, list[Any]]
        :param new_data: New data intended to be appended
        :type new_data: dict[str, Any]
        :param eq_func: 
        A function that determines whether new data should be appended
        :type eq_func: Callable

        :return: Modified version of data
        :rtype: dict[str, list[Any]]
        """
        
        for key in new_data:
            if key not in data:
                data[key] = []

            if len(data[key]) == 0:
                # No comparison if is empty
                data[key].append(new_data[key])
            else:
                prev_value = data[key][-1]
                if not eq_func(prev_value, new_data[key]):
                    # Different value => has changed
                    data[key].append(new_data[key])

        return data



async def main() -> None:
    DATA_FILENAME = "data.json"

    data = read_file(DATA_FILENAME)
    prev_player_data = data["player data"]

    server_comm = ServerComm()
    player_data = await server_comm.get_player_data()

    new_player_data = DeltaEncoder.append(
        prev_player_data, 
        player_data,
        lambda x, y: tuple(x)[1:] == tuple(y)[1:]
    )

    write_file(DATA_FILENAME, data)


if __name__ == "__main__":
    asyncio.run(main())