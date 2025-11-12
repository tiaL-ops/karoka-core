from firebase_functions import https_fn, params
from firebase_admin import initialize_app
import openai
import os
# Initialize Firebase Admin SDK
initialize_app()

# Set the OpenAI API key from the environment variables.
import os

openai.api_key = os.environ.get("OPENAI_KEY")






@https_fn.on_request()
def hello_world(req: https_fn.Request) -> https_fn.Response:
    """A simple function that returns a greeting."""
    return https_fn.Response("Hello Landy!", status=200)






@https_fn.on_request(secrets=[params.SecretParam("OPENAI_KEY")])
def generate_karoka_profile(req: https_fn.Request) -> https_fn.Response:
    # Handle CORS preflight
    if req.method == "OPTIONS":
        return https_fn.Response(
            "",
            status=204,
            headers={
                "Access-Control-Allow-Origin": "*",  # For dev only; use specific origin in prod
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        )

    try:
        data = req.get_json(silent=True) or {}
        top3 = data.get("top3", [])

        if not top3:
            return https_fn.Response("Missing 'top3'", status=400)

        types_str = ", ".join([f"{t['type'].upper()}: {t['percent']}%" for t in top3])




        prompt = f"""
        You are Karoka, a personality-driven AI mentor inspired by Kuroko no Basket.

        The learner's top 3 types are:
        {types_str}

        Return a JSON object with the following fields only:
        - "topType": (string, e.g. "mirror")
        - "alsoTypes": (array of the other two types, lowercase, e.g. ["finisher", "strategist"])
        - "identity": (a 1-line sentence that MUST begin with: "You're a [topType]-type  — , e.g. "You're a Kise-type — observant, expressive, and socially smart.")
        - "learningStyle": (short paragraph explaining how they learn best)
        - "affirmation": (1 motivational sentence)
        - "careers": (array of 4 job titles that suit them)

        Example JSON:
        {{
        "topType": "mirror",
        "alsoTypes": ["finisher", "strategist"],
        "identity": "...",
        "learningStyle": "...",
        "affirmation": "...",
        "careers": ["UX Designer", "Public Speaker"]
        }}

        ONLY return the JSON. No formatting, no markdown, no explanation.
        """


        
        # Call OpenAI's API to generate the profile.
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}]
        )

        result = response.choices[0].message.content
        

        return https_fn.Response(
            result,
            status=200,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
            }
        )

    except Exception as e:
        return https_fn.Response(
            f"Error: {str(e)}",
            status=500,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
            }
        )
