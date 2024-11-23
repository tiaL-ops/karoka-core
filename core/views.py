from django.shortcuts import render,redirect
from django.contrib.auth.models import User
from django.contrib.auth import login
from .forms import SignUpForm
from django.core.mail import send_mail
from .models import Profile
import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import logging
from .models import Puzzle
from django.shortcuts import get_object_or_404
from .models import Puzzle, UserProgress


def home(request):
    return render(request, 'core/home.html')


def signup(request):
    if request.method == "POST":
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.set_password(form.cleaned_data['password'])
            user.save()

            print(f"User created: {user.username}, Email: {user.email}")
            send_mail(
                subject="Welcome to Our Platform!",
                message="Thank you for signing up. We're excited to have you on board!",
                from_email="noreply@example.com",
                recipient_list=[user.email],
                fail_silently=False,
            )
            profile, created = Profile.objects.get_or_create(user=user)
            if created: 
                print(f"Profile created for: {user.username}") # If the Profile was newly created, send verification email
                profile.send_verification_email()
            
                print("Verification email sent!")
            else:
                print(f"Profile already exists for user: {user.username}")
                if not profile.is_verified:
                    print("Re-sending verification email...")
                    profile.send_verification_email()

            return render(request, 'core/verify_email_prompt.html')
            
    else:
        form = SignUpForm()
    return render(request, 'core/signup.html', {'form': form})




def verify_email(request):
    token = request.GET.get('token')
    # Here, implement token validation and mark user as verified
    profile = Profile.objects.filter(verification_token=token).first()
    if profile:
        profile.is_verified = True
        profile.verification_token = None 
        profile.save()
        return redirect('login')
    return render(request, 'core/verification_failed.html')

"""
def coding_redirect(request):
    # Redirect to the first puzzle if no ID is provided
    first_puzzle = Puzzle.objects.first()
    if first_puzzle:
        return redirect('coding_view', puzzle_id=first_puzzle.id)
    return render(request, 'core/no_puzzles.html')  # Show a message if no puzzles exist
"""


def coding_redirect(request):
    # Redirect to the first puzzle or any default coding page
    return redirect(reverse('coding_view', kwargs={'puzzle_id': 1}))



def coding_view(request, puzzle_id):
    puzzle = get_object_or_404(Puzzle, id=puzzle_id)
    return render(request, 'core/coding.html', {'puzzle': puzzle})


logger = logging.getLogger(__name__)

@csrf_exempt
def execute_code(request):
    if request.method == 'POST':
        try:
            # Parse the JSON data from the request body
            data = json.loads(request.body)
            language = data.get('language', 'python')  # Default to Python if not specified
            code = data.get('code')

            # Ensure code is provided
            if not code:
                return JsonResponse({'output': None, 'error': 'No code provided'}, status=400)

            # Call the Piston API to execute the code
            response = requests.post(
                'https://emkc.org/api/v2/piston/execute',
                json={
                    "language": language,
                    "version": "3.10.0",  # Python version (adjust as needed)
                    "files": [{"name": "main.py", "content": code}]
                }
            )
            result = response.json()

            # Extract the output and errors from the response
            output = result.get('run', {}).get('output', '')
            error = result.get('run', {}).get('stderr', '')

            return JsonResponse({'output': output, 'error': error})
        except Exception as e:
            return JsonResponse({'output': None, 'error': str(e)}, status=500)
    return JsonResponse({'output': None, 'error': 'Invalid request method'}, status=405)

def user_progress(request):
    if request.user.is_authenticated:
        progress = UserProgress.objects.filter(user=request.user)
        return render(request, 'core/user_progress.html', {'progress': progress})
    return redirect('login')

@csrf_exempt
def submit_answer(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            puzzle_id = data.get('puzzle_id')
            print(f"Received puzzle_id in submit_answer: {puzzle_id}")  # Debugging
            user_solution = data.get('user_solution', '').strip()

            puzzle = get_object_or_404(Puzzle, id=puzzle_id)
            is_correct = user_solution == puzzle.answer.strip()

            return JsonResponse({'is_correct': is_correct})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)