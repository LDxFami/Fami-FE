import jwtDefaultConfig from "./jwtDefaultConfig";
import instance from "../../../configs/api";
import { getStorage } from "../../../utility/storage";
export default class JwtService {
  // ** jwtConfig <= Will be used by this service
  jwtConfig = { ...jwtDefaultConfig };

  // ** Prevents several failing requests from triggering several redirects
  isRedirectingToLogin = false;

  // ** For Refreshing Token
  subscribers = [];

  constructor(jwtOverrideConfig) {
    this.jwtConfig = { ...this.jwtConfig, ...jwtOverrideConfig };
    // ** Request Interceptor
    instance.interceptors.request.use(
      (config) => {
        // ** Get token from localStorage
        const accessToken =getStorage("accessToken");

        // ** If token is present add it to request's Authorization Header
        if (accessToken) {
          // ** eslint-disable-next-line no-param-reassign
          config.headers.Authorization = `${this.jwtConfig.tokenType} ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // ** Add request/response interceptor
    // The API has no refresh tokens: a 401 means the session was ended
    // (logged out elsewhere, force-logged out by an admin, user deleted or
    // password reset). Clear the local session and send the user to login.
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        const { config, response } = error;
        const isLoginRequest = config?.url?.includes(this.jwtConfig.loginEndpoint);

        if (response && response.status === 401 && !isLoginRequest) {
          this.handleSessionExpired();
        }

        return Promise.reject(error);
      }
    );
  }

  handleSessionExpired() {
    if (this.isRedirectingToLogin) return;
    this.isRedirectingToLogin = true;

    localStorage.removeItem("userData");
    localStorage.removeItem(this.jwtConfig.storageTokenKeyName);
    localStorage.removeItem(this.jwtConfig.storageRefreshTokenKeyName);

    const basename = (process.env.REACT_APP_BASENAME || "").replace(/\/$/, "");
    const loginPath = `${basename}/login`;

    // Full reload so every piece of in-memory state (Redux, caches) is dropped.
    if (window.location.pathname !== loginPath) {
      window.location.replace(loginPath);
    } else {
      this.isRedirectingToLogin = false;
    }
  }

  onAccessTokenFetched(accessToken) {
    this.subscribers = this.subscribers.filter((callback) =>
      callback(accessToken)
    );
  }

  addSubscriber(callback) {
    this.subscribers.push(callback);
  }

  getToken() {
    return localStorage.getItem(this.jwtConfig.storageTokenKeyName);
  }

  getRefreshToken() {
    return localStorage.getItem(this.jwtConfig.storageRefreshTokenKeyName);
  }

  setToken(value) {
    localStorage.setItem(this.jwtConfig.storageTokenKeyName, value);
  }

  setRefreshToken(value) {
    localStorage.setItem(this.jwtConfig.storageRefreshTokenKeyName, value);
  }

  login(...args) {
    return instance.post(this.jwtConfig.loginEndpoint, ...args);
  }

  register(...args) {
    return instance.post(this.jwtConfig.registerEndpoint, ...args);
  }

  refreshToken() {
    return instance.post(this.jwtConfig.refreshEndpoint, {
      refreshToken: this.getRefreshToken(),
      });
  }
}
