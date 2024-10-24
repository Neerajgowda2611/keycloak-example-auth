from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2AuthorizationCodeBearer
import jwt
from jwt import PyJWTError
from typing import Dict

app = FastAPI()

origins = [
    "*"
]

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Your Keycloak public key for token validation
KEYCLOAK_PUBLIC_KEY = """-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxCihGzevvP38UQbRrH/6+NwW+1zSgHZcgV171AUjurD5I+JcaNaGPuUmXEnK1AOb0OtTynItDeniP8zGVX66J01LTfedVzvmZ+hCf7gvNIfR0+BBH0ENC7a251x5RbOiSDg1CAnUY6bsXrtJLsHVDVrp3kVPo1SHXyf+7MsNxXHKVB3ZtbrjiYUqinZUutobeHy1YTZTRJR/88fzLY4sSj+YB87LIO597fh7bbgDgkAkY6w8RYZtRVCVBqcb3J99vckbWxEAU1qSOAuM/Tz+5YOfepXis/jaYUxQUSNzEfCbpMO3I6T//SVAaqtJiAJc3tH9aA36HuPRxr3k1KNTqQIDAQAB\n-----END PUBLIC KEY-----"""
oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl="https://keycloak.cialabs.org/realms/myrealm/protocol/openid-connect/auth",
    tokenUrl="https://keycloak.cialabs.org/realms/myrealm/protocol/openid-connect/token"
)

# Sample data
USER_DATA = {
    "name": "user",
    "age": 22,
    "place": "bangalore"
}

ADMIN_DATA = {
    "name": "admin",
    "age": 22,
    "place": "bangalore",
    "message": "u are admin"
}

async def get_current_user(token: str = Depends(oauth2_scheme)) -> Dict:
    try:
        # print(token)
        # Decode and validate the token using Keycloak's public key
        payload = jwt.decode(
            token,
            KEYCLOAK_PUBLIC_KEY,
            algorithms=["RS256"],
            audience="account"
        )
        print("Decoded JWT payload:", payload)

        return payload
    except PyJWTError as e :
        print("Error decoding JWT:", str(e)) 
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

@app.get("/data")
async def get_data(current_user: dict = Depends(get_current_user)):
    
    # Check roles from Keycloak token under resource_access -> myclient1 -> roles
    client_roles = current_user.get("resource_access", {}).get("myclient1", {}).get("roles", [])
    
    if "admin" in client_roles:
        return ADMIN_DATA
    elif "user" in client_roles:
        return USER_DATA
    else:
        raise HTTPException(status_code=403, detail="Not authorized")
