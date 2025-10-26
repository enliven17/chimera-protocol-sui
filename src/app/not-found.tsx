import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <h1 className="text-4xl font-bold mb-2">404: Not Found</h1>
        <p className="text-gray-400 mb-6">
          The page you are looking for doesnt exist. It may have been moved
          or removed.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-lg bg-[#4DA6FF] text-white hover:bg-[#3B82F6]"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}


