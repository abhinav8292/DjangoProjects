from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from .models import *
from .forms import *


def index(request):
    return render(request, "auctions/index.html", {
        "categories": Listings.objects.values_list('Category', flat=True).distinct(),
        "listings": Listings.objects.all()
    })

def category_Page(request, category_name):
    return render(request, "auctions/index.html", {
        "categories": Listings.objects.values_list('Category', flat=True).distinct(),
        "listings": Listings.objects.filter(Category=category_name)
    })

@login_required
def watchlist(request):
    listings = Watchlist.objects.get(Watcher_id=request.user.id)
    return render(request, "auctions/index.html", {
        "categories": Listings.objects.values_list('Category', flat=True).distinct(),
        "listings": listings.Listing.all()
    })


@login_required
def add_listings(request):
    form = ListingsForm()
    if request.method == 'POST':
        form = ListingsForm(request.POST)
        if form.is_valid:
            listing = form.save(commit=False)
            listing.Creator = request.user
            listing.save()
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/add_listings.html", {
            "categories": Listings.objects.values_list('Category', flat=True).distinct(),
            "form": form
        })


def listing_Page(request, listing_id):
    listing = Listings.objects.get(pk=listing_id)
    form = BidingsForm
    form2 = CommentsForm
    if Comments.objects.filter(Listing_id=listing_id).count() == 0:
        Comment = Comments(Listing=listing, Comment="Currently, No comments exist")
        Comment.save()
    Comment = Comments.objects.filter(Listing_id=listing_id)
    if Bidings.objects.filter(Listing_id=listing_id).count() == 0:
        Bid = Bidings(Listing=listing, Max_Bid=listing.Start_Bid)
        Bid.save()
    Bid = Bidings.objects.get(Listing_id=listing_id)

    if not listing.is_active:
        winner = Bid.Bidder
    else:
        winner = None

    if Watchlist.objects.filter(Watcher_id=request.user.id).filter(Listing=listing).count() != 0:
        Watchlisted = True
    else:
        Watchlisted = False

    if request.method == 'POST':

        form2 = CommentsForm(request.POST)
        new_comment = form2.save(commit=False)
        if 'commented' in request.POST:
            new_comment.Listing = listing
            new_comment.Commenter = request.user
            new_comment.save()

        form = BidingsForm(request.POST)
        current_Bid = form.save(commit=False)
        Bid_placed = False
        success = False
        if 'bid' in request.POST:
            Bid_placed = True
            if current_Bid.Max_Bid > Bid.Max_Bid:
                Bid.Max_Bid = current_Bid.Max_Bid
                Bid.Bidder = request.user
                Bid.save()
                listing.Start_Bid = current_Bid.Max_Bid
                listing.save()
                success = True

        if 'watchlisted' in request.POST:
            user = request.user
            if Watchlist.objects.filter(Watcher_id=user.id).count() == 0:
                watcher = Watchlist(Watcher=user)
                watcher.save()
            watcher = Watchlist.objects.get(Watcher_id=user.id)
            watcher.Listing.add(listing)
            Watchlisted = True

        if 'de_watchlisted' in request.POST:
            items = Watchlist.objects.get(Watcher_id=request.user.id)
            items.Listing.remove(listing)
            Watchlisted = False

        if 'active' in request.POST:
            user = request.user
            if user == listing.Creator:
                listing.is_active = False
                listing.save()
                winner = Bid.Bidder
            else:
                winner = None

        return render(request, "auctions/listing_page.html", {
            "categories": Listings.objects.values_list('Category', flat=True).distinct(),
            "form": form,
            "form2": form2,
            "listing": listing,
            "bid": Bid.Max_Bid,
            "comments": Comment.all,
            "winner": winner,
            "Bid_placed": Bid_placed,
            "success": success,
            "watchlisted": Watchlisted,
        })
    else:
        return render(request, "auctions/listing_page.html", {
            "categories": Listings.objects.values_list('Category', flat=True).distinct(),
            "form": form,
            "form2": form2,
            "bid": Bid.Max_Bid,
            "listing": listing,
            "winner": winner,
            "comments": Comment,
            "watchlisted": Watchlisted,
        })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "auctions/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "auctions/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "auctions/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "auctions/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/register.html")
