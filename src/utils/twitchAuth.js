const TWITCH_PUBLIC_KEY = process.env.REACT_APP_TWITCH_PUBLIC_KEY;

export function goAuth(redirect) {
    window.location.href =
        "https://id.twitch.tv" +
        "/oauth2/authorize?" +
        "response_type=token+id_token&" +
        `client_id=${TWITCH_PUBLIC_KEY}&` +
        `redirect_uri=${redirect}&` +
        "scope=user:read:email+openid";
    // redirect uri must match the one in the Twitch dashboard
}