from django.shortcuts import render,redirect
from django.contrib.auth.models import User
from django.contrib.auth import login
from .forms import SignUpForm
from django.core.mail import send_mail


def home(request):
    return render(request, 'core/home.html')


def signup(request):
    if request.method == "POST":
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.set_password(form.cleaned_data['password'])
            user.save()
            login(request, user,backend='django.contrib.auth.backends.ModelBackend')  # Automatically log in after signup

            return redirect('home')
            
    else:
        form = SignUpForm()
    return render(request, 'core/signup.html', {'form': form})


from .models import Profile

def verify_email(request):
    token = request.GET.get('token')
    # Here, implement token validation and mark user as verified
    profile = Profile.objects.filter(verification_token=token).first()
    if profile:
        profile.is_verified = True
        profile.save()
        return redirect('login')
    return render(request, 'core/verification_failed.html')