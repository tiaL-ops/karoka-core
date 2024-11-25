from django.db import migrations, models
from django.utils.timezone import now
from datetime import timedelta

def set_default_competition(apps, schema_editor):
    # Import models from the historical version
    Competition = apps.get_model('core', 'Competition')
    Puzzle = apps.get_model('core', 'Puzzle')

    # Create a default competition
    default_competition = Competition.objects.create(
        name="Default Competition",
        start_date=now(),
        end_date=now() + timedelta(days=30),
        is_active=True,
    )

    # Assign the default competition to existing puzzles
    Puzzle.objects.filter(competition__isnull=True).update(competition=default_competition)

class Migration(migrations.Migration):
    dependencies = [
        ("core", "0009_merge_20241125_1029"),
    ]

    operations = [
        migrations.AddField(
            model_name="puzzle",
            name="competition",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=models.CASCADE,
                related_name="puzzles",
                to="core.Competition",
            ),
        ),
        migrations.RunPython(set_default_competition),
    ]
