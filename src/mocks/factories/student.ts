import { faker } from "@faker-js/faker";
import type { Student } from "@/features/student/schemas/student";

faker.seed(1234);

const CLASS_NAMES = [
  "Aliyah 1A",
  "Aliyah 1B",
  "Aliyah 2A",
  "Aliyah 2B",
  "Tsanawiyah 1",
  "Tsanawiyah 2",
];

export function makeStudent(waliId: string, idx: number): Student {
  const name = faker.person.fullName({ sex: faker.helpers.arrayElement(["male", "female"]) });
  return {
    id: `stu-${idx.toString().padStart(4, "0")}`,
    nis: faker.string.numeric(8),
    name,
    className: faker.helpers.arrayElement(CLASS_NAMES),
    waliId,
  };
}

export function makeStudents(count: number, waliId = "user-wali-1"): Student[] {
  return Array.from({ length: count }, (_, i) => makeStudent(waliId, i + 1));
}
