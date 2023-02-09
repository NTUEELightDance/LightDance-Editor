import { useQuery } from "@apollo/client";

// gql
import { GET_EFFECT_LIST } from "../graphql";
import type { EffectListType } from "@/core/models";

export default function useEffectList() {
  // query controlMap
  const {
    loading: effectListLoading,
    error: effectListError,
    data: effectListData,
  } = useQuery(GET_EFFECT_LIST);
  const effectList: EffectListType = effectListData?.effectList ?? [];

  return {
    loading: effectListLoading,
    error: effectListError,
    effectList,
  };
}
