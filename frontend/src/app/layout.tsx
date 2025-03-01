// Order seems to matter. If Mantine is imported after tailwind,
// the tailwind class passed with className is not applied.
import "@mantine/core/styles.css";
import "./globals.css";

import NavBar from "@/components/layout/nav-bar";
import { MantineProvider } from "@mantine/core";
import { ColorSchemeScript } from "@mantine/core";
import { PropsWithChildren, Suspense } from "react";
import Head from "next/head";
import { theme } from "@/lib/theme";

import { Poppins } from "next/font/google";
import { FilterProvider } from "@/context/filter/filter-provider";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | MAC Jobs Board",
    default: "MAC Jobs Board",
  },
  description: "This is MACs Official Jobs Dashboard.",
};

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" data-mantine-color-scheme="dark">
      <Head>
        <ColorSchemeScript defaultColorScheme="dark" />
      </Head>
      <body className={`${poppins.className}`}>
        <Suspense>
          <MantineProvider theme={theme} defaultColorScheme="dark">
            <FilterProvider>
              <div className="min-h-screen flex flex-col px-6">
                <NavBar />
                <main className="">{children}</main>
              </div>
            </FilterProvider>
          </MantineProvider>
        </Suspense>
      </body>
    </html>
  );
}
