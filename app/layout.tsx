export const metadata = {
  title: "Test Jotform iframe",
  description: "Test iframe Vercel pour Jotform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}