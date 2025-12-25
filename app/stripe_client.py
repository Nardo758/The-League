import os
import httpx
import stripe


async def get_stripe_credentials():
    hostname = os.environ.get("REPLIT_CONNECTORS_HOSTNAME")
    repl_identity = os.environ.get("REPL_IDENTITY")
    web_repl_renewal = os.environ.get("WEB_REPL_RENEWAL")

    if repl_identity:
        x_replit_token = f"repl {repl_identity}"
    elif web_repl_renewal:
        x_replit_token = f"depl {web_repl_renewal}"
    else:
        raise ValueError("X_REPLIT_TOKEN not found for repl/depl")

    is_production = os.environ.get("REPLIT_DEPLOYMENT") == "1"
    target_environment = "production" if is_production else "development"

    url = f"https://{hostname}/api/v2/connection"
    params = {
        "include_secrets": "true",
        "connector_names": "stripe",
        "environment": target_environment
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            params=params,
            headers={
                "Accept": "application/json",
                "X_REPLIT_TOKEN": x_replit_token
            }
        )
        data = response.json()

    connection_settings = data.get("items", [{}])[0]
    settings = connection_settings.get("settings", {})

    if not settings.get("publishable") or not settings.get("secret"):
        raise ValueError(f"Stripe {target_environment} connection not found")

    return {
        "publishable_key": settings["publishable"],
        "secret_key": settings["secret"]
    }


async def get_stripe_client():
    credentials = await get_stripe_credentials()
    stripe.api_key = credentials["secret_key"]
    return stripe


async def get_publishable_key():
    credentials = await get_stripe_credentials()
    return credentials["publishable_key"]
