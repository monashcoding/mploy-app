import { createTheme, colorsTuple, Badge } from "@mantine/core";

const theme = createTheme({
  fontFamily: "Poppins",
  colors: {
    background: [
      "#ffffff",
      "#ffffff",
      "#ffffff",
      "#ffffff",
      "#ffffff",
      "#ffffff",
      "#ffffff",
      "#1f1f1f",
      "#1f1f1f",
      "#1f1f1f",
    ],
    secondary: [
      "#ffffff",
      "#ffffff",
      "#ffffff",
      "#ffffff",
      "#ffffff",
      "#ffffff",
      "#ffffff",
      "#2e2e2e",
      "#2e2e2e",
      "#2e2e2e",
    ],
    selected: [
      "#e8e8e8",
      "#e8e8e8",
      "#e8e8e8",
      "#e8e8e8",
      "#e8e8e8",
      "#e8e8e8",
      "#e8e8e8",
      "#3a3a3a",
      "#3a3a3a",
      "#3a3a3a",
    ],
    accent: colorsTuple("#ffe22f"),
  },
  primaryColor: "secondary",
});
export { theme };
