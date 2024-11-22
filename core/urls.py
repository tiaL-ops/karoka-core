from django.urls import path
from . import views

urlpatterns = [
    # Example route
    path('', views.home, name='home'),
    path('signup/', views.signup, name='signup'),
]
