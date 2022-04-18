import {
  MsalProviderPopupConfig,
  MsalProviderRedirectConfig,
} from '../components/shared/msal-react-lite';
import * as msal from '@azure/msal-browser';
import {
  ConfigType,
  MsalProviderConfigMap,
} from '../components/shared/msal-react-lite/msal-provider';


// confirmed Azure AD B2C > Identity Experience Framework > [App Registration] > Application (client) ID
const admin_clientId = process.env.REACT_APP_AAD_APP_ADMIN_CLIENTID ?? 'missing-client-id';
const account_clientId = process.env.REACT_APP_AAD_ACCOUNT_CLIENTID ?? 'missing-client-id';

// B2C -> https://${tenantId}.b2clogin.com/${tenantId}.onmicrosoft.com/${customPolicyName}
const admin_authority =process.env.REACT_APP_ADMIN_AUTHORITY ?? 'missing-redirect-authority';
const account_authority = process.env.REACT_APP_AAD_ACCOUNT_AUTHORITY ?? 'missing-passwordless-authority';

// "openid" is the default scope for B2C
const admin_scopes = process.env.REACT_APP_AAD_ADMIN_SCOPES?.split('|') ?? ['missing-scopes'];
const account_scopes = process.env.REACT_APP_AAD_ACCOUNT_SCOPES?.split('|') ?? ['missing-scopes'];

// B2C -> https://${tenantId}.b2clogin.com/${tenantId}.onmicrosoft.com/oauth2/v2.0/authorize?p=${customPolicyName}
const knownAuthorities = process.env.REACT_APP_AAD_KNOWN_AUTHORITIES ?? 'missing-known-authorities';

// the URL of where the user will be redirected to after login
const redirectUri = process.env.REACT_APP_AAD_REDIRECT_URI ?? 'missing-redirect-uri';


//var tenantId =process.env.REACT_APP_AAD_DIRECTORY_TENANTID ?? "missing-tenant-id";


//login.windows-ppe.net
//login.windows.net/

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const commonAuthority = `https://login.microsoftonline.com/common`; //allows for anyone to register not just AAD accounts

// eslint-disable-next-line @typescript-eslint/no-unused-vars
//const tenantAuthority = `https://login.microsoftonline.com/${tenantId}`; // allows ONLY for Other AAD accounts to register
//const tenantAuthority = `https://login.microsoftonline.com/${tenantId}.onmicrosoft.com`; // allows ONLY for Other AAD accounts to register

//"https://login.microsoftonline.com/{tenant name}.onmicrosoft.com"

//const appAuthority = tenantAuthority; //to allow any user to sign up must choose commonAuthority

var loggerOptions = {
  loggerCallback: (level:any, message:any, containsPii:boolean) => {
    if (containsPii) {
      return;
    }
    switch (level) {
      case msal.LogLevel.Error:
        console.error(message);
        return;
      case msal.LogLevel.Info:
        console.info(message);
        return;
      case msal.LogLevel.Verbose:
        console.debug(message);
        return;
      case msal.LogLevel.Warning:
        console.warn(message);
        return;
    }
  },
}

var accountConfig: MsalProviderRedirectConfig = {
  type: ConfigType.Redirect,
  msalConfig: {
    auth: {
      clientId: account_clientId,
      authority: account_authority,
      knownAuthorities: [knownAuthorities],
      redirectUri: redirectUri,      
      navigateToLoginRequestUrl: false, 
    },
    system: {
      loggerOptions: loggerOptions
    },
  },
  silentRequestConfig: {
    scopes: account_scopes,
  },
  endSessionRequestConfig: {},
  redirectRequestConfig: {
    scopes: account_scopes,
  },
};

var adminConfig: MsalProviderPopupConfig = {
  type: ConfigType.Popup,
  msalConfig: {
    auth: {
      clientId: admin_clientId,
      authority: admin_authority,
      knownAuthorities: [knownAuthorities],
      redirectUri: redirectUri,
    },
    system: {
      loggerOptions: loggerOptions
    },
  },
  silentRequestConfig: {
    scopes: admin_scopes,
  },
  endSessionRequestConfig: {},
  loginRequestConfig: {
    scopes: admin_scopes,
  },
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
var adminConfigRedirect: MsalProviderRedirectConfig = {
  type: ConfigType.Redirect,
  msalConfig: {
    auth: {
      clientId: admin_clientId,
      authority: admin_authority,
      redirectUri: redirectUri,
    },
    system: {
      loggerOptions: loggerOptions
    },
  },
  silentRequestConfig: {
    scopes: admin_scopes,
  },
  endSessionRequestConfig: {},
  redirectRequestConfig: {
    scopes: admin_scopes,
  },
};

var msalProviderConfig: MsalProviderConfigMap = {
  type: ConfigType.Map,
  config: new Map<string, MsalProviderPopupConfig | MsalProviderRedirectConfig>(
    [
      ['account', accountConfig],
     // ['admin', adminConfig],
    ]
  ),
}; //when using Facebook Login - cannot use pop-up, login UI doesn't render correctly.

export default msalProviderConfig;
