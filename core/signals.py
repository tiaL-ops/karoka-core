from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Profile,UserProgress

@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def create_user_progress(sender, instance, created, **kwargs):
    if created:
        UserProgress.objects.create(user=instance)


@receiver(post_save, sender=User)
def create_user_progress(sender, instance, created, **kwargs):
    if created:  # Only when a new user is created
        # Get all puzzles
        puzzles = Puzzle.objects.all()
        if puzzles.exists():
            for puzzle in puzzles:
                UserProgress.objects.get_or_create(user=instance, puzzle=puzzle)
        else:
            print("No puzzles available to create progress entries.")

