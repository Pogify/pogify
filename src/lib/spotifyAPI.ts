import PKCE from "js-pkce";
import { writable } from "svelte/store";
import axios from "axios";
import { browser } from "$app/env";

let spotifyPKCE: PKCE | null = null;
// gotta do this because SSR
if (browser) {
  spotifyPKCE = new PKCE({
    client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
    redirect_uri: `${window.location.origin}/auth/spotify`,
    authorization_endpoint: import.meta.env.VITE_SPOTIFY_AUTH_URI,
    token_endpoint: import.meta.env.VITE_SPOTIFY_TOKEN_URI,
    requested_scopes: "streaming user-read-email user-read-private user-modify-playback-state",
  });
}

export const spotifyAccessToken = writable<string | null>(null);

const refreshTokenKey = "spotify:refreshToken";
const getRefreshToken = () => window.localStorage.getItem(refreshTokenKey);
const setRefreshToken = (token: string) => window.localStorage.setItem(refreshTokenKey, token);

export const initialize = async (): Promise<void> => {
  if (getRefreshToken()) await refreshToken();
};

export const redirectToAuth = (): void => {
  window.location.replace(spotifyPKCE.authorizeUrl());
};

export const tradeTokenForCode = async (): Promise<void> => {
  const res = await spotifyPKCE.exchangeForAccessToken(window.location.href);

  spotifyAccessToken.set(res.access_token);
  setRefreshToken(res.refresh_token);
};

export const refreshToken = async (): Promise<void> => {
  const formData = new URLSearchParams();

  formData.append("grant_type", "refresh_token");
  formData.append("refresh_token", getRefreshToken());
  formData.append("client_id", import.meta.env.VITE_SPOTIFY_CLIENT_ID as string);

  const { data } = await axios.post(import.meta.env.VITE_SPOTIFY_TOKEN_URI as string, formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  spotifyAccessToken.set(data.access_token);

  setRefreshToken(data.refresh_token);
};
