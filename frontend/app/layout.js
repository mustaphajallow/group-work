import "./globals.css";

export const metadata = {
  title: "Rainfall Analysis",
  description: "Next.js frontend for rainfall analysis"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
