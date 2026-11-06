// Типы данных, которые приходят от backend (совпадают со схемами в backend/app/modules/*/schemas.py)

export type Role = "student" | "company" | "moderator" | "admin";

export type OrganizationStatus = "pending" | "approved" | "rejected";

export type User = {
  id: string;
  email: string;
  role: Role;
  fullName: string;
  organization: {
    id: string;
    name: string;
    status: OrganizationStatus;
    moderatorComment: string;
  } | null;
};

export type TokenResponse = {
  accessToken: string;
  tokenType: string;
  user: User;
};

export type RequestStatus = "draft" | "pending" | "published" | "returned" | "rejected" | "closed";

// Поля заявки, которые заполняет компания
export type RequestInput = {
  title: string;
  description: string;
  practiceType: string;
  directions: string[];
  courses: number[];
  places: number;
  dateFrom: string | null; // ГГГГ-ММ-ДД
  dateTo: string | null;
  deadline: string | null;
  format: string;
  city: string;
  address: string;
  paid: boolean;
  tasks: string[];
  requiredSkills: string[];
  desiredSkills: string[];
  mentor: string;
};

export type PracticeRequest = RequestInput & {
  id: string;
  status: RequestStatus;
  moderatorComment: string;
  organization: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
};

export type ModerationOrganization = {
  id: string;
  name: string;
  inn: string;
  website: string;
  contactPhone: string;
  status: OrganizationStatus;
  moderatorComment: string;
  owner: { fullName: string; email: string };
  createdAt: string;
};

export type ModerationSummary = {
  organizationsPending: number;
  requestsPending: number;
  requestsPublished: number;
};

export type Dictionaries = {
  directions: { code: string; name: string }[];
  skills: { name: string; category: string }[];
};

export const ROLE_LABELS: Record<Role, string> = {
  student: "Студент",
  company: "Компания",
  moderator: "Модератор вуза",
  admin: "Администратор",
};

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  draft: "Черновик",
  pending: "На модерации",
  published: "Опубликована",
  returned: "На доработке",
  rejected: "Отклонена",
  closed: "Набор закрыт",
};

export const ORG_STATUS_LABELS: Record<OrganizationStatus, string> = {
  pending: "Ждёт проверки вузом",
  approved: "Проверена вузом",
  rejected: "Отклонена вузом",
};
