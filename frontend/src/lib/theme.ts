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
  },
});
theme.primaryColor = "secondary";
export { theme };
