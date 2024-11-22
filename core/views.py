from django.shortcuts import render,redirect
from django.contrib.auth.models import User
from django.contrib.auth import login
from .forms import SignUpForm
from django.core.mail import send_mail
from .models import Profile

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