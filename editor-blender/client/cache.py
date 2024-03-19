import traceback
from copy import deepcopy
from dataclasses import dataclass
from inspect import iscoroutine
from typing import (
    Any,
    Callable,
    Coroutine,
    Dict,
    Generic,
    List,
    Optional,
    Tuple,
    Type,
    TypeVar,
    Union,
)

from dataclass_wizard import JSONWizard
from typeguard import check_type

Cache = Dict[str, Optional[Any]]

T = TypeVar("T")


@dataclass
class FieldPolicy(Generic[T]):
    merge: Callable[[T, T], T]


@dataclass
class TypePolicy(Generic[T]):
    fields: Dict[str, FieldPolicy[T]]


TypePolicies = Dict[str, TypePolicy[Any]]

K = TypeVar("K")
MK = TypeVar("MK")

Modifier = Callable[[K], Union[K, Coroutine[Any, Any, K]]]


@dataclass
class Modifiers(Generic[MK]):
    fields: Dict[str, Modifier[MK]]


FieldTable = Tuple[str, Optional[List[str]]]


def query_defs_to_field_table(query_defs: Dict[str, Any]) -> FieldTable:
    definition = query_defs["definitions"][0]

    query_def = definition["selection_set"]["selections"][0]
    query_name = query_def["name"]["value"]

    if query_def["selection_set"] is None:
        return query_name, None

    query_field_defs = query_def["selection_set"]["selections"]
    query_field_names = [
        query_field_def["name"]["value"] for query_field_def in query_field_defs
    ]

    field_table: FieldTable = (query_name, query_field_names)

    return field_table


def is_cache_missing(cache: Cache, field_table: FieldTable) -> bool:
    query_name, query_field_names = field_table

    cache_data = cache.get(query_name)
    if cache_data is None:
        return True

    if query_field_names is not None:
        for query_field_name in query_field_names:
            if not isinstance(cache_data, JSONWizard):
                raise Exception("Cache structure not match query")
            if query_field_name not in cache_data.__dict__.keys():
                return True

    return False


# TODO: support scalar type
# TODO: add max-age
class InMemoryCache:
    def __init__(self, policies: TypePolicies = {}):
        self.cache: Cache = {}
        self.policies: TypePolicies = policies

    async def modify(self, modifiers: Modifiers[Optional[Any]]) -> None:
        fields = modifiers.fields

        for field_name, modifier in fields.items():
            cache_data = self.cache.get(field_name)
            modified_cache_data = modifier(cache_data)

            if modified_cache_data is not None:
                if iscoroutine(modified_cache_data):
                    self.cache[field_name] = await modified_cache_data
                else:
                    self.cache[field_name] = modified_cache_data

    async def read_query(
        self, response_type: Type[T], query_def: FieldTable
    ) -> Optional[Dict[str, T]]:
        query_name, query_field_names = query_def

        cache_data = self.cache.get(query_name)
        try:
            check_type(cache_data, response_type)
        except:
            traceback.print_exc()
            return None

        response: Dict[str, response_type] = {}

        if query_field_names is not None:
            if not isinstance(cache_data, JSONWizard):
                raise Exception("Cache structure not match query")

            for query_field_name in query_field_names:
                if query_field_name not in cache_data.__dict__.keys():
                    return None

        response[query_name] = deepcopy(cache_data)  # type: ignore

        return response

    async def write_query(self, data: Dict[str, Any]) -> None:
        query_name, response = list(data.items())[0]
        response_type = type(response)

        cache_data = self.cache.get(query_name)
        if cache_data is not None and not isinstance(cache_data, response_type):
            raise Exception("Cache structure not match query")

        if isinstance(response, JSONWizard):
            new_cache_data_dict: Dict[str, Any] = {}
            for key in response_type.__dataclass_fields__.keys():  # type: ignore
                new_cache_data_dict[key] = None  # type: ignore
            new_cache_data = response_type(**new_cache_data_dict)

            if cache_data is None:
                cache_data = response_type(**new_cache_data_dict)

            policy = self.policies.get(query_name)

            for field_name in response.__dict__.keys():
                if policy is not None:
                    policy_field = policy.fields.get(field_name)
                    if policy_field is not None:
                        merge_result = policy_field.merge(
                            getattr(cache_data, field_name),
                            deepcopy(getattr(response, field_name)),
                        )
                        if hasattr(merge_result, "__await__"):
                            merge_result = await merge_result
                        setattr(new_cache_data, field_name, merge_result)
                    else:
                        setattr(
                            new_cache_data,
                            field_name,
                            deepcopy(getattr(response, field_name)),
                        )
                else:
                    setattr(
                        new_cache_data,
                        field_name,
                        deepcopy(getattr(response, field_name)),
                    )

            self.cache[query_name] = new_cache_data
        else:
            self.cache[query_name] = response
