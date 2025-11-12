import Link from "next/link";

export const Navigation = () => {
  return (
    <header className="border-b py-5">
      <div className="text-center">
        <Link href="/" className="font-bold text-xl cursor-pointer">
          Hackathon
        </Link>
      </div>
    </header>
  );
};
