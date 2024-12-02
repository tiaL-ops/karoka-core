from django.shortcuts import render,redirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate,login
from .forms import SignUpForm
from django.core.mail import send_mail
from .models import Profile,Competition,UserProgress
import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import logging
from .models import Puzzle
from django.shortcuts import get_object_or_404
from .models import Puzzle, UserProgress
from django.contrib.auth.decorators import login_required
from django.db.models import Sum
from allauth.account.models import EmailAddress
from django.contrib import messages
from django.contrib.auth.forms import AuthenticationForm
from allauth.account.models import EmailConfirmation
from django.urls import reverse

from allauth.account.views import ConfirmEmailView
from allauth.account.models import EmailConfirmationHMAC
from django.shortcuts import redirect

class CustomConfirmEmailView(ConfirmEmailView):
    def post(self, *args, **kwargs):
        # Confirm the email
        self.object = confirmation = self.get_object()
        confirmation.confirm(self.request)

        # Automatically log in the user after confirmation
        user = confirmation.email_address.user
      
     
        backend = "django.contrib.auth.backends.ModelBackend"  # Replace with your primary backend if different
        user.backend = backend
        login(self.request, user, backend=backend)

        # Redirect to a success page or home
        return redirect(self.get_redirect_url())

    def get_redirect_url(self):
        # Define where to redirect the user after login
        return reverse('welcome')  # Change to your desired URL


def home(request):
    return render(request, 'core/home.html')


def signup(request):
    pass

def custom_login_view(request):
    form = AuthenticationForm(data=request.POST or None)  # Bind data to the form

    if request.method == "POST":
        # Check if the form is valid
        if form.is_valid():
            # Authenticate user
            user = authenticate(
                request, 
                username=form.cleaned_data.get('username'), 
                password=form.cleaned_data.get('password')
            )
            if user is not None:
                login(request, user)
                return redirect('home')  # Redirect to the desired page
            else:
                # Add non-field error for invalid credentials
                form.add_error(None, "Invalid username or password.")
        else:
            # Form is invalid; Django will attach field-specific errors
            print("Form is invalid. Errors:", form.errors)
            messages.error(request, "There was an error with your login details.")

    return render(request, 'account/login.html', {'form': form})






#i don't think i used this 
def verify_email(request):
    token = request.GET.get('token')
    profile = Profile.objects.filter(verification_token=token).first()

    if profile and not profile.is_verified:
        # Update the profile
        profile.is_verified = True
        profile.verification_token = None
        profile.save()

        # Update the EmailAddress model
        try:
            email_address = EmailAddress.objects.get(user=profile.user, email=profile.user.email)
            email_address.verified = True
            email_address.save()
            print(f"Email address {email_address.email} verified.")
        except EmailAddress.DoesNotExist:
            print(f"No EmailAddress entry found for user {profile.user.username}.")

        # Log the user in
        user = profile.user
        user.backend = 'django.contrib.auth.backends.ModelBackend'
        login(request, user)

        return redirect('home')  # Redirect to your desired page

    return render(request, 'core/verification_failed.html')
"""
def coding_redirect(request):
    # Redirect to the first puzzle if no ID is provided
    first_puzzle = Puzzle.objects.first()
    if first_puzzle:
        return redirect('coding_view', puzzle_id=first_puzzle.id)
    return render(request, 'core/no_puzzles.html')  # Show a message if no puzzles exist
"""

@login_required
def coding_redirect(request):
    # Redirect to the first puzzle or any default coding page
    return redirect(reverse('coding_view', kwargs={'puzzle_id': 1}))



@login_required
def coding_view(request, puzzle_id):
    # Fetch puzzle
    puzzle = get_object_or_404(Puzzle, id=puzzle_id)

    competition_id = puzzle.competition.id 

    # Create progress entry if it doesn't exist
    if request.user.is_authenticated:
        progress, created = UserProgress.objects.get_or_create(user=request.user, puzzle=puzzle)
        if created:
            print(f"Progress created for {request.user.username} on {puzzle.title}")

    # Calculate progress
    total_puzzles = Puzzle.objects.count()
    solved_puzzles = UserProgress.objects.filter(user=request.user, solved=True).count()
    progress_percentage = (solved_puzzles / total_puzzles) * 100 if total_puzzles else 0

    # Render template
    return render(request, 'core/coding.html', {
        'puzzle': puzzle,
        'progress': progress_percentage,
        'next_puzzle': Puzzle.objects.filter(id__gt=puzzle.id).first(),  # Link to next puzzle
        'competition_id': competition_id,
    })


logger = logging.getLogger(__name__)



def submit_answer(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            puzzle_id = data.get('puzzle_id')
            print(f"Received puzzle_id in submit_answer: {puzzle_id}")  # Debugging
            user_solution = data.get('user_solution', '').strip()

            # Fetch the puzzle
            puzzle = get_object_or_404(Puzzle, id=puzzle_id)

            # Check if the solution is correct
            is_correct = user_solution == puzzle.answer.strip()

            # Update UserProgress for authenticated users
            if request.user.is_authenticated:
                progress, created = UserProgress.objects.get_or_create(
                    user=request.user,
                    puzzle=puzzle
                )

                # Update the progress
                if not progress.solved and is_correct:
                    progress.solved = True
                    progress.score = puzzle.points  # Assuming points are in the Puzzle model
                progress.attempts_count += 1
                progress.save()

            return JsonResponse({'is_correct': is_correct})
        except Exception as e:
            print(f"Error in submit_answer: {e}")  # Debugging
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Invalid request method'}, status=400)


import json
import requests
from django.http import JsonResponse

def execute_code(request):
    if request.method != 'POST':
        return JsonResponse({'output': None, 'error': 'Invalid request method'}, status=405)
    
    try:
        # Parse the JSON data from the request body
        data = json.loads(request.body)
        language = data.get('language', 'python')  # Default to Python
        code = data.get('code')

        # Ensure code is provided
        if not code:
            return JsonResponse({'output': None, 'error': 'No code provided'}, status=400)
        
        # Validate code length (optional, to prevent abuse)
        if len(code) > 5000:  # Example limit: 5000 characters
            return JsonResponse({'output': None, 'error': 'Code exceeds maximum allowed length'}, status=400)

        # Call the Piston API to execute the code with a timeout
        try:
            response = requests.post(
                'https://emkc.org/api/v2/piston/execute',
                json={
                    "language": language,
                    "version": "3.10.0",  # Adjust version if needed
                    "files": [{"name": "main.py", "content": code}]
                },
                timeout=10  # Timeout in seconds
            )
            response.raise_for_status()  # Raise an exception for HTTP errors
        except requests.exceptions.Timeout:
            return JsonResponse({'output': None, 'error': 'Execution timed out'}, status=504)
        except requests.exceptions.RequestException as e:
            return JsonResponse({'output': None, 'error': f'Error communicating with code execution service: {str(e)}'}, status=500)

        # Parse the response from the Piston API
        result = response.json()
        output = result.get('run', {}).get('output', '')
        error = result.get('run', {}).get('stderr', '')

        return JsonResponse({'output': output, 'error': error})
    
    except json.JSONDecodeError:
        return JsonResponse({'output': None, 'error': 'Invalid JSON input'}, status=400)
    except Exception as e:
        return JsonResponse({'output': None, 'error': f'An unexpected error occurred: {str(e)}'}, status=500)


def user_progress(request):
    if request.user.is_authenticated:
        progress = UserProgress.objects.filter(user=request.user)
        return render(request, 'core/user_progress.html', {'progress': progress})
    return redirect('login')



@login_required
def user_progress(request):
    user_progress = UserProgress.objects.get(user=request.user)
    return render(request, 'core/user_progress.html', {'user_progress': user_progress})

@login_required
def welcome_page(request):
    # Fetch all puzzles
    all_puzzles = Puzzle.objects.all()
    user_progress = UserProgress.objects.filter(user=request.user)

    active_competition = Competition.objects.filter(is_active=True).first()
    past_competitions = Competition.objects.filter(is_active=False)
    # Get solved and unsolved puzzles
    solved_puzzles = user_progress.filter(solved=True).select_related('puzzle')
    solved_puzzles_ids = solved_puzzles.values_list('puzzle__id', flat=True)
    unsolved_puzzles = all_puzzles.exclude(id__in=solved_puzzles_ids)

    context = {
        'user': request.user,
        'current_challenge': unsolved_puzzles.first(),  # Next unsolved puzzle
        'solved_puzzles': solved_puzzles,
        'unsolved_puzzles': unsolved_puzzles,
        'active_competition': active_competition,
        'past_competitions': past_competitions,
    }
    return render(request, 'core/welcome.html', context)


@login_required
def leaderboard(request):
    # Fetch the active competition
    active_competition = Competition.objects.filter(is_active=True).first()
    
    if not active_competition:
        return render(request, 'core/leaderboard.html', {
            'leaderboard_data': [],
            'message': "No active competition at the moment.",
        })

    # Aggregate total scores for all users, filtering by active competition
    leaderboard_data = (
        UserProgress.objects
        .filter(puzzle__competition=active_competition)  # Only include puzzles from the active competition
        .values('user__username')
        .annotate(total_score=Sum('score'))
        .order_by('-total_score')
    )

    return render(request, 'core/leaderboard.html', {
        'leaderboard_data': leaderboard_data,
        'active_competition': active_competition,
    })


def competition_view(request, pk):
    # Fetch the specific competition
    competition = get_object_or_404(Competition, pk=pk)
    past_competitions = Competition.objects.filter(is_active=False)

    # Fetch all puzzles for the competition
    puzzles = competition.puzzles.all()

    # Fetch user progress for the current user
    user_progress = UserProgress.objects.filter(user=request.user)

    # Filter to get only solved puzzles
    solved_puzzles = user_progress.filter(solved=True).select_related('puzzle')
    solved_puzzles_ids = solved_puzzles.values_list('puzzle__id', flat=True)

    # Pass data to the template
    return render(request, 'core/competition.html', {
        'competition': competition,
        'puzzles': puzzles,
        'solved_puzzles_ids': solved_puzzles_ids,
        'past_competitions': past_competitions,
        'solved_puzzles': solved_puzzles,  # Only pass solved puzzle IDs
    })


