from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2AuthorizationCodeBearer
from typing import Dict
import jwt
from jwt import PyJWTError
import requests

app = FastAPI()

# Modify CORS to be more specific in production
origins = ["http://localhost:3000"]  # Be specific about allowed origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],  # Be specific about allowed methods
    allow_headers=["*"],
)

KEYCLOAK_URL = "https://keycloak.cialabs.org"
KEYCLOAK_REALM = "myrealm"
KEYCLOAK_PUBLIC_KEY = """-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxCihGzevvP38UQbRrH/6+NwW+1zSgHZcgV171AUjurD5I+JcaNaGPuUmXEnK1AOb0OtTynItDeniP8zGVX66J01LTfedVzvmZ+hCf7gvNIfR0+BBH0ENC7a251x5RbOiSDg1CAnUY6bsXrtJLsHVDVrp3kVPo1SHXyf+7MsNxXHKVB3ZtbrjiYUqinZUutobeHy1YTZTRJR/88fzLY4sSj+YB87LIO597fh7bbgDgkAkY6w8RYZtRVCVBqcb3J99vckbWxEAU1qSOAuM/Tz+5YOfepXis/jaYUxQUSNzEfCbpMO3I6T//SVAaqtJiAJc3tH9aA36HuPRxr3k1KNTqQIDAQAB\n-----END PUBLIC KEY-----"""
KEYCLOAK_CLIENT_ID = "myclient1"
KEYCLOAK_CLIENT_SECRET = "uPLXk7QiFsXbeXbLaVuiBgTBcgkitqOD"
KEYCLOAK_TOKEN_URL = f"{KEYCLOAK_URL}/realms/{KEYCLOAK_REALM}/protocol/openid-connect/token"

oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl=f"{KEYCLOAK_URL}/realms/{KEYCLOAK_REALM}/protocol/openid-connect/auth",
    tokenUrl=KEYCLOAK_TOKEN_URL
)

USER_DATA = {
    "name": "user",
    "age": 22,
    "place": "bangalore"
}

ADMIN_DATA = {
    "name": "admin",
    "age": 22,
    "place": "bangalore",
    "message": "You are admin"
}

@app.post("/exchange-token")
async def exchange_token(request: Request):
    try:
        data = await request.json()
        auth_code = data.get("code")
        redirect_uri = data.get("redirect_uri")
        
        if not auth_code or not redirect_uri:
            raise HTTPException(
                status_code=400, 
                detail="Authorization code and redirect URI are required"
            )

        # Exchange authorization code for tokens
        token_request_data = {
            "grant_type": "authorization_code",
            "code": auth_code,
            "redirect_uri": redirect_uri,
            "client_id": KEYCLOAK_CLIENT_ID,
            "client_secret": KEYCLOAK_CLIENT_SECRET
        }

        token_response = requests.post(
            KEYCLOAK_TOKEN_URL,
            data=token_request_data,
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )

        if token_response.status_code != 200:
            error_detail = token_response.json().get('error_description', 'Failed to obtain token')
            raise HTTPException(
                status_code=token_response.status_code,
                detail=error_detail
            )
        print(token_response.json())
        # Return the token response to the client
        return token_response.json()

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

async def get_current_user(token: str = Depends(oauth2_scheme)) -> Dict:
    try:
        # Remove 'Bearer ' prefix if present
        if token.startswith('Bearer '):
            token = token[7:]

        payload = jwt.decode(
            token,
            KEYCLOAK_PUBLIC_KEY,
            algorithms=["RS256"],
            audience="account"
        )
        print (payload)
        return payload
    except PyJWTError as e:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )

@app.get("/data")
async def get_data(current_user: dict = Depends(get_current_user)):
    try:
        client_roles = current_user.get("resource_access", {}).get(KEYCLOAK_CLIENT_ID, {}).get("roles", [])
        
        if "admin" in client_roles:
            return ADMIN_DATA
        elif "user" in client_roles:
            return USER_DATA
        else:
            raise HTTPException(status_code=403, detail="Not authorized")
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# # Optional: Add health check endpoint
# @app.get("/health")
# async def health_check():
#     return {"status": "healthy"}