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
from django.contrib.auth.decorators import login_required
from django.db.models import Sum


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
            
            profile.send_verification_email()  # Send verification email only once
            print("Verification email sent!")
                    

            return render(request, 'core/verify_email_prompt.html')
            
    else:
        form = SignUpForm()
    return render(request, 'core/signup.html', {'form': form})




def verify_email(request):
    token = request.GET.get('token')
    profile = Profile.objects.filter(verification_token=token).first()

    if profile and not profile.is_verified:
        # Mark user as verified
        profile.is_verified = True
        profile.verification_token = None
        profile.save()

        # Set the authentication backend explicitly
        user = profile.user
        user.backend = 'django.contrib.auth.backends.ModelBackend'  # Adjust this if using a custom backend
        login(request, user)

        return redirect('home')  # Redirect to dashboard or welcome page

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
    })


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

@login_required
def submit_answer(request):
    if request.method == "POST":
        data = request.POST
        puzzle_id = data.get('puzzle_id')
        user_solution = data.get('user_solution')

        # Fetch puzzle and ensure progress exists
        puzzle = get_object_or_404(Puzzle, id=puzzle_id)
        if request.user.is_authenticated:
            progress, created = UserProgress.objects.get_or_create(user=request.user, puzzle=puzzle)

            # Check answer
            is_correct = user_solution.strip() == puzzle.answer.strip()
            if is_correct and not progress.solved:
                progress.solved = True
                progress.score = puzzle.points
                progress.save()

            # Update attempt count regardless of correctness
            progress.attempts_count += 1
            progress.save()

            return JsonResponse({'is_correct': is_correct})

    return JsonResponse({'error': 'Invalid request'})


@login_required
def user_progress(request):
    user_progress = UserProgress.objects.get(user=request.user)
    return render(request, 'core/user_progress.html', {'user_progress': user_progress})

@login_required
def welcome_page(request):
    # Fetch all puzzles
    all_puzzles = Puzzle.objects.all()
    user_progress = UserProgress.objects.filter(user=request.user)

    # Get solved and unsolved puzzles
    solved_puzzles = user_progress.filter(solved=True).select_related('puzzle')
    solved_puzzles_ids = solved_puzzles.values_list('puzzle__id', flat=True)
    unsolved_puzzles = all_puzzles.exclude(id__in=solved_puzzles_ids)

    context = {
        'user': request.user,
        'current_challenge': unsolved_puzzles.first(),  # Next unsolved puzzle
        'solved_puzzles': solved_puzzles,
        'unsolved_puzzles': unsolved_puzzles,
    }
    return render(request, 'core/welcome.html', context)


@login_required
def leaderboard(request):
    # Aggregate total scores for all users
    leaderboard_data = (
        UserProgress.objects
        .values('user__username')
        .annotate(total_score=Sum('score'))
        .order_by('-total_score')
    )
    return render(request, 'core/leaderboard.html', {'leaderboard_data': leaderboard_data})


