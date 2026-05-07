import type { Metadata } from "next";
import { Providers } from "./providers";
import "./styles.css";

export const metadata: Metadata = {
  title: "House of Joshi NFT Console",
  description: "Royal member portal for the House of Joshi NFT contract."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
