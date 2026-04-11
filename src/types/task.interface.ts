export interface ITask {
  title: string;
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

  clientAttachments?: string[]; // Requirements/Initial files from Client
  requirementInfo?: string;

  workAttachments?: string[];   // Completed files from Collaborator
  workInfo?: string;

  submissionText?: string;
  clientFeedback?: string;
  ClientRating?: number;
}
