export interface UserHistory {
  id: string;
  userId: string;
  description: string;
  item: string;
  cost: number;
  pinned: boolean;
  createdAt: string;
}

export interface UserHistoryResponse {
  success: boolean;
  userHistories: UserHistory[];
  message: string;
}

export interface CreateUserHistoryRequest {
  description: string;
  item: string;
  cost?: number;
  pinned?: boolean;
}
