// src/components/jobs/sponsor-section.tsx
"use client";

import { Job } from "@/types/job";

interface SponsorSectionProps {
  sponsoredJobs: Job[];
}

export default function SponsorSection({ sponsoredJobs }: SponsorSectionProps) {
  console.log("Sponsored jobs: ", sponsoredJobs)
  if (sponsoredJobs.length === 0) return null;

  return (
    <section className="bg-gray-100 py-6">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-xl font-bold text-center mb-4">
          Sponsored Jobs
        </h2>
        <div className="flex flex-wrap justify-center items-center gap-4">
          {sponsoredJobs.map((job) => (
            <a
              key={job.id}
              href={job.company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center"
            >
              <img
                src={job.company.logo}
                alt={job.company.name}
                className="h-12 object-contain mb-2"
              />
              <span className="text-sm">{job.company.name}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
