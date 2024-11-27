from django.urls import path
from . import views


urlpatterns = [
    path('', views.welcome_page, name='welcome'),  # Core-level root path
    path('signup/', lambda request: redirect('/accounts/signup/'), name='core_signup_redirect'),
    #path('verify-email/', views.verify_email, name='verify_email'),
    path('progress/', views.user_progress, name='user_progress'),
    path('submit-answer/', views.submit_answer, name='submit_answer'),
    path('coding/<int:puzzle_id>/', views.coding_view, name='coding_view'),
    path('execute-code/', views.execute_code, name='execute_code'),
    path('coding/', views.coding_redirect, name='coding_redirect'),
    path('leaderboard/', views.leaderboard, name='leaderboard'),
    path('welcome/', views.welcome_page, name='welcome'),
    #path('accounts/confirm-email/<key>/', views.custom_confirm_email_view, name='account_confirm_email'),
    path('competition/<int:pk>/', views.competition_view, name='competition_view'),
    
]