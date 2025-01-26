import { createTheme, colorsTuple } from "@mantine/core";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "@/../tailwind.config";
const twConfig = resolveConfig(tailwindConfig);

const theme = createTheme({
  colors: {
    primary: colorsTuple(twConfig.theme.colors.primary),
    text: colorsTuple(twConfig.theme.colors.text),
    background: colorsTuple(twConfig.theme.colors.background),
    secondary: colorsTuple(twConfig.theme.colors.secondary),
    accent: colorsTuple(twConfig.theme.colors.accent),
    dark: [
      "#c9c9c9",
      "#b8b8b8",
      "#828282",
      "#696969",
      "#424242",
      "#3a3a3a",
      "#2e2e2e",
      "#242424",
      "#1f1f1f",
      "#141414",
    ],
  },
});
theme.primaryColor = "secondary";
export { theme };
