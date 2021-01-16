from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("<int:listing_id>", views.listing_Page, name="listing_Page"),
    path("Category/<str:category_name>", views.category_Page, name="Category"),
    path("watchlist", views.watchlist, name="watchlist"),
    path("add_listings", views.add_listings, name="add_listings"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
]
