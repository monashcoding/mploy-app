"use client";

import {
  Text,
  Badge,
  Button,
  Card,
  Image,
  Divider,
  ScrollArea,
} from "@mantine/core";
import { IconMapPin, IconPencil, IconFolderOpen } from "@tabler/icons-react";
import DOMPurify from "isomorphic-dompurify";
import { useFilterContext } from "@/context/filter/filter-context";
import { formatCapString } from "@/lib/utils";
import Link from "next/link";

function formatISODate(isoDate: string): string {
  const date = new Date(isoDate);

  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

function sanitizeHtml(html: string) {
  return DOMPurify.sanitize(html);
}

export default function JobDetails() {
  const { selectedJob, isLoading } = useFilterContext();
  if (!selectedJob || isLoading) {
    return (
      <div className="hidden lg:block">
        <div className="h-[calc(100vh-330px)] bg-secondary rounded-xl animate-pulse" />
      </div>
    );
  }

  const handleApplyClick = () => {
    window.open(selectedJob.application_url, "_blank"); // Open link in a new tab
  };

  return (
    <Card bd="2px solid selected" className="h-full rounded-xl">
      <ScrollArea type="hover">
        <div className={"flex justify-between w-full pr-4"}>
          <div className={"flex flex-col space-y-1"}>
            <span className={"text-2xl font-bold"}>{selectedJob.title}</span>
            <Link href={selectedJob.company.website + ""} target="_blank">
              <span className={"underline"}>{selectedJob.company.name}</span>
            </Link>

            <div
              className={"flex items-center space-y-1 space-x-2 flex-wrap pr-8"}
            >
              <IconMapPin size={20} stroke={1.5} />
              {selectedJob.locations?.map((location) => (
                <Badge
                  key={location}
                  fw={300}
                  tt={"none"}
                  color="dark.4"
                  size="lg"
                  radius="lg"
                >
                  {formatCapString(location)}
                </Badge>
              ))}
              <Divider size={2} color="accent" orientation="vertical" />
              <Text size="sm">
                Posted {formatISODate(selectedJob.created_at)}
              </Text>
              <Divider size={2} color="accent" orientation="vertical" />
              <Text size="sm">
                {selectedJob.type && formatCapString(selectedJob.type)} Role
              </Text>
            </div>
          </div>
          <Image
            alt={selectedJob.company.name}
            src={selectedJob.company.logo}
            className={"h-20 w-20 object-contain rounded-md bg-white"}
          />
        </div>

        <div className={"flex flex-col space-y-1 mt-8"}>
          <div className={"flex items-center mb-2"}>
            <IconPencil size={16} stroke={1.5} />
            <span className={"underline-fancy text-lg pl-2"}>
              Job Description
            </span>
          </div>
          <div
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(selectedJob.description || ""),
            }}
            className={"text-sm"}
          />
        </div>

        <div className={"flex flex-col space-y-1 mt-2"}>
          <div className={"flex items-center mb-2"}>
            <IconPencil size={16} stroke={1.5} />
            <span className={"underline-fancy text-lg pl-2 "}>
              Working Rights
            </span>
          </div>
          <div className={"space-x-2"}>
            {selectedJob.working_rights?.map((rights) => (
              <Badge
                tt={"none"}
                fw={300}
                key={rights}
                color="dark.4"
                size="lg"
                radius="md"
              >
                {formatCapString(rights)}
              </Badge>
            ))}
          </div>
        </div>
      </ScrollArea>
      <Button
        onClick={handleApplyClick}
        bg={"accent"}
        c={"black"}
        leftSection={<IconFolderOpen />}
        className={"min-h-10 mt-4"}
      >
        Apply Now
      </Button>
    </Card>
  );
}
