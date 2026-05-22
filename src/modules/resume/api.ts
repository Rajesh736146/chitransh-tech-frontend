import api from "@/lib/axios";
import type { BuildResumeRequest, BuildResumeResponse } from "./types";

export const resumeApi = {
  buildResume: (data: BuildResumeRequest) =>
    api.post<BuildResumeResponse>("/resume/build", data).then((r) => r.data),
};
