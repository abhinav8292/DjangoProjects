# Generated by Django 3.1.2 on 2020-11-09 19:42

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('auctions', '0006_auto_20201110_0108'),
    ]

    operations = [
        migrations.RenameField(
            model_name='listings',
            old_name='Categories',
            new_name='Category',
        ),
    ]