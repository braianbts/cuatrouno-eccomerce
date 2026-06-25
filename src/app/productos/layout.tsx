import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Productos',
  description: 'Explorá nuestro catálogo completo de suplementos deportivos: proteínas, creatina, pre-workout, vitaminas, quemadores y más. Envíos a todo el país desde Escobar, Buenos Aires.',
  alternates: { canonical: 'https://cuatrouno-eccomerce.vercel.app/productos' },
  openGraph: {
    title: 'Productos | Cuatrouno Suplementos',
    description: 'Catálogo completo de suplementos deportivos. Proteínas, creatina, pre-workout, vitaminas y más.',
    url: 'https://cuatrouno-eccomerce.vercel.app/productos',
  },
}

export default function ProductosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
