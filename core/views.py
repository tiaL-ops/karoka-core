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

            send_mail(
                subject="Welcome to Our Platform!",
                message="Thank you for signing up. We're excited to have you on board!",
                from_email="noreply@example.com",
                recipient_list=[user.email],
                fail_silently=False,
            )
            return redirect('home')
            
    else:
        form = SignUpForm()
    return render(request, 'core/signup.html', {'form': form})