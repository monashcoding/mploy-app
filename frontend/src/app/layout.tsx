import NavBar from "@/components/layout/nav-bar";
import "./globals.css";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { ColorSchemeScript } from "@mantine/core";
import {theme} from "@/lib/constants/theme";
import { PropsWithChildren } from 'react';

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
        <title>MPLOY</title>
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="dark">
          <div className="min-h-screen flex flex-col">
            <NavBar />
            <main className="flex-grow">{children}</main>
          </div>
        </MantineProvider>
      </body>
    </html>
  );
}
