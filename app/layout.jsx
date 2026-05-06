import "./globals.css";

export const metadata = {
  title: "CDMP Prep Hub",
  description: "Interactive practice for DAMA CDMP exam concepts."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
