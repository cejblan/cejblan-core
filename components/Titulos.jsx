export default function Titulos({texto}) {
  return (
    <div className="max-[420px]:text-2xl text-3xl text-white font-bold text-center py-4 mx-auto flex justify-center items-center">
      <h1 className="bg-slate-700 py-1 px-2 rounded-xl">{texto}</h1>
    </div>
  )
}