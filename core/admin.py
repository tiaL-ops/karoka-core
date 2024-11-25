from django.contrib import admin
from .models import Puzzle, UserProgress,Competition


@admin.register(Puzzle)
class PuzzleAdmin(admin.ModelAdmin):
    list_display = ('title', 'difficulty', 'points', 'created_at', 'competition')  # Show competition
    search_fields = ('title', 'description')  # Enable search for title and description
    list_filter = ('difficulty', 'competition')  # Add competition as a filter


@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'puzzle',
        'solved',
        'attempts_count',
        'score',
        'last_attempted',
        'competition_progress',
    )
    list_filter = ('solved', 'puzzle__competition')  # Add competition filter
    search_fields = ('user__username', 'puzzle__title')

    def competition_progress(self, obj):
        """Calculate the user's progress in the competition linked to this puzzle."""
        if not obj.puzzle.competition:
            return "No Competition"
        
        # Get all puzzles in this competition
        competition_puzzles = obj.puzzle.competition.puzzles.all()
        total_puzzles = competition_puzzles.count()

        # Get solved puzzles by this user in the competition
        solved_puzzles = UserProgress.objects.filter(
            user=obj.user,
            puzzle__in=competition_puzzles,
            solved=True
        ).count()

        # Calculate progress
        if total_puzzles > 0:
            return f"{solved_puzzles}/{total_puzzles} solved ({(solved_puzzles / total_puzzles) * 100:.1f}%)"
        return "No Puzzles"

    competition_progress.short_description = "Competition Progress"


@admin.register(Competition)
class CompetitionAdmin(admin.ModelAdmin):
    list_display = ['name', 'start_date', 'end_date', 'is_active', 'puzzle_count']  # Add puzzle count
    search_fields = ['name']  # Enable search for competition name
    list_filter = ['is_active', 'start_date', 'end_date']  # Add filters for date and status

    def puzzle_count(self, obj):
        """Display the number of puzzles in this competition."""
        return obj.puzzles.count()

    puzzle_count.short_description = 'Puzzle Count'  # Column title in admin
