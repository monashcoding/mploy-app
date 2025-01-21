import JobCard from "@/components/jobs/details/job-card";

export default function JobList() {
    return (
        <div className="space-y-4 ">
            {Array(20).fill(0).map((_, i) => (
                <JobCard key={i} />
            ))}
        </div>
    );
}
