import { createFileRoute } from "@tanstack/react-router";
import { CircusPage } from "@/components/circus/circus-page";

export const Route = createFileRoute("/")({ component: CircusPage });
