from django.contrib.auth.models import AbstractUser
from django.db import models



class User(AbstractUser):
    pass


class Listings(models.Model):
    Title = models.CharField(max_length=64)
    Description = models.TextField()
    Category = models.CharField(max_length=20)
    Start_Bid = models.IntegerField()
    Image_Url = models.URLField()
    is_active = models.BooleanField(default=True)
    Created = models.DateTimeField(null=True)
    Creator = models.ForeignKey(User, null=True, on_delete=models.CASCADE, related_name="listings")

    def __str__(self):
        return f"{self.Title}"

class Comments(models.Model):
    Listing = models.ForeignKey(Listings, on_delete=models.CASCADE, related_name="comments")
    Comment = models.TextField(blank=True)
    Commenter = models.ForeignKey(User, null=True, on_delete=models.CASCADE, related_name="comments")

    def __str__(self):
        return f"{self.Comment}"

class Bidings(models.Model):
    Listing = models.ForeignKey(Listings, on_delete=models.CASCADE, related_name="bidings")
    Max_Bid = models.IntegerField(blank=True)
    Bidder = models.ForeignKey(User, null=True, on_delete=models.CASCADE, related_name="Bidings")

    def __str__(self):
        return f"{self.Max_Bid}"

class Watchlist(models.Model):
    Listing = models.ManyToManyField(Listings, blank=True, related_name="watchlist")
    Watcher = models.ForeignKey(User, on_delete=models.CASCADE, related_name="watchlist")

    def __str__(self):
        return f"{self.id}"