export const checkControlJson = (file) => {
  let valid = false;
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = JSON.parse(e.target.result);
    if (Array.isArray(data) && data.length !== 0) valid = true;

    if (valid)
      data.forEach((Data) => {
        if (!("start" in Data)) valid = false;
        if (!("fade" in Data)) valid = false;
        if (!("status" in Data)) valid = false;
      });
    if (!valid) alert("Wrong JSON format");
    else if (window.confirm(`Control check passed! Are you sure to upload ?`)) {
      console.log("confirmed");
    }
  };
  reader.readAsText(file[0]);
};

export const checkPosJson = (file) => {
  let valid = false;
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = JSON.parse(e.target.result);
    if (Array.isArray(data) && data.length !== 0) valid = true;

    if (valid)
      data.forEach((Data) => {
        try {
          if (!("start" in Data)) valid = false;
          if (!("pos" in Data)) valid = false;

          const dancerKeys = Object.keys(Data.pos);
          dancerKeys.forEach((key) => {
            if (
              !(
                "x" in Data.pos[key] &&
                "y" in Data.pos[key] &&
                "z" in Data.pos[key]
              )
            )
              valid = false;
          });
        } catch (error) {
          valid = false;
        }
      });
    if (!valid) alert("Wrong JSON format");
    else if (
      window.confirm(`Posistion check passed! Are you sure to upload ?`)
    ) {
      console.log("confirmed");
    }
  };
  reader.readAsText(file[0]);
};

export const checkImages = () => {
  if (window.confirm(`Are you sure to upload images?`)) {
    console.log("confirmed");
  }
};
