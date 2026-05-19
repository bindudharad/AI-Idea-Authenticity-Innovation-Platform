export type AuthTokenResponse = {
  access_token: string;
  token_type: string;
};

export type RegisterUserPayload = {
  full_name: string;
  email: string;
  password: string;
};

export type UserProfile = {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
};
