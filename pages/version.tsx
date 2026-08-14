import type { NextPage } from "next";
import Head from "next/head";

import packageJson from "../package.json";

interface VersionRow {
  label: string;
  value: string;
}

const VersionPage: NextPage = () => {
  const rows: VersionRow[] = [
    { label: "Version", value: packageJson.version },
    { label: "Next.js", value: packageJson.dependencies.next },
    { label: "React", value: packageJson.dependencies.react },
  ];

  return (
    <>
      <Head>
        <title>Version | Cineby</title>
      </Head>

      <div className="mx-auto max-w-md px-4 pb-16 pt-28 md:pt-36">
        <h1 className="heading-trail mb-6 text-xl font-semibold text-text-hi md:text-2xl">
          Version
        </h1>
        <div className="overflow-hidden rounded-[14px] border border-white/[0.06] bg-white/[0.02]">
          {rows.map((row, index) => (
            <div
              key={row.label}
              className={`flex items-center justify-between px-4 py-3 ${
                index > 0 ? "border-t border-white/[0.06]" : ""
              }`}
            >
              <span className="text-sm text-text-mid">{row.label}</span>
              <span className="text-sm font-medium text-text-hi">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default VersionPage;
