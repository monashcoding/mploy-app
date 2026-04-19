// frontend/src/components/jobs/job-description.tsx
import { TypographyStylesProvider } from "@mantine/core";
import DOMPurify from "isomorphic-dompurify";
import { IconBook } from "@tabler/icons-react";

interface JobDescriptionProps {
  description: string;
}

export default function JobDescription({ description }: JobDescriptionProps) {
  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-3">
        <IconBook size={16} stroke={1.5} className="text-[#ffe22f]" />
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Job Description
        </span>
      </div>
      <TypographyStylesProvider>
        <div
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(description || ""),
          }}
          className="prose prose-invert leading-relaxed text-sm
            [&_h1]:text-lg [&_h1]:font-semibold [&_h1]:mb-2 [&_h1]:mt-4
            [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mb-2 [&_h2]:mt-4
            [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mb-1.5 [&_h3]:mt-3
            [&_p]:mb-2 [&_ul]:mb-2 [&_ol]:mb-2 [&_li]:mb-0.5"
        />
      </TypographyStylesProvider>
    </div>
  );
}
