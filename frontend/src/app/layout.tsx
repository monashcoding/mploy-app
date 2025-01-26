import NavBar from "@/components/layout/nav-bar";
import "./globals.css";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { ColorSchemeScript } from "@mantine/core";
import { PropsWithChildren } from "react";
import Head from "next/head";
import { theme } from "@/lib/theme";

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" data-theme="dark">
      <Head>
        <ColorSchemeScript defaultColorScheme="dark" />
      </Head>
      <body className="text-text dark bg-background">
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
