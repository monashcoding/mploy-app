// Order seems to matter. If Mantine is imported after tailwind,
// the tailwind class passed with className is not applied.
import "@mantine/core/styles.css";
import "./globals.css";

import NavBar from "@/components/layout/nav-bar";
import { MantineProvider } from "@mantine/core";
import { ColorSchemeScript } from "@mantine/core";
import { PropsWithChildren } from "react";
import Head from "next/head";
import { theme } from "@/lib/theme";

import { Poppins } from "next/font/google";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "700"] });

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" data-theme="dark">
      <Head>
        <ColorSchemeScript defaultColorScheme="dark" />
      </Head>
      <body className={`${poppins.className}`}>
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
