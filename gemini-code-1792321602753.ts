import './globals.css';

export const metadata = {
  title: 'BALANCEA - Smart Accounting Hub',
  description: 'Portal Akuntansi SMK AKL',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}