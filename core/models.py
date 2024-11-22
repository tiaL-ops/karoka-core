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

    def send_verification_email(self):
        """Send a verification email to the user's email address."""
        self.generate_verification_token()  # Generate and save the token
        verification_url = reverse('verify_email') + '?' + urlencode({'token': self.verification_token})
        full_url = f"http://127.0.0.1:8000{verification_url}"

        send_mail(
            subject="Verify Your Email",
            message=f"Please verify your email by clicking this link: {full_url}",
            from_email="noreply@example.com",
            recipient_list=[self.user.email],
            fail_silently=False,
        )
