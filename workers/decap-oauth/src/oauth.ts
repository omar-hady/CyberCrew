/**
 * Minimal GitHub OAuth client (authorization-code flow).
 * Adapted from the official Decap Cloudflare Worker template:
 * https://github.com/sterlingwes/decap-proxy
 */

type OAuthConfig = {
  id: string;
  secret: string;
  target: {
    tokenHost: string;
    tokenPath: string;
    authorizePath: string;
  };
};

export class OAuthClient {
  private clientConfig: OAuthConfig;

  constructor(config: OAuthConfig) {
    this.clientConfig = config;
  }

  authorizeURL(options: { redirect_uri: string; scope: string; state: string }) {
    const { clientConfig } = this;
    const { tokenHost, authorizePath } = clientConfig.target;
    const { redirect_uri, scope, state } = options;
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientConfig.id,
      redirect_uri,
      scope,
      state,
    });
    return `${tokenHost}${authorizePath}?${params.toString()}`;
  }

  async getToken(options: { code: string; redirect_uri: string }): Promise<string> {
    const { clientConfig } = this;
    const { tokenHost, tokenPath } = clientConfig.target;
    const { code, redirect_uri } = options;

    const response = await fetch(`${tokenHost}${tokenPath}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientConfig.id,
        client_secret: clientConfig.secret,
        code,
        redirect_uri,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      throw new Error(`GitHub token exchange failed (${response.status})`);
    }

    const json = (await response.json()) as {
      access_token?: string;
      error?: string;
      error_description?: string;
    };

    if (!json.access_token) {
      throw new Error(json.error_description || json.error || 'Missing access_token');
    }

    return json.access_token;
  }
}
