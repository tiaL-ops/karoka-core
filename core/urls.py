from django.urls import path
from . import views


urlpatterns = [
    # Example route
    path('', views.home, name='home'),
    path('signup/', views.signup, name='signup'),
    path('verify-email/', views.verify_email, name='verify_email'),
    path('progress/', views.user_progress, name='user_progress'),
    path('submit-answer/', views.submit_answer, name='submit_answer'),
    path('coding/<int:puzzle_id>/', views.coding_view, name='coding_view'),
    path('execute-code/', views.execute_code, name='execute_code'),
    path('coding/', views.coding_redirect, name='coding_redirect'),
    path('progress/', views.user_progress, name='user_progress'),


]
