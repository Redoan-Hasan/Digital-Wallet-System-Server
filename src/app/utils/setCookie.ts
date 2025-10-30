import { Response } from "express";

export interface ISetCookieTokenInfo {
  accessToken?: string;
  refreshToken?: string;
}

export const setCookie = (res: Response, tokenInfo: ISetCookieTokenInfo) => {
  if (tokenInfo.accessToken) {
    res.cookie("accessToken", tokenInfo.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
  }
  if (tokenInfo.refreshToken) {
    res.cookie("refreshToken", tokenInfo.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
  }
};
