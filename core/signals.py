from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Profile, UserProgress, Puzzle

@receiver(post_save, sender=User)
def initialize_user(sender, instance, created, **kwargs):
    if created:  # Only when a new user is created
        # Create user profile
        Profile.objects.create(user=instance)

        # Create progress for all puzzles
        puzzles = Puzzle.objects.all()
        if puzzles.exists():
            # Bulk create UserProgress for all puzzles
            user_progress = [
                UserProgress(user=instance, puzzle=puzzle)
                for puzzle in puzzles
            ]
            UserProgress.objects.bulk_create(user_progress)
        else:
            # Optional: Log a message if no puzzles exist
            print(f"No puzzles available for user: {instance.username}")
