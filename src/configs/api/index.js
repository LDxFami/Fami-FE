
import axios from "axios";
import moment from "moment-timezone";

import settings from '../setting';

import { getStorage } from "@src/utility/storage";
const { BASE_URL } = settings;

const apiUrl = "https://fami-be.herokuapp.com";

// const apiUrl = BASE_URL;

export const setHeader = (isAuthenticated, contentType) => {
  const headers = {
    "Content-Type": contentType || "application/json; charset=utf-8",
    "X-Timezone-Offset": moment.tz.guess(),
    Authorization: "Bearer ",
  };
  if (isAuthenticated) {
    const token = getStorage("accessToken");
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const instance = axios.create({
  baseURL: apiUrl,
  headers: setHeader(true),
});

export default instance;
