
export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-xl text-center">
        <div className="mb-8 text-7xl">
          ❤️
        </div>

        <h1 className="mb-6 text-4xl font-bold md:text-6xl">
          Tengo una pequeña sorpresa para ti...Mi Geraldine
        </h1>

        <p className="mb-6 text-lg text-gray-400">
          Una sorpresa especial está esperando por ti.
        </p>

        <a
          href="/sorpresa"
          className="inline-block rounded-full bg-red-600 px-8 py-4 font-semibold text-white hover:bg-red-700 transition"
        >
          Descubrir sorpresa ❤️
        </a>
      </div>
    </main>
  );
}
