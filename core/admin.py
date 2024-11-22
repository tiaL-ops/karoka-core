from django.contrib import admin
from .models import Puzzle, UserProgress


@admin.register(Puzzle)
class PuzzleAdmin(admin.ModelAdmin):
    list_display = ('title', 'difficulty', 'points', 'created_at')
    search_fields = ('title', 'description')
    list_filter = ('difficulty',)

@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'puzzle', 'solved', 'attempts_count', 'score', 'last_attempted')
    list_filter = ('solved',)
    search_fields = ('user__username', 'puzzle__title')
