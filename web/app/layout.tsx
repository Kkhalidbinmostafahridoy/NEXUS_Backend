import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'NEXUS', description: 'Operational intelligence dashboard' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
