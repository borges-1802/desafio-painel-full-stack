import Link from "next/dist/client/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center flex-col p-4">
      <h1 className="text-2xl font-bold">
        Painel de Vulnerabilidade Social
      </h1>
      <h3 className="text-lg text-gray-500 mt-2">
        Iniciando o front-end...
      </h3>
      <Link
        href="/login"
        className="mt-2 px-6 py-2.5 rounded-lg bg-[#13335a] text-white text-sm font-medium hover:bg-[#2a688f] transition-colors"
      >
        Acessar o painel
      </Link>

    </main>
  );
}
