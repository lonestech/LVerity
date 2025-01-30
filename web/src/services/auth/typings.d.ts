declare namespace API {
  type CurrentUser = {
    id: string;
    username: string;
    role: string;
  };

  type LoginResult = {
    success?: boolean;
    error_message?: string;
    data?: {
      token: string;
      user: {
        id: string;
        username: string;
        role: string;
      };
    };
  };

  type PageParams = {
    current?: number;
    pageSize?: number;
  };

  type LoginParams = {
    username: string;
    password: string;
    captcha: string;
    captcha_id: string;
    autoLogin?: boolean;
  };
}
