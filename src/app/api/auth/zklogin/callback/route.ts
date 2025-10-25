import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code, provider } = await request.json();

    if (!code || !provider) {
      return NextResponse.json(
        { error: 'Missing code or provider' },
        { status: 400 }
      );
    }

    // Exchange authorization code for JWT token
    let tokenResponse;
    let userInfoResponse;

    switch (provider) {
      case 'google':
        // Exchange code for access token
        tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            code,
            grant_type: 'authorization_code',
            redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI!,
          }),
        });

        if (!tokenResponse.ok) {
          throw new Error('Failed to exchange code for token');
        }

        const tokenData = await tokenResponse.json();
        
        // Get user info
        userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        });
        break;

      case 'facebook':
        // Exchange code for access token
        tokenResponse = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID!,
            client_secret: process.env.FACEBOOK_CLIENT_SECRET!,
            code,
            redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI!,
          }),
        });

        if (!tokenResponse.ok) {
          throw new Error('Failed to exchange code for token');
        }

        const fbTokenData = await tokenResponse.json();
        
        // Get user info
        userInfoResponse = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${fbTokenData.access_token}`);
        break;

      case 'twitch':
        // Exchange code for access token
        tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
            client_secret: process.env.TWITCH_CLIENT_SECRET!,
            code,
            grant_type: 'authorization_code',
            redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI!,
          }),
        });

        if (!tokenResponse.ok) {
          throw new Error('Failed to exchange code for token');
        }

        const twitchTokenData = await tokenResponse.json();
        
        // Get user info
        userInfoResponse = await fetch('https://api.twitch.tv/helix/users', {
          headers: {
            Authorization: `Bearer ${twitchTokenData.access_token}`,
            'Client-Id': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
          },
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Unsupported provider' },
          { status: 400 }
        );
    }

    if (!userInfoResponse?.ok) {
      throw new Error('Failed to get user info');
    }

    const userInfo = await userInfoResponse.json();
    
    // Normalize user info across providers
    let normalizedUserInfo;
    switch (provider) {
      case 'google':
        normalizedUserInfo = {
          sub: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          provider: 'google',
        };
        break;
      case 'facebook':
        normalizedUserInfo = {
          sub: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture?.data?.url,
          provider: 'facebook',
        };
        break;
      case 'twitch':
        const twitchUser = userInfo.data[0];
        normalizedUserInfo = {
          sub: twitchUser.id,
          email: twitchUser.email,
          name: twitchUser.display_name,
          picture: twitchUser.profile_image_url,
          provider: 'twitch',
        };
        break;
    }

    return NextResponse.json({
      jwt: tokenData?.id_token || 'mock_jwt_for_development', // In production, use actual JWT
      userInfo: normalizedUserInfo,
    });

  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Authentication failed' },
      { status: 500 }
    );
  }
}