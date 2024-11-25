from django.db import models
from django.contrib.auth.models import User
import secrets
from django.core.mail import send_mail
from django.urls import reverse
from django.utils.http import urlencode



class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    is_verified = models.BooleanField(default=False)
    points = models.IntegerField(default=0)
    progress = models.TextField(blank=True, null=True)
    verification_token = models.CharField(max_length=64, blank=True, null=True)  # Add token field
    

    def __str__(self):
        return f"{self.user.username}'s Profile"

    def generate_verification_token(self):
        """Generate a new verification token."""
        self.verification_token = secrets.token_urlsafe(32)
        self.save()
        print(f"Generated token: {self.verification_token}")

    """
     def send_verification_email(self):
        
        self.generate_verification_token()  # Generate and save the token
        verification_url = reverse('verify_email') + '?' + urlencode({'token': self.verification_token})
        full_url = f"http://127.0.0.1:8000{verification_url}"
        print(f"Verification URL: {full_url}")

        send_mail(
            subject="Verify Your Email",
            message=f"Please verify your email by clicking this link: {full_url}",
            from_email="mianatraapp@gmail.com",
            recipient_list=[self.user.email],
            fail_silently=False,
        )
    """
class Competition(models.Model):
    name = models.CharField(max_length=100)  # e.g., "Week 1", "Week 2"
    story = models.TextField(blank=True, null=True)
    start_date = models.DateTimeField()  # When the competition opens
    end_date = models.DateTimeField()  # When the competition closes
    is_active = models.BooleanField(default=True)  # To manually open/close competitions

    def __str__(self):
        return self.name

    def is_open(self):
        """Check if the competition is open based on the dates."""
        now = timezone.now()
        return self.is_active and self.start_date <= now <= self.end_date



class Puzzle(models.Model):
    DIFFICULTY_CHOICES = [
        ('Easy', 'Easy'),
        ('Medium', 'Medium'),
        ('Hard', 'Hard'),
    ]

    title = models.CharField(max_length=200)  # Puzzle title
    description = models.TextField()  # Puzzle description
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='Easy')  # Difficulty level
    answer = models.CharField(max_length=20)  # Correct answer
    hint = models.TextField(blank=True, null=True)  # Optional hint
    points = models.IntegerField(default=0)  # Points for solving
    competition = models.ForeignKey(
    "Competition",  # Ensure the model is referenced as a string to avoid import issues
    on_delete=models.CASCADE,
    related_name="puzzles",
    blank=True,
    null=True,  # Allow null to avoid default assignment issues
)

    created_at = models.DateTimeField(auto_now_add=True)  # Auto set on creation
    updated_at = models.DateTimeField(auto_now=True)  # Auto update on edit

    def __str__(self):
        return self.title  # Show the title when debugging or in the admin panel

from django.contrib.auth.models import User  # Import the User model

class UserProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='progress')  # Link to the user
    puzzle = models.ForeignKey(Puzzle, on_delete=models.CASCADE, related_name='progress')  # Link to the puzzle
    attempted = models.BooleanField(default=False)  # Track if attempted
    solved = models.BooleanField(default=False)  # Track if solved
    attempts_count = models.IntegerField(default=0)  # Number of attempts
    score = models.IntegerField(default=0)  # Points earned for this puzzle
    last_attempted = models.DateTimeField(auto_now=True)  # Auto update on every attempt
    

    class Meta:
        unique_together = ('user', 'puzzle')  # Prevent duplicate entries for the same user and puzzle

    def __str__(self):
        return f"{self.user.username} - {self.puzzle.title} | Solved: {self.solved}"

    def update_progress(self, is_correct):
        """Update the user's progress."""
        self.attempted = True
        self.attempts_count += 1
        if is_correct and not self.solved:
            self.solved = True
            self.score = self.puzzle.points  # Assign points only on the first correct attempt
        self.save()

