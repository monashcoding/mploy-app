// frontend/src/components/jobs/details/sections/job-description.tsx
import SectionHeading from "@/components/ui/section-heading";
import { TypographyStylesProvider } from "@mantine/core";
import DOMPurify from "isomorphic-dompurify";

interface JobDescriptionProps {
  description: string;
}

export default function JobDescription({ description }: JobDescriptionProps) {
  return (
    <div className="flex flex-col space-y-1 mt-8">
      <SectionHeading title="Job Description" />
      <TypographyStylesProvider>
        <div
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(description || ""),
          }}
          className="prose prose-invert leading-relaxed text-xs ml-6 [&_h1]:mb-1 [&_h2]:mb-1 [&_h3]:mb-1"
        />
      </TypographyStylesProvider>
    </div>
  );
}
