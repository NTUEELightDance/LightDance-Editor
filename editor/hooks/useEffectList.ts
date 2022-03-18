import { useQuery } from "@apollo/client";

// gql
import { GET_EFFECT_LIST } from "../graphql";

export default function useEffectList() {
    // query controlMap
    const { loading: effectListLoading, error: effectListError, data: effectListData } = useQuery(GET_EFFECT_LIST);
    const effectList = effectListData?.effectList;

    return {
        loading: effectListLoading,
        error: effectListError,
        effectList,
    };
}
