import ConnectWallet from "@/components/ConnectWallet";
import StyledComponentsRegistry from "@/lib/registry";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter, Orbitron } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

export const GeistSansFont = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const GeistMonoFont = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const OrbitronFont = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Memory-ORB",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${inter.variable} ${GeistSansFont.variable} ${GeistMonoFont.variable} ${OrbitronFont.variable} antialiased`}>
        <StyledComponentsRegistry>
          <Providers>
            <ConnectWallet />
            {children}
          </Providers>
        </StyledComponentsRegistry>
      </body>
    </html >
  );
}
