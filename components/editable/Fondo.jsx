import React from 'react'

export default function Fondo({ children }) {
  return (
    <section className="bg-[url('https://9mtfxauv5xssy4w3.public.blob.vercel-storage.com/fondo01.jpg')] bg-cover bg-center">
      {children}
    </section>
  )
}