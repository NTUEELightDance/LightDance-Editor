// mui
import Fab from "@mui/material/Fab";
import DvrIcon from "@mui/icons-material/Dvr";
import EditIcon from "@mui/icons-material/Edit";

import useRoute from "@/hooks/useRoute";

export default function PageSelector() {
  const { page, navigate } = useRoute();
  return (
    <Fab
      variant="extended"
      color="primary"
      size="medium"
      onClick={() => {
        if (page === "EDITOR") {
          navigate.toCommandCenter();
        } else if (page === "COMMAND_CENTER") {
          navigate.toEditor();
        } else {
          navigate.toLogin();
        }
        window.location.reload();
      }}
    >
      {page == "EDITOR" ? (
        <>
          <DvrIcon sx={{ mr: 1 }} /> command
        </>
      ) : (
        <>
          <EditIcon sx={{ mr: 1 }} /> editor
        </>
      )}
    </Fab>
  );
}
