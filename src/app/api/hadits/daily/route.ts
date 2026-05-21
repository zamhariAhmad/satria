import {
  asJsonOrError,
  networkErrorResponse,
  sanusiFetch,
} from "@/lib/sanusi";

export const revalidate = 3600;

export async function GET() {
  try {
    const res = await sanusiFetch("hadits/daily", {
      next: { revalidate: 3600 },
    });
    return await asJsonOrError(res, "Hadits harian");
  } catch (err) {
    return networkErrorResponse(err);
  }
}
