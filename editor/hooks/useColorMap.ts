import { useQuery, useMutation, useReactiveVar } from "@apollo/client";
// states and actions
import { reactiveState } from "core/state";
import { setColorMap } from "core/actions";

// gql
import { GET_COLOR_MAP, ADD_COLOR, EDIT_COLOR, DELETE_COLOR } from "../graphql";

export default function useColorMap() {
  const colorMap = useReactiveVar(reactiveState.colorMap);
  const {
    data: colorMapData,
    loading: colorLoading,
    error: colorError,
  } = useQuery(GET_COLOR_MAP, {
    onCompleted: (data) => {
      setColorMap({ payload: data.colorMap?.colorMap || {} });
    },
  });

  const [
    addColor,
    { data: addColorData, loading: addColorLoading, error: addColorError },
  ] = useMutation(ADD_COLOR);

  const [
    editColor,
    { data: editColorData, loading: editColorLoading, error: editColorError },
  ] = useMutation(EDIT_COLOR);

  const [
    deleteColor,
    { data: delColorData, loading: delColorLoading, error: delColorError },
  ] = useMutation(DELETE_COLOR);

  const handleAddColor = async (color: string, colorCode: string) => {
    await addColor({
      variables: { color: { color, colorCode } },
      refetchQueries: [GET_COLOR_MAP],
    });
  };
  const handleEditColor = async (
    original_color: string,
    new_color: string,
    colorCode: string
  ) => {
    await editColor({
      variables: { color: { original_color, new_color, colorCode } },
      refetchQueries: [GET_COLOR_MAP],
    });
  };
  const handleDeleteColor = async (color: string) => {
    await deleteColor({
      variables: { color },
      refetchQueries: [GET_COLOR_MAP],
    });
  };
  
  if (addColorError || editColorError || delColorError)
    [addColorError, editColorError, delColorError].forEach(
      (error) => error && console.error(error)
    );

  return {
    loading:
      colorLoading || addColorLoading || editColorLoading || delColorLoading,
    error: colorError || addColorError || editColorError || delColorError,
    colorMap,
    handleAddColor,
    handleEditColor,
    handleDeleteColor,
  };
}
