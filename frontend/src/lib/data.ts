export type Employee = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
  joinedDate: string;
};

export const MOCK_EMPLOYEES: Employee[] = [
  { id: "EMP-001", name: "Sarah Connor", email: "sarah.connor@workmate.com", role: "Software Engineer", status: "Active", joinedDate: "2024-01-15" },
  { id: "EMP-002", name: "John Smith", email: "john.smith@workmate.com", role: "Product Manager", status: "Active", joinedDate: "2023-11-01" },
  { id: "EMP-003", name: "Emily Chen", email: "emily.chen@workmate.com", role: "UX Designer", status: "Active", joinedDate: "2024-02-20" },
  { id: "EMP-004", name: "Michael Chang", email: "michael.c@workmate.com", role: "Backend Developer", status: "Inactive", joinedDate: "2022-06-10" },
  { id: "EMP-005", name: "Jessica Alba", email: "jessica.alba@workmate.com", role: "HR Manager", status: "Active", joinedDate: "2021-09-05" },
  { id: "EMP-006", name: "David Kim", email: "david.kim@workmate.com", role: "QA Engineer", status: "Active", joinedDate: "2024-03-12" },
  { id: "EMP-007", name: "Paul Atreides", email: "paul.a@workmate.com", role: "Data Scientist", status: "Inactive", joinedDate: "2023-08-22" },
  { id: "EMP-008", name: "Laura Palmer", email: "laura.p@workmate.com", role: "DevOps Engineer", status: "Active", joinedDate: "2023-12-01" },
  { id: "EMP-009", name: "Robert Baratheon", email: "robert.b@workmate.com", role: "Scrum Master", status: "Inactive", joinedDate: "2022-01-14" },
  { id: "EMP-010", name: "Arya Stark", email: "arya.stark@workmate.com", role: "Security Analyst", status: "Active", joinedDate: "2024-05-18" },
  { id: "EMP-011", name: "Tony Stark", email: "tony.stark@workmate.com", role: "Systems Architect", status: "Active", joinedDate: "2021-03-22" },
  { id: "EMP-012", name: "Bruce Wayne", email: "bruce.wayne@workmate.com", role: "Finance Director", status: "Inactive", joinedDate: "2020-11-15" },
];
