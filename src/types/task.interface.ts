export interface ITask {
  title: string;
  description: string;
  category: string;

  clientName?: string;
  clientEmail?: string;
  clientImage?: string;
  companyName?: string;
  address?: string;

  client: any;
  collaborator?: any;

  status:
    | "pending"
    | "assigned"
    | "accepted"
    | "rejected"
    | "completed"
    | "delivered";

  attachments: string[];

  submissionUrl?: string;
  feedback?: string;
}
